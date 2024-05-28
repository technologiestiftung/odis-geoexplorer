'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

import { InfoIcon } from '@/components/ui/icons/info'
import { text } from '@/lib/text'
import { LoaderCrossIcon } from '@/components/ui/icons/loaderCross'
import { AttentionIcon } from '@/components/ui/icons/attention'

import { CityLabLogo } from '@/components/Logos/CityLabLogo'
import { OdisLogo } from '@/components/Logos/OdisLogo'
import { BerlinLogo } from '@/components/Logos/BerlinLogo'
import { TSBLogo } from '@/components/Logos/TSBLogo'

import { Accordion } from '@/components/Accordion'

export function InfoModal({ language }) {
  // Return the JSX for your component
  return (
    <Dialog>
      <DialogTrigger className="text-odis-light ">
        <InfoIcon />
      </DialogTrigger>
      <DialogContent
        className="sm:h-max text-odis-dark  max-h-[100%] md:max-h-[80%] flex overflow-y-auto"
        style={{ flexFlow: 'column' }}
      >
        <div className=" text-odis-dak">
          {/* text-center */}
          <h1 className="text-3xl font-bold">
            Geo<span className="text-odis-light">explorer</span>
          </h1>
          <h2 className=" text-sm">{text[language].subHeading || text['de'].subHeading}</h2>
          {/* <span className="inline-block text-odis-dark  scale-75">
            {' '}
            <LoaderCrossIcon animate={false} />
          </span> */}
        </div>
        <div className=" max-h-[100%] md:max-h-[80%] flex overflow-y-auto flex-col md:flex-row gap-[24px]">
          <section className="md:overflow-y-auto md:w-[75%] md:pr-4">
            <p className="text-lg leading-6 mb-4">
              Du möchtest die Folgen des Klimawandels verstehen? Du planst den Verkehr der Zukunft
              oder setzt dich für leichtere Teilhabe an Gesundheitseinrichtungen oder
              Bildungsangeboten ein? In den offenen Geodatensätzen des Landes Berlin schlummert eine
              Vielzahl an Wissen über unsere Stadt, das dir bei deinem Vorhaben helfen kann. Unser
              prototypischer GeoExplorer sucht dir basierend auf deiner Anfrage dank
              KI-Unterstützung passende oder naheliegende Datensätze für dein Projekt. Zusätzlich
              kannst du in jeden Datensatz genauer eintauchen und nach deinen Bedürfnissen
              weiternutzen. Egal, ob Umwelt, Infrastruktur oder Kultur – exploriere die Daten, die
              dich interessieren.
            </p>
            <div className="relative bg-odis-extra-light text-odis-light border-odis-light mt-8 overflow-auto rounded-md border border-input p-4">
              <span className="absolute">
                <AttentionIcon />
              </span>
              <p className="font-bold pl-6">Hinweis zum KI-Modell</p>
              <br />
              <p className="pl-6">
                Bitte beachte, dass der GeoExplorer das KI-Modell von ChatGPT nutzt, das heißt
                Anfragen werden an OpenAI weitergeleitet, die das Unternehmen nach eigenen{' '}
                <a
                  target="_blank"
                  className="underline"
                  href="https://openai.com/policies/privacy-policy"
                >
                  Datenschutzrichtlinien
                </a>{' '}
                verarbeitet. Eine Speicherung der Anfragen durch uns erfolgt nicht. Darüber hinaus
                fallen bei jeder Abfrage geringfügige Kosten aus Mitteln der öffentlichen Hand für
                die Nutzung von ChatGPT an und jede Anfrage ist mit einem erhöhten Stromverbrauch im
                Vergleich zu üblichen Suchmaschinen verbunden.
              </p>
            </div>
            <div className=" relative bg-odis-extra-light text-odis-light border-odis-light mt-8 overflow-auto rounded-md border border-input p-4">
              <span className="absolute">
                <AttentionIcon />
              </span>
              <span className="font-bold flex pl-6">Hinweise zur Nutzung</span>
              <br />
              <p className="ml-6">
                Die auf dieser Website präsentierten Ergebnisse sind abhängig von der konkreten
                Suchanfrage (dem Prompt). Es ist wichtig zu beachten, dass Large Language Models wie
                ChatGPT gelegentlich Informationen ausgeben, die zwar plausibel klingen aber dennoch
                falsch sein können. Daher sollten die bereitgestellten Informationen mit Vorsicht
                betrachtet werden.
                <br />
                <br />
                Wir übernehmen keine Haftung für die Richtigkeit, Vollständigkeit oder Aktualität
                der auf dieser Website präsentierten Daten und empfehlen die bereitgestellten
                Informationen zu überprüfen.
              </p>
            </div>
            <Accordion
              title="Wie funktioniert die explorative Suche?"
              active={false}
              content={
                <p>
                  Für jeden Datensatz, wurden sogenannte Metadaten von{' '}
                  <a className="underline" href="https://daten.berlin.de/" target="blank">
                    Berlins Open Data Portal{' '}
                  </a>{' '}
                  und{' '}
                  <a
                    className="underline"
                    href="https://fbinter.stadt-berlin.de/fb/"
                    target="blank"
                  >
                    Berlins Geo Data Portal (FisBroker)
                  </a>{' '}
                  automatisiert gescraped (gesammelt).
                  <br />
                  <br />
                  Als Metadaten werden Daten bezeichnet, die einen Datensatz beschreiben, z.B. die
                  Attribute, die ein Datensatz hat, oder der von einem Menschen geschriebene
                  Beschreibungstext. Das Script, um die Daten zu scrapen, findest du in unserem{' '}
                  <a
                    className="underline"
                    href="https://github.com/technologiestiftung/odis-geoexplorer-scraper"
                    target="blank"
                  >
                    Github-Repo
                  </a>
                  .
                  <br />
                  <br />
                  Danach wurden für jeden einzelnen Metadatensatz ein sogenanntes Embedding erstellt
                  und in eine Datenbank geschrieben. Jedes Embedding enthält einen speziellen Vektor
                  der auf den Inhalt der Metadaten basiert. Dieser Vektor ist wie eine Art
                  multidimensionale Koordinate, die den Inhalt der Maétadaten in der Logik der KI
                  verortet.
                  <br />
                  <br />
                  z.B. wären die Vektoren für die Begriffe "Hund" und "Katze" näher verortet als der
                  Begriff "Auto", weil sie beide Tiere sind.
                  <br />
                  <br />
                  Wenn du eine Suchanfrage eingibst, wir darauf ein Vektor erstellt und mit den
                  vorhandenen Vektoren in der Datenbank verglichen. Falls die Vektoren eine gewisse
                  Nähe zueinander aufweisen, werden die jeweiligen Embeddings im Suchergebnis
                  angezeigt.
                  <br />
                  <br />
                  Hinweis: Beim Suchvorgang scheinen kleine Änderungen im Text, wie Groß- und
                  Kleinschreibung, die Suchergebnisse zu beeinflussen. Bei einer klassischen Suche
                  würde man so etwas eher nicht erwarten.
                </p>
              }
            />

            <Accordion
              title="Wie werden die KI generierten Text erzeugt?"
              active={false}
              content={
                <p>
                  Die Texte werden von einem "Large Language Model" (LLM) generiert. Ein LLM ist ein
                  hochentwickeltes KI-gestütztes System, das speziell dafür konzipiert ist,
                  menschliche Sprache in ihrer Komplexität zu erfassen und zu simulieren. Diese
                  Technologie basiert auf der Analyse und Verarbeitung einer immensen Menge an
                  Textdaten, die aus einer Vielzahl von Quellen wie Büchern, Artikeln und
                  Internetinhalten stammen. Durch maschinelles Lernen und komplexe Algorithmen
                  entwickelt das Modell die Fähigkeit, Texte zu verstehen, zu generieren und in
                  menschenähnlicher Weise zu interagieren. Es kann Aufgaben wie das Beantworten von
                  Fragen, das Übersetzen von Sprachen und das Erstellen von Texten verschiedenster
                  Art übernehmen. Trotz ihrer beeindruckenden Leistungsfähigkeit sind LLMs nicht
                  fehlerfrei und ihre Interpretationen können gelegentlich von menschlichem
                  Verständnis abweichen. Sie repräsentieren den aktuellen Stand der KI-Entwicklung
                  im Bereich der natürlichen Sprachverarbeitung, aber sie bleiben ein Werkzeug,
                  dessen Ergebnisse stets kritisch hinterfragt und kontextualisiert werden sollten.
                  <br /> <br />
                  Beim Geoexplorer stellen wir der KI bestimmte Fragen und geben ihr die Matadaten
                  zu den Datensätzen mit.
                </p>
              }
            />

            <Accordion
              title="Was ist eine WMS oder WFS?"
              active={false}
              content={
                <p>
                  WMS und WFS sind Abkürzungen für zwei verschiedene Arten von Diensten, die im
                  Bereich der Geoinformationen verwendet werden. Beide Dienste helfen dabei,
                  geografische Daten über das Internet zu teilen und zu nutzen.
                  <br />
                  <br />
                  <i>WMS (Web Map Service)</i> liefert Bilder von Karten, die auf einem Server
                  gespeichert sind. Diese Bilder können Straßenkarten, Luftbilder oder andere
                  geografische Darstellungen sein.
                  <br />
                  <br />
                  <i>WFS (Web Feature Service)</i> liefert keine fertigen Kartenbilder, sondern die
                  eigentlichen geografischen Rodaten. Die Daten können weiterverarbeitet, analysiert
                  und in verschiedenen Anwendungen verwendet werden.
                </p>
              }
            />
            <Accordion
              title="Hintergund - Warum ein Geoexplorer?"
              active={false}
              content={
                <p>
                  test für Open Data Suche + KI
                  <br />
                  <br />
                  Warum Geodaten? Strukturierte Daten
                </p>
              }
            />
            <Accordion
              title="Wie funktioniert der Download?"
              active={false}
              content={
                <p>
                  Für die WFS-Daten stellen wir einen Download bereit im GeoJSON-Format bereit. WFS
                  erlauben es, über einen Parameter die Rohdaten im GeoJSON-Format zu laden. Der
                  Geoexplorer reprojiziert die Daten zusätzlich in das Projektionssystem 4326,
                  welches am häufigsten in Anwendungen für die Zivilgesellschaft genutzt wird.
                </p>
              }
            />
            <Accordion
              title={'Was ist Open Data?'}
              active={false}
              content={
                <p>
                  Open Data zeichen sich dadurch aus, dass sie in einem offenen und
                  maschinenlesbaren Format vorliegen, unter einer freien Lizenz nutzbar sind, der
                  Zugang diskriminierungsfrei und kostenlos ist und die Daten an einem zentralen Ort
                  dauerhaft auffindbar sind.
                  <br />
                  <br />
                  Open Data ist heute ein wichtiger Bestandteil im Berliner Verwaltungshandeln und
                  schafft nicht nur Transparenz und Offenheit, sondern ermöglicht auch datenbasierte
                  Tools wie den
                  <span className="italic"> Branchenpuls</span>. Auch Akteur:innen aus Wirtschaft,
                  Wissenschaft und Zivilgesellschaft profitieren von offenen Daten und
                  veröffentlichen zunehmend selbst offene Daten. Die{' '}
                  <a className="font-medium text-primary" href="https://odis-berlin.de/">
                    Open Data Informationsstelle Berlin (ODIS)
                  </a>{' '}
                  unterstützt Berliner Behörden und andere interessierte Akteur:innen bei der
                  Nutzung und Bereit­stellung von offenen Daten. Mehr offene Daten findest Du im{' '}
                  <a className="font-medium text-primary" href="https://daten.berlin.de/">
                    Berliner Datenportal
                  </a>{' '}
                  .
                </p>
              }
            />
            <Accordion
              title={'Wie oft werden die Daten aktualisiert?'}
              active={false}
              content={
                <p>
                  Der Geoexplorer wird momentan (noch) unregelmäßig aktualisiert. Der letzte
                  Datenabgleich mit Berlines Datenportalen fand am 2. April 2024 statt.
                </p>
              }
            />
          </section>
          <section className="flex-1">
            <div className="mt-4 md:mt-0 flex  gap-[24px] text-xs flex-col ">
              <div className="flex flex-1 flex-col  ">
                <div>Ein Projekt der</div>
                <div className="h-[49px] w-auto mt-2">
                  <a href="https://www.technologiestiftung-berlin.de" target="_blank">
                    <TSBLogo />
                  </a>
                </div>
              </div>
              <div className="flex flex-1  flex-col ">
                <div>Durchgeführt von der</div>
                <div className="h-[40px] w-auto mt-2">
                  <a href="https://odis-berlin.de" target="_blank">
                    <OdisLogo />
                  </a>
                </div>
              </div>
              <div className="flex flex-1 flex-col  ">
                <div>in Zusammenarbeit mit</div>
                <div className="flex gap-[16px] w-[120px] self-center">
                  <div className="h-[34px] w-full mt-2">
                    <a href="https://citylab-berlin.org/de/start/" target="_blank">
                      <img
                        src="https://logos.citylab-berlin.org/logo-citylab-color.svg"
                        alt="Logo Citylab"
                      />{' '}
                    </a>
                  </div>
                </div>
              </div>
              <div className="flex flex-1  flex-col  ">
                <div>Gefördert von </div>
                <div className="flex gap-[16px] self-center">
                  <div className="h-auto w-full mt-2">
                    <a href="https://www.berlin.de/rbmskzl/" target="_blank">
                      <img
                        className="-translate-y-0.5 max-w-[200px]"
                        src="https://logos.citylab-berlin.org/logo-senatskanzlei-buergermeister-horizontal.svg"
                        alt="Logo Berlin"
                      />{' '}
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <p className="flex md:flex-col justify-start gap-x-6 gap-y-3 flex-wrap font-bold text-odis-light my-8 md:mt-4">
              <a
                href="https://www.technologiestiftung-berlin.de/de/datenschutz/"
                target="_blank"
                className="flex-1"
              >
                Datenschutz
              </a>
              <a
                href="https://citylabberlin.typeform.com/to/hEqorFLn"
                target="_blank"
                className="flex-1"
              >
                Feedback
              </a>
              <a
                href="https://github.com/technologiestiftung/odis-geoexplorer"
                target="_blank"
                className="flex-1"
              >
                GitHub
              </a>
              <a
                href="https://www.technologiestiftung-berlin.de/de/stiftung/kontakt-anfahrt/"
                target="_blank"
                className="flex-1"
              >
                Kontakt
              </a>
              <a
                href="https://www.technologiestiftung-berlin.de/de/impressum/"
                target="_blank"
                className="flex-1"
              >
                Impressum
              </a>
            </p>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  )
}
