import os
import json
import pendulum
from airflow.decorators import dag, task
from airflow.models import Variable

DAG_DIR = os.path.dirname(os.path.abspath(__file__))
REQUIREMENTS_PATH = os.path.join(DAG_DIR, "requirements.txt")

# Read and parse requirements, excluding airflow itself
with open(REQUIREMENTS_PATH, "r", encoding="utf-8") as f:
    REQUIREMENTS = [
        line.strip()
        for line in f
        if line.strip()
        and not line.startswith("#")
        and "apache-airflow" not in line.lower()
    ]

# Set this to a number (e.g. 50) to limit the number of CSW records processed during testing.
# Set to None or 0 to process all records.
GEOEXPLORER_SYNC_LIMIT = None

# Set to True to skip the Mistral embedding process (useful for testing metadata scraping).
GEOEXPLORER_SKIP_EMBEDDING = False

@task.virtualenv(requirements=REQUIREMENTS)
def init_db() -> None:
    """
    Ensures the geoexplorer schema and embeddings table exist.
    """
    from airflow.providers.postgres.hooks.postgres import PostgresHook

    pg_hook = PostgresHook(postgres_conn_id="postgres_conn_geodata")
    conn = pg_hook.get_conn()
    
    with conn.cursor() as cur:
        # Create schema if it doesn't exist
        cur.execute("CREATE SCHEMA IF NOT EXISTS geoexplorer;")
        # Enable pgvector
        cur.execute("CREATE EXTENSION IF NOT EXISTS vector;")
        # Create table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS geoexplorer.embeddings (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                slug TEXT UNIQUE,
                identifier TEXT,
                heading TEXT,
                dataset_info JSONB,
                embedding VECTOR(1024),
                tsne_x FLOAT8,
                tsne_y FLOAT8,
                last_metadata_update TIMESTAMP,
                last_data_update TIMESTAMP,
                created_in_db_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_sync_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        # Index for identifier for faster lookups
        cur.execute("CREATE INDEX IF NOT EXISTS idx_geo_embeddings_identifier ON geoexplorer.embeddings(identifier);")
        
        # Create sync history table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS geoexplorer.sync_history (
                id SERIAL PRIMARY KEY,
                dag_run_id TEXT,
                sync_started_at TIMESTAMP,
                sync_finished_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                total_csw_records INT,
                new_records_found INT,
                updated_records_found INT,
                successfully_processed INT
            );
        """)

        # 1. Create a no-data result view for Hasura to understand the return shape
        cur.execute("""
            CREATE OR REPLACE VIEW geoexplorer.match_embeddings_result AS
            SELECT
                s.id,
                s.slug,
                s.heading,
                NULL::double precision AS similarity,
                s.dataset_info
            FROM geoexplorer.embeddings s
            WHERE false;
        """)

        # 2. Drop the old function because the return type is changing
        cur.execute("DROP FUNCTION IF EXISTS geoexplorer.match_embeddings(vector(1024), float, int);")

        # 3. Recreate the function with similarity
        cur.execute("""
            CREATE OR REPLACE FUNCTION geoexplorer.match_embeddings(
                query_embedding vector(1024),
                match_threshold float,
                match_count int
            )
            RETURNS SETOF geoexplorer.match_embeddings_result
            LANGUAGE plpgsql
            STABLE
            AS $$
            BEGIN
                RETURN QUERY
                SELECT
                    s.id,
                    s.slug,
                    s.heading,
                    ((s.embedding <#> query_embedding) * -1)::double precision AS similarity,
                    s.dataset_info
                FROM geoexplorer.embeddings s
                WHERE (s.embedding <#> query_embedding) * -1 > match_threshold
                ORDER BY s.embedding <#> query_embedding
                LIMIT match_count;
            END;
            $$;
        """)
        
    conn.commit()
    conn.close()

@task.virtualenv(requirements=REQUIREMENTS)
def sync_csw_records(limit: int = None) -> dict:
    """
    Fetches CSW records and determines which ones need updating.
    Returns a dictionary with records to process and stats.
    """
    import requests
    import xmltodict
    from airflow.providers.postgres.hooks.postgres import PostgresHook
    from datetime import datetime

    # Using ISO-19139 (GMD) schema for much better discovery of service URLs
    CSW_URL = "https://gdi.berlin.de/geonetwork/srv/ger/csw"
    GMD_SCHEMA = "http://www.isotc211.org/2005/gmd"
    
    def get_txt(node):
        if node is None: return None
        if isinstance(node, str): return node.strip()
        if isinstance(node, dict):
            if "#text" in node: return node["#text"].strip()
            for k in ["gco:CharacterString", "gmd:LocalisedCharacterString", "gmx:Anchor", "gco:DateTime", "gco:Date", "gmd:URL"]:
                if k in node: return get_txt(node[k])
            for v in node.values():
                if isinstance(v, (str, dict)):
                    t = get_txt(v)
                    if t: return t
        return None

    def as_list(x):
        if x is None: return []
        return x if isinstance(x, list) else [x]

    def fetch_all_csw_records(limit=None):
        records = []
        start_position = 1
        max_records = 100
        
        # Get total matched first
        params = {
            "service": "CSW", "version": "2.0.2", "request": "GetRecords",
            "resultType": "results", "elementSetName": "full", "typeNames": "csw:Record",
            "OUTPUTSCHEMA": GMD_SCHEMA, "maxRecords": 1, "startPosition": 1
        }
        try:
            res = requests.get(CSW_URL, params=params, timeout=60)
            data = xmltodict.parse(res.text)
            total_matched = int(data['csw:GetRecordsResponse']['csw:SearchResults']['@numberOfRecordsMatched'])
        except:
            total_matched = 10000 # Fallback

        while start_position <= total_matched:
            params["maxRecords"] = max_records
            params["startPosition"] = start_position
            response = requests.get(CSW_URL, params=params, timeout=60)
            response.raise_for_status()
            data = xmltodict.parse(response.text)
            
            search_results = data['csw:GetRecordsResponse'].get('csw:SearchResults', {})
            gmd_records = as_list(search_results.get('gmd:MD_Metadata', []))
            
            if not gmd_records:
                break
                
            for md in gmd_records:
                # Extract fields equivalent to previous DC logic but from GMD
                identifier = get_txt(md.get("gmd:fileIdentifier"))
                if not identifier: continue
                
                # Metadata update date
                metadata_date = get_txt(md.get("gmd:dateStamp"))
                
                # Extract Title & Abstract
                title = ""
                abstract = ""
                identification = as_list(md.get("gmd:identificationInfo", []))
                for info in identification:
                    id_block = info.get("gmd:MD_DataIdentification") or info.get("srv:SV_ServiceIdentification")
                    if id_block:
                        if not title:
                            title = get_txt(id_block.get("gmd:citation", {}).get("gmd:CI_Citation", {}).get("gmd:title"))
                        if not abstract:
                            abstract = get_txt(id_block.get("gmd:abstract"))

                # Check if it is a service record (Filter)
                is_service = False
                hierarchy_level_node = md.get("gmd:hierarchyLevel")
                hierarchy_level = get_txt(hierarchy_level_node) if hierarchy_level_node else None
                if hierarchy_level == "service":
                    is_service = True
                else:
                    for info in identification:
                        if "srv:SV_ServiceIdentification" in info:
                            is_service = True
                            break
                if not is_service:
                    continue

                # Extract CSW keywords (subject)
                keywords = []
                for info in identification:
                    id_block = info.get("gmd:MD_DataIdentification") or info.get("srv:SV_ServiceIdentification")
                    if id_block:
                        dk_list = as_list(id_block.get("gmd:descriptiveKeywords", []))
                        for dk in dk_list:
                            md_kw = dk.get("gmd:MD_Keywords", {})
                            kw_list = as_list(md_kw.get("gmd:keyword", []))
                            for kw in kw_list:
                                txt = get_txt(kw)
                                if txt:
                                    keywords.append(txt)

                # Extract URIs
                uris = []
                # 1. From distributionInfo
                dist = md.get("gmd:distributionInfo", {}).get("gmd:MD_Distribution", {})
                for to in as_list(dist.get("gmd:transferOptions", [])):
                    for ol in as_list(to.get("gmd:MD_DigitalTransferOptions", {}).get("gmd:onLine", [])):
                        res_block = ol.get("gmd:CI_OnlineResource", {})
                        url = get_txt(res_block.get("gmd:linkage"))
                        desc = get_txt(res_block.get("gmd:description"))
                        if url: uris.append({"url": url, "description": desc})
                
                # 2. From service identification (connect points)
                for info in identification:
                    srv_block = info.get("srv:SV_ServiceIdentification")
                    if srv_block:
                        for op in as_list(srv_block.get("srv:containsOperations", [])):
                            for cp in as_list(op.get("srv:SV_OperationMetadata", {}).get("srv:connectPoint", [])):
                                res_block = cp.get("gmd:CI_OnlineResource", {})
                                url = get_txt(res_block.get("gmd:linkage"))
                                if url: uris.append({"url": url, "description": "Service Endpoint"})

                # Check if supported
                is_supported = False
                for uri in uris:
                    u = (uri["url"] or "").lower()
                    if "service=wfs" in u or "service=wms" in u or "/wfs/" in u or "/wms/" in u:
                        is_supported = True
                        break
                
                if is_supported:
                    records.append({
                        "identifier": identifier,
                        "date": metadata_date,
                        "modified": metadata_date, # Fallback in GMD
                        "title": title,
                        "abstract": abstract,
                        "description": abstract,
                        "URI": uris,
                        "type": "service",
                        "subject": keywords
                    })
                
                if limit and len(records) >= limit:
                    return records
            
            start_position += max_records
        return records

    all_records = fetch_all_csw_records(limit=limit)
    
    pg_hook = PostgresHook(postgres_conn_id="postgres_conn_geodata")
    existing_info = pg_hook.get_records("SELECT identifier, last_metadata_update, last_data_update FROM geoexplorer.embeddings")
    existing_map = {row[0]: (row[1], row[2]) for row in existing_info if row[0] is not None}
    
    to_process = []
    new_count, update_count = 0, 0
    
    for record in all_records:
        identifier = record['identifier']
        incoming_meta_str = record.get('date')
        incoming_data_str = record.get('modified')
        
        is_new = identifier not in existing_map
        is_update = False
        
        if not is_new:
            stored_meta, stored_data = existing_map[identifier]
            for inc_str, stored in [(incoming_meta_str, stored_meta), (incoming_data_str, stored_data)]:
                if inc_str:
                    try:
                        inc_dt = datetime.fromisoformat(inc_str.replace('Z', '+00:00')).replace(tzinfo=None)
                        if stored is None or inc_dt > stored.replace(tzinfo=None):
                            is_update = True
                            break
                    except: pass
        
        if is_new or is_update:
            to_process.append(record)
            if is_new: new_count += 1
            else: update_count += 1
    
    print(f"Sync Discovery Summary:\n- Supported CSW records: {len(all_records)}\n- New: {new_count}, Updated: {update_count}")
    return {"records": to_process, "stats": {"total_csw": len(all_records), "new": new_count, "updated": update_count}}

@task.virtualenv(requirements=REQUIREMENTS)
def process_and_embed(sync_data: dict, skip_embedding: bool = False) -> int:
    import os
    import json
    import requests
    import xml.etree.ElementTree as ET
    import html2text
    import re
    from urllib.parse import urlparse, urlunparse
    from owslib.wfs import WebFeatureService
    from owslib.wms import WebMapService
    from mistralai.client import Mistral
    from airflow.models import Variable
    from airflow.providers.postgres.hooks.postgres import PostgresHook
    from datetime import datetime
    import pendulum

    records = sync_data["records"]
    if not records: return 0

    MISTRAL_API_KEY = Variable.get("MISTRAL_API_KEY")
    client = Mistral(api_key=MISTRAL_API_KEY)
    pg_hook = PostgresHook(postgres_conn_id="postgres_conn_geodata")
    conn = pg_hook.get_conn()
    cur = conn.cursor()
    
    success_total = 0
    CLEAN_RE = re.compile(r'- \[WFS\]| - \[WMS\]| \[WFS\]| \[WMS\]| \(Umweltatlas\)| \(Linien\)')

    def clean_title(t):
        if not t: return ""
        return CLEAN_RE.sub('', t).strip()

    def strip_query(url):
        parsed = urlparse(url)
        return urlunparse(parsed._replace(query="", fragment=""))

    KEYWORDS_TO_REMOVE = {
        "berlin",
        "geodaten",
        "opendata",
        "open data",
        "karten",
        "umweltatlas",
        "infofeatureaccessservice",
        "infomapaccessservice",
        "features",
        "sachdaten",
        "gdi-be"
        "wms",
        "wfs"
    }

    def clean_keywords(keywords):
        if not keywords: return []
        cleaned = []
        for key in keywords:
            if key is None: continue
            s = str(key).strip().lower()
            if s and s not in KEYWORDS_TO_REMOVE:
                cleaned.append(s)
        return cleaned

    def get_html_as_markdown(url, target_class=None):
        try:
            res = requests.get(url, timeout=30)
            res.raise_for_status()
            if "text/html" not in res.headers.get("Content-Type", "").lower(): return None
            
            html_content = res.text
            if target_class:
                from html.parser import HTMLParser
                class DivContentParser(HTMLParser):
                    def __init__(self, target_class):
                        super().__init__()
                        self.target_class = " ".join(target_class.split())
                        self.in_div = False
                        self.div_depth = 0
                        self.extracted_html = []

                    def handle_starttag(self, tag, attrs):
                        attrs_dict = dict(attrs)
                        cls = attrs_dict.get('class', '')
                        cls_norm = " ".join(cls.split())
                        if tag == 'div' and cls_norm == self.target_class:
                            self.in_div = True
                            self.div_depth = 0
                        
                        if self.in_div:
                            if tag == 'div':
                                self.div_depth += 1
                            attr_str = "".join([f' {k}="{v}"' for k, v in attrs])
                            self.extracted_html.append(f"<{tag}{attr_str}>")

                    def handle_endtag(self, tag):
                        if self.in_div:
                            self.extracted_html.append(f"</{tag}>")
                            if tag == 'div':
                                self.div_depth -= 1
                                if self.div_depth == 0:
                                    self.in_div = False

                    def handle_data(self, data):
                        if self.in_div:
                            self.extracted_html.append(data)

                parser = DivContentParser(target_class)
                parser.feed(html_content)
                extracted = "".join(parser.extracted_html)
                if not extracted:
                    return None
                html_content = extracted

            h = html2text.HTML2Text()
            h.ignore_links, h.ignore_images, h.body_width = False, True, 0
            md = h.handle(html_content)
            md = re.sub(r'\n{3,}', '\n\n', md)
            
            md = re.sub(r'^Technische Beschreibung\s*\n\s*\n\s*', '', md, count=1, flags=re.IGNORECASE)
            md = re.sub(r'^Inhaltliche Beschreibung\s*\n\s*\n\s*', '', md, count=1, flags=re.IGNORECASE)
            return md.strip()
        except Exception as e:
            print(f"Error scraping {url}: {e}")
            return None

    def get_attribute_descriptions(wfs_url, layer_name):
        docs = {}
        try:
            params = {"SERVICE": "WFS", "REQUEST": "DescribeFeatureType", "VERSION": "2.0.0", "TYPENAME": layer_name}
            resp = requests.get(wfs_url, params=params, timeout=30)
            tree = ET.fromstring(resp.content)
            ns = {"xsd": "http://www.w3.org/2001/XMLSchema"}
            local = layer_name.split(":")[-1]
            el = next((e for e in tree.findall(".//xsd:element", ns) if e.get("name") == local), None)
            tn = el.get("type") if el is not None else local + "Type"
            tl = tn.split(":")[-1]
            ct = next((c for c in tree.findall(".//xsd:complexType", ns) if c.get("name") == tl), None)
            if ct is not None:
                for p in ct.findall(".//xsd:element", ns):
                    name = p.get("name")
                    ann = p.find("xsd:annotation/xsd:documentation", ns)
                    if name: docs[name] = ann.text.strip() if ann is not None and ann.text else ""
        except: pass
        return docs

    for record in records:
        identifier = record['identifier']
        title_main = clean_title(record.get('title', ''))
        service_name = record.get('title', '').replace('- [WFS]', '').replace('- [WMS]', '').replace(' [WFS]', '').replace(' [WMS]', '').strip()
        description_main = record.get('description', '')
        in_meta_str, in_data_str = record.get('date'), record.get('modified')
        
        wfs_url, wms_url, markdown_text = None, None, None
        for uri in record.get('URI', []):
            url = uri.get('url') or ''
            if "service=wfs" in url.lower() or "/wfs/" in url.lower(): wfs_url = strip_query(url)
            elif "service=wms" in url.lower() or "/wms/" in url.lower(): wms_url = url
            
            desc = uri.get('description') or ''
            is_tech = desc == "Technische Beschreibung"
            is_inhalt = desc == "Inhaltliche Beschreibung" and "umweltatlas" in url.lower()
            
            if (is_tech or is_inhalt) and not url.lower().endswith(".pdf"):
                target_cls = "modul-text_bild  imagealignleft teaser " if is_inhalt else None
                markdown_text = get_html_as_markdown(url, target_class=target_cls)
        
        service_type = "WFS" if wfs_url else ("WMS" if wms_url else "Unknown")
        service_url = wfs_url or wms_url
        if service_type == "Unknown": continue

        layers = []
        if service_type == "WFS":
            try:
                wfs = WebFeatureService(url=wfs_url, timeout=30)
                for ln in wfs.contents:
                    f = wfs.contents[ln]
                    l_keywords = clean_keywords(f.keywords) if hasattr(f, "keywords") else []
                    layers.append({
                        "typeName": ln,
                        "title": clean_title(f.title),
                        "abstract": f.abstract,
                        "keywords": l_keywords,
                        "attributes": get_attribute_descriptions(wfs_url, ln)
                    })
            except: pass
        elif service_type == "WMS":
            try:
                wms = WebMapService(url=wms_url, timeout=30)
                for ln in wms.contents:
                    l = wms.contents[ln]
                    l_keywords = clean_keywords(l.keywords) if hasattr(l, "keywords") else []
                    layers.append({
                        "typeName": ln,
                        "title": clean_title(l.title),
                        "abstract": l.abstract,
                        "keywords": l_keywords,
                        "attributes": {}
                    })
            except: pass

        if not layers: layers = [None]
        
        cur.execute("DELETE FROM geoexplorer.embeddings WHERE identifier = %s", (identifier,))
        is_multi = len(layers) > 1

        for layer in layers:
            ln = layer["typeName"] if layer else ""
            slug = f"{identifier}_{ln}" if (is_multi and ln) else identifier
            
            # Use layer's title if present, else fall back to main title (matching index.ipynb)
            l_title = layer["title"] if layer else ""
            full_title = l_title or title_main
            
            md_lines = [f"# {full_title}\n"]
            if description_main: md_lines.extend(["## Beschreibung\n", description_main, ""])
            l_abs = layer["abstract"] if layer else None
            if l_abs: md_lines.extend(["## Layer Beschreibung\n", l_abs, ""])
            
            attrs = layer["attributes"] if layer else {}
            if isinstance(attrs, dict) and attrs:
                md_lines.extend(["## Attribut-Tabelle\n", "| Feldname | Beschreibung |", "| --- | --- |"])
                for k, v in attrs.items(): md_lines.append(f"| {k} | {v} |")
                md_lines.append("")
            
            cleaned_tech = ""
            if markdown_text:
                cutoff = "Ausführliche Informationen finden Sie in den Begleittexten"
                cleaned_tech = markdown_text.split(cutoff)[0].strip()
                md_lines.extend(["\n## Technische Beschreibung\n", cleaned_tech, ""])

            keywords = layer.get("keywords") if layer else clean_keywords(record.get('subject', []))
            if keywords:
                md_lines.extend(["## Schlagwörter\n", ", ".join(keywords), ""])

            content = "\n".join(md_lines)
            embedding_str = None
            if not skip_embedding:
                try:
                    res = client.embeddings.create(model="mistral-embed", inputs=[content])
                    embedding_str = "[" + ",".join(map(str, res.data[0].embedding)) + "]"
                except Exception as e:
                    print(f"Embedding failed for {slug}: {e}")

            meta = {
                "Typ": service_type, "guid": identifier, "Service URL": service_url, "Layer Name": ln,
                "Service Name": service_name,
                "Titel": full_title, "Anmerkung": description_main, "Anmerkung Layer": l_abs,
                "Attribute": attrs,
                "Stichworte": keywords, "Beschreibung": cleaned_tech,
                "metadata_update": in_meta_str, "data_update": in_data_str
            }
            
            m_dt = pendulum.parse(in_meta_str) if in_meta_str else None
            d_dt = pendulum.parse(in_data_str) if in_data_str else None

            cur.execute("""
                INSERT INTO geoexplorer.embeddings 
                (slug, identifier, heading, dataset_info, embedding, last_metadata_update, last_data_update, last_sync_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
            """, (slug, identifier, full_title, json.dumps(meta), embedding_str, m_dt, d_dt))
            success_total += 1
            print(f"Processed: {slug}")
            
    conn.commit()
    cur.close()
    conn.close()
    return success_total

@task.virtualenv(requirements=REQUIREMENTS)
def update_tsne() -> None:
    import numpy as np
    from sklearn.manifold import TSNE
    from airflow.providers.postgres.hooks.postgres import PostgresHook
    pg_hook = PostgresHook(postgres_conn_id="postgres_conn_geodata")
    records = pg_hook.get_records("SELECT slug, embedding FROM geoexplorer.embeddings WHERE embedding IS NOT NULL")
    if len(records) < 2: return
    slugs = [r[0] for r in records]
    embeddings = [([float(x) for x in r[1].strip('[]').split(',')] if isinstance(r[1], str) else r[1]) for r in records]
    matrix = np.array(embeddings)
    tsne = TSNE(n_components=2, perplexity=min(30, len(records)-1), random_state=42, init='random', learning_rate=200)
    vis = tsne.fit_transform(matrix)
    conn = pg_hook.get_conn()
    with conn.cursor() as cur:
        for i, slug in enumerate(slugs):
            cur.execute("UPDATE geoexplorer.embeddings SET tsne_x = %s, tsne_y = %s WHERE slug = %s", (float(vis[i, 0]), float(vis[i, 1]), slug))
    conn.commit()
    conn.close()

@task.virtualenv(requirements=REQUIREMENTS)
def record_sync_history(sync_data: dict, success_count: int, dag_run_id: str, sync_started_at: str) -> None:
    from airflow.providers.postgres.hooks.postgres import PostgresHook
    pg_hook = PostgresHook(postgres_conn_id="postgres_conn_geodata")
    stats = sync_data["stats"]
    pg_hook.run("""
        INSERT INTO geoexplorer.sync_history (dag_run_id, sync_started_at, total_csw_records, new_records_found, updated_records_found, successfully_processed)
        VALUES (%s, %s, %s, %s, %s, %s)
    """, parameters=(dag_run_id, sync_started_at, stats["total_csw"], stats["new"], stats["updated"], success_count))

@dag(
    schedule="0 2 * * 0", start_date=pendulum.datetime(2026, 6, 23, tz="UTC"),
    catchup=False, tags=["geoexplorer", "embeddings", "mistral"], max_active_runs=1,
)
def geoexplorer_sync_dag():
    init_db_task = init_db()
    sync_results = sync_csw_records(limit=GEOEXPLORER_SYNC_LIMIT)
    process_task = process_and_embed(sync_results, skip_embedding=GEOEXPLORER_SKIP_EMBEDDING)
    tsne_task = update_tsne()
    history_task = record_sync_history(sync_results, process_task, dag_run_id="{{ run_id }}", sync_started_at="{{ dag_run.start_date }}")
    init_db_task >> sync_results
    process_task >> tsne_task >> history_task

geoexplorer_sync_dag()
