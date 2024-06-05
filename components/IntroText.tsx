'use client'
import { text } from '@/lib/text'

export function IntroText({ language }) {
  return (
    <div className="relative  w-full sm:w-1/2 text-odis-dark z-20">
      <span>
        <h1 className="text-3xl font-bold">
          Geo<span className="text-odis-light">explorer</span>
        </h1>
        <h2>
          Entdecke und erkunde die Geodaten des Landes Berlin. Suche nach Stichwörtern oder stell
          eine Frage, um passende und naheliegende Datensätze zu finden. Zahlreiche Informationen zu
          jedem Datensatz helfen dir die Daten zu ergründen und weiter zu nutzen.
          <br />
          Viel Spaß!
        </h2>
      </span>
    </div>
  )
}
