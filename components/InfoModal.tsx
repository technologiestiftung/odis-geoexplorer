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

export function InfoModal({ language }) {
  // Return the JSX for your component
  return (
    <Dialog>
      {/* <DialogTrigger className="text-odis-light italic text-xs">
        Was ist bei der Nutzung zu beachten?
      </DialogTrigger> */}
      <DialogTrigger className="text-gray-500 dark:text-gray-100">
        <InfoIcon />
      </DialogTrigger>
      <DialogContent className="h-full sm:h-max bg-active">
        <DialogHeader>
          <DialogTitle>
            {' '}
            <div className="text-center text-odis-dark mb-2">
              <h1 className="text-2xl font-bold">
                Geo<span className="text-odis-light">Explore</span>
              </h1>
              <h2 className="font-robot text-sm">
                {text[language].subHeading || text['de'].subHeading}
              </h2>
              <span className="inline-block text-odis-dark my-2">
                {' '}
                <LoaderCrossIcon animate={false} />
              </span>
            </div>
          </DialogTitle>
          <DialogDescription className="text-odis-dark">
            <p className="text-lg font-bold leading-6 mb-4">
              Entdecke Berlins Geodaten mit GeoExplore Berlin. Mit diesem Prototyp kannst du
              spielend leicht Daten aus mehr als 650 Geodatensätze aus dem{' '}
              <a
                target="_blank"
                href="https://www.berlin.de/sen/sbw/stadtdaten/geoportal/"
                className="text-odis-light"
              >
                Geodatenportal Berlins
              </a>{' '}
              finden. Die Anwendung nutzt ein Large Language Model, um gezielt nach passenden
              Datensätzen für dich zu suchen, die sonst oft nur mit technischem know-how zugänglich
              sind. Egal, ob Umwelt, Infrastruktur oder Kultur – finde die Daten, die dich
              interessieren.
            </p>
            <p>
              <span className="font-bold">Hinweise zur Nutzung</span>
              <br />
              Die auf dieser Website präsentierten Ergebnisse basieren auf einem Large Language
              Model und dienen ausschließlich zu Informationszwecken. Es ist wichtig zu beachten,
              dass solche Modelle Fehler machen können und gelegentlich “halluzinieren”, d.h.
              erdachte Informationen generieren können. Daher sollten die bereitgestellten
              Informationen mit Vorsicht verwendet werden.
            </p>
            <p className="pt-4">
              Wir übernehmen keine Haftung für die Richtigkeit, Vollständigkeit oder Aktualität der
              auf dieser Website präsentierten Daten. Nutzerinnen und Nutzer werden ermutigt, die
              bereitgestellten Informationen zu überprüfen und im Zweifelsfall auf offizielle
              Quellen zurückzugreifen.
            </p>
            <p className="flex justify-start gap-x-6 gap-y-3 mt-4 flex-wrap font-bold text-odis-light">
              <a
                href="https://www.technologiestiftung-berlin.de/de/datenschutz/"
                target="_blank"
                className="flex-1"
              >
                Datenschutz
              </a>
              <a href="" target="_blank" className="flex-1">
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
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
