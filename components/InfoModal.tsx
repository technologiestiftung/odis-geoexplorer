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
        <div className="text-center text-odis-dak">
          <h1 className="text-2xl font-bold">
            Geo<span className="text-odis-light">Explorer</span>
          </h1>
          <h2 className="font-robot text-sm">
            {text[language].subHeading || text['de'].subHeading}
          </h2>
          <span className="inline-block text-odis-dark  scale-75">
            {' '}
            <LoaderCrossIcon animate={false} />
          </span>
        </div>
        <div className="md:overflow-y-auto">
          <p className="text-lg font-bold leading-6 mb-4">
            Entdecke Berlins Geodaten mit dem GeoExplorer Berlin. Mit diesem Prototyp kannst du
            spielend leicht Daten aus mehr als 1800 Geodatensätze aus dem{' '}
            <a
              target="_blank"
              href="https://www.berlin.de/sen/sbw/stadtdaten/geoportal/"
              className="text-odis-light"
            >
              Geodatenportal Berlins
            </a>{' '}
            finden. Die Anwendung nutzt ein Large Language Model, um gezielt nach passenden
            Datensätzen für dich zu suchen, die die KI mit deinem Suchebgriff verbindet. Egal, ob
            Umwelt, Infrastruktur oder Kultur – finde die Daten, die dich interessieren.
          </p>
          <div className="relative bg-odis-extra-light text-odis-light border-odis-light mt-8 overflow-auto rounded-md border border-input p-4">
            <span className="absolute">
              <AttentionIcon />
            </span>
            <p className="font-bold pl-6">Hinweis zum KI-Modell</p>
            <br />
            <p className="pl-6">
              Bitte beachte, dass der GeoExplorer das KI-Modell von ChatGPT nutzt, d.h. Anfragen
              werden an OpenAI weitergeleitet, die das Unternehmen nach eigenen
              Datenschutzrichtlinien verarbeitet. Darüber hinaus fallen bei jeder Abfrage Kosten an.
              Strom Verbrauch?
            </p>
          </div>
          <div className=" relative bg-odis-extra-light text-odis-light border-odis-light mt-8 overflow-auto rounded-md border border-input p-4">
            <span className="absolute">
              <AttentionIcon />
            </span>
            <span className="font-bold flex pl-6">Hinweise zur Nutzung</span>
            <br />
            <p className="ml-6">
              Die auf dieser Website präsentierten Ergebnisse basieren auf einem Large Language
              Model und dienen ausschließlich zu Informationszwecken. Es ist wichtig zu beachten,
              dass KI-Modelle gelegentlich Informationen ausgeben, die zwar plausibel klingen aber
              dennoch falsch sein können. Daher sollten die bereitgestellten Informationen mit
              Vorsicht betrachtet werden.
              <br />
              <br />
              Wir übernehmen keine Haftung für die Richtigkeit, Vollständigkeit oder Aktualität der
              auf dieser Website präsentierten Daten. Nutzerinnen und Nutzer werden ermutigt, die
              bereitgestellten Informationen zu überprüfen und im Zweifelsfall auf offizielle
              Quellen zurückzugreifen.
            </p>
          </div>
          <Accordion
            title="Weiter Infos"
            content={
              'Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloremque, veniam corporis. Quos deleniti non perspiciatis officiis ratione quod ducimus, at fuga praesentium rerum distinctio voluptatum! Doloribus nesciunt facilis odit a?'
            }
          />
          <p className="mt-6">
            Letzter Abgleich mit dem{' '}
            <a className="text-odis-light" href="https://daten.berlin.de/datensaetze">
              Berliner Datenportal
            </a>
            : 2. April 2024
          </p>
        </div>
        <section className="mt-[19px] flex  gap-[24px] text-xs flex-col sm:flex-row">
          <div className="flex flex-1 flex-col  ">
            <div>Ein Projekt der</div>
            <div className="h-[49px] w-auto">
              <a href="https://www.technologiestiftung-berlin.de" target="_blank">
                <TSBLogo />
              </a>
            </div>
          </div>
          <div className="flex flex-1  flex-col ">
            <div>Durchgeführt von der</div>
            <div className="h-[40px] w-auto">
              <a href="https://odis-berlin.de" target="_blank">
                <OdisLogo />
              </a>
            </div>
          </div>
          <div className="flex flex-1 flex-col  ">
            <div>in Zusammenarbeit mit</div>
            <div className="flex gap-[16px]">
              <div className="h-[34px] w-full">
                <a href="https://citylab-berlin.org/de/start/" target="_blank">
                  <CityLabLogo />
                </a>
              </div>
            </div>
          </div>
          <div className="flex flex-1  flex-col  ">
            <div>Gefördert von </div>
            <div className="flex gap-[16px]">
              <div className="h-auto w-full">
                <a href="https://www.berlin.de/rbmskzl/" target="_blank">
                  <BerlinLogo />
                </a>
              </div>
            </div>
          </div>
        </section>
        <p className="flex justify-start gap-x-6 gap-y-3 flex-wrap font-bold text-odis-light">
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
          <a href="" target="_blank" className="flex-1">
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
      </DialogContent>
    </Dialog>
  )
}
