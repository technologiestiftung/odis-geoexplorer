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
          <DialogDescription className="text-black text-md">
            Entdecke Berlins Geodaten mit GeoExplore Berlin. Mit diesem Prototyp kannst du spielend
            leicht Daten aus mehr als 650 Geodatensätze aus dem{' '}
            <a
              target="_blank"
              href="https://www.berlin.de/sen/sbw/stadtdaten/geoportal/"
              className="text-odis-light"
            >
              Geodatenportal Berlins
            </a>{' '}
            finden. Die Anwendung nutzt ein Large Language Model, um gezielt nach interessanten
            Datensätzen im WFS-Format für dich zu suchen, die sonst oft nur mit technischem know-how
            zugänglich sind. Egal, ob Umwelt, Infrastruktur oder Kultur – finde die Daten, die dich
            interessieren.
            <br />
            <br />
            <b>Hinweise zur Nutzung</b>
            <br />
            <span className="mt-4">
              Die auf dieser Website präsentierten Ergebnisse basieren auf einem Large Language
              Model und dienen ausschließlich zu Informationszwecken. Es ist wichtig zu beachten,
              dass solche Modelle Fehler machen können und gelegentlich “halluzinieren”, d.h.
              erdachte Informationen generieren können. Daher sollten die bereitgestellten
              Informationen mit Vorsicht verwendet werden.
            </span>
            <br />
            <span className="mt-4">
              Wir übernehmen keine Haftung für die Richtigkeit, Vollständigkeit oder Aktualität der
              auf dieser Website präsentierten Daten. Nutzerinnen und Nutzer werden ermutigt, die
              bereitgestellten Informationen zu überprüfen und im Zweifelsfall auf offizielle
              Quellen zurückzugreifen.
            </span>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
