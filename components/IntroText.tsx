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
          Die Berliner Verwaltung erhebt und veröffentlicht eine Vielzahl an Informationen über die
          Stadt. Diese prototypische KI-Suche soll dir helfen, Geodaten zu finden und schnell zu
          verstehen. Suche nach Stichwörtern oder stell eine Frage, um passende und potenziell
          relevante Datensätze für dein Vorhaben zu entdecken.
        </h2>
      </span>
    </div>
  )
}
