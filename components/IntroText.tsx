'use client'
import { text } from '@/lib/text'

export function IntroText({ language }) {
  return (
    <div className="relative  w-full sm:w-1/2 text-odis-dark z-20">
      <span>
        <h1 className="text-3xl font-bold">
          Geo<span className="text-odis-light">explorer</span>
        </h1>
        {/* <h2 className="">{text[language].subHeading || text['de'].subHeading}</h2> */}
        {/* <h2>Finde und erkunde das große Angebot</h2>
      <h2>von offenen Geodaten in Berlin mit Hilfe von K.I.</h2> */}
        <h2>
          Suche nach Stichwörtern oder stell eine Frage, um passende Datensätze zu finden. Für den
          Einstieg kannst du unsere Beispielthemen nutzen. Die KI listet die Suchergebnisse
          entsprechend der von ihr berechneten Nähe bzw. Distanz der Datensätze auf, wie das
          Schaubild untermalt. Beachte, dass du je nach Eingabe (Prompt) unterschiedliche Vorschläge
          bekommen könntest.
        </h2>
      </span>
    </div>
  )
}
