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
              title="Wie funktioniert die Suche?"
              active={true}
              content={`${''}
                ${'Als erster Schritt wurden die Metadaten, also die Informationen die den Datensatz beschreiben, von [Berlins Open Data Portal](https://daten.berlin.de/) und [Berlins Geo Data Portal (FisBroker)](https://fbinter.stadt-berlin.de/fb/) gesammelt.'}
                ${'Danach wurde für jeden Metadatensatz ein sogenannter Embedding erstellt und in einer Datenbank gespeichert. Ein Embedding ist quasi eine Arte Koordinate, die besagt wo diese Informationen (in unserem Fall die Metadaten) in der Logik der KI liegen.'}
                ${'Bei der Suche wird basierend auf Ihrer Anfrage eine weiteres Embedding erstellt und mit den anderen Embedding in der Datenbank verglichen.'}
                ${'Die Embeddings die eine gewisse Nähe zu ihrem Embedding haben, werden ihenen angezeigt '}

                ${'Groß- und Kleinschreibung scheinen einen Unterschied zu machen bei den Suchergebnissen, was ich bei Suchmaschinen eher nicht erwarten würde'}

                ${'Die Inhalte der Datensätze werden nicht von der KI untersucht sondern nur die Metadaten'}`}
            />
            <Accordion
              title="Platzhalter für mehr Info?"
              active={true}
              content={`${''}
                ${''}
                `}
            />

            <p className="mt-6">
              Der Geoexploror wird momentan (noch) händisch aktualisiert. Letzter Datenabgleich mit
              dem{' '}
              <a className="text-odis-light" href="https://daten.berlin.de/datensaetze">
                Berliner Datenportal
              </a>
              :
              <br />
              2. April 2024
            </p>
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
