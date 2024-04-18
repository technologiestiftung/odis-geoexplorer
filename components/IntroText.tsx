'use client'
import { text } from '@/lib/text'

export function IntroText({ language }) {
  return (
    <div className="text-center text-odis-dark">
      <h1 className="text-2xl font-bold">
        Geo<span className="text-odis-light">Explorer</span>
      </h1>
      {/* <h2 className="">{text[language].subHeading || text['de'].subHeading}</h2> */}
      <h2>Finde und erkunde das große Angebot von offenen Geodaten in Berlin</h2>
      <h2>mit Hilfe von K.I.</h2>
    </div>
  )
}
