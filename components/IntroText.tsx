'use client'
import { text } from '@/lib/text'

export function IntroText({ language }) {
  return (
    <div className="text-center text-odis-dark">
      <h1 className="text-2xl font-bold">
        Geo<span className="text-odis-light">Explorer</span>
      </h1>
      <h2 className="">{text[language].subHeading || text['de'].subHeading}</h2>
    </div>
  )
}
