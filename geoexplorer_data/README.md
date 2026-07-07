# GeoExplorer Metadata Harvester & Sync

An automated Apache Airflow-powered pipeline for harvesting, filtering, and embedding geospatial metadata (WFS and WMS) from GDI Berlin's CSW (Catalog Service for the Web) repository. 

This system acts as the data backbone for the **GeoExplorer** application, providing high-quality semantic search over geographical datasets by generating vector embeddings of metadata documents and storing them in a PostgreSQL database equipped with `pgvector` for similarity matching.

## Prerequisites

- Docker Desktop installed and running
- A MISTRAL_API_KEY. You can get a free Mistral account here: https://mistral.ai/

## Start Services

```bash
cd geoexplorer-data
cp .env.example .env
docker compose up -d
```

To access the Airflow UI, go to http://localhost:8080 and log in with:

- Username: `admin`
- Password: `admin`

## Set up table

The DAG will automatically create the schema and table if they don't exist. However, if you need to set them up manually or want to see the schema, use the following SQL in pgAdmin or your favorite SQL client:

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the schema
CREATE SCHEMA IF NOT EXISTS geoexplorer;

-- Create the table
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

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_geo_embeddings_identifier ON geoexplorer.embeddings(identifier);

-- Create sync history table
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

-- 1. Create a no-data result view for Hasura to understand the return shape
CREATE OR REPLACE VIEW geoexplorer.match_embeddings_result AS
SELECT
    s.id,
    s.slug,
    s.heading,
    NULL::double precision AS similarity,
    s.dataset_info
FROM geoexplorer.embeddings s
WHERE false;

-- 2. Drop the old function because the return type is changing
DROP FUNCTION IF EXISTS geoexplorer.match_embeddings(vector(1024), float, int);

-- 3. Recreate the function with similarity for Mistral embeddings (1024 dims)
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
```

## Pipeline Architecture & Design

The Airflow DAG (`geoexplorer_sync_dag.py`) implements a highly optimized, weekly metadata synchronization cycle:

1. **Service-Level Filtering**: To avoid metadata noise and prevent indexing non-functional items, the pipeline queries the GDI Berlin CSW feed using ISO-19139 (`GMD_SCHEMA`) and strictly filters out raw datasets, indexing only active geospatial services (WFS/WMS).
2. **Layer Splitting**: Both WFS and WMS services are parsed, splitting individual service layers into separate, distinct entries to enable highly targeted discovery.
3. **Clean Metadata & "Service Name" Qualifier**: 
   - Embedding headings are assigned clean, direct layer titles (e.g. `Planungsräume`) to keep the search index accurate and concise.
   - The original parent dataset/service name (e.g. `Lebensweltlich orientierte Räume (LOR) (01.01.2021)`) is retained under a separate `"Service Name"` property in the metadata payload to enable the frontend to easily group, filter, and distinguish different vintages of the same dataset.
4. **Content-Aware Scraping**: Scrapes accompanying technical and content descriptions (e.g., `"Technische Beschreibung"`, or `"Inhaltliche Beschreibung"` for Umweltatlas pages) and compiles them into formatted Markdown documents. It also cleans layer keywords by removing generic, low-information tags (e.g., `berlin`, `geodaten`, `opendata`).
5. **Database Transaction Optimization**: Leverages a single-connection, single-transaction database cursor pattern to execute all deletes and inserts. This protects your database connection pool from slot exhaustion and reduces database write overhead by orders of magnitude.


## Airflow Configuration

1. **Variables**:
    In Airflow UI:
   - `MISTRAL_API_KEY`: Your Mistral API key (go to Admin -> Variables).
   In the DAG: 
   - `GEOEXPLORER_SYNC_LIMIT`:Set to an integer (e.g., 50) for testing, or delete to process all.
   - `GEOEXPLORER_SKIP_EMBEDDING`: Set to `True` (Boolean) to test metadata scraping without calling the Mistral API.


## Stop Services

```bash
docker compose down
```

Stops all local services while keeping data and configuration.

## Reset Environment (Delete All Local Data)

```bash
docker compose down -v
```

Removes all local containers, volumes, and persisted data.

## pgAdmin

To inspect the local PostgreSQL database, go to:

- http://localhost:5050

Log in with:

- Password: `postgres`

Database credentials can be found in the `.env` file.

## Debugging a CSW record

https://gdi.berlin.de/geonetwork/srv/ger/csw?SERVICE=CSW&VERSION=2.0.2&REQUEST=GetRecordById&ID=
ID_HERE
&ELEMENTSETNAME=full
