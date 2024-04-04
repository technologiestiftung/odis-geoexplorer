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

export function InfoModal({ language }) {
  // Return the JSX for your component
  return (
    <Dialog>
      {/* <DialogTrigger className="text-odis-light italic text-xs">
        Was ist bei der Nutzung zu beachten?
      </DialogTrigger> */}
      <DialogTrigger className="text-odis-light ">
        <InfoIcon />
      </DialogTrigger>
      <DialogContent
        className="sm:h-max text-odis-dark  max-h-[100%] md:max-h-[80%] flex overflow-y-auto"
        style={{ flexFlow: 'column' }}
      >
        <div className="text-center text-odis-dak">
          <h1 className="text-2xl font-bold">
            Geo<span className="text-odis-light">Explore</span>
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
            Entdecke Berlins Geodaten mit GeoExplore Berlin. Mit diesem Prototyp kannst du spielend
            leicht Daten aus mehr als 1800 Geodatensätze aus dem{' '}
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
              Bitte beachte, dass GeoExplore das KI-Modell von ChatGPT nutzt, d.h. Anfragen werden
              an OpenAI weitergeleitet, die das Unternehmen nach eigenen Datenschutzrichtlinien
              verarbeitet. Darüber hinaus verbraucht jeden Anfrage Strom und kostet ca. x EUR, was
              über Steuerabgaben finanziert wird.
            </p>
          </div>
          <div className="relative bg-odis-extra-light text-odis-light border-odis-light mt-8 overflow-auto rounded-md border border-input p-4">
            <span className="absolute">
              <AttentionIcon />
            </span>
            <span className="font-bold flex pl-6">Hinweise zur Nutzung</span>
            <br />
            <p className="ml-6">
              Die auf dieser Website präsentierten Ergebnisse basieren auf einem Large Language
              Model und dienen ausschließlich zu Informationszwecken. Es ist wichtig zu beachten,
              dass solche Modelle Fehler machen können und gelegentlich “halluzinieren”, d.h.
              erdachte Informationen generieren können. Daher sollten die bereitgestellten
              Informationen mit Vorsicht verwendet werden.
              <br />
              <br />
              Wir übernehmen keine Haftung für die Richtigkeit, Vollständigkeit oder Aktualität der
              auf dieser Website präsentierten Daten. Nutzerinnen und Nutzer werden ermutigt, die
              bereitgestellten Informationen zu überprüfen und im Zweifelsfall auf offizielle
              Quellen zurückzugreifen.
            </p>
          </div>
        </div>

        <p className="flex justify-start gap-x-6 gap-y-3 flex-wrap font-bold text-odis-light">
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
      </DialogContent>
    </Dialog>
  )
}
