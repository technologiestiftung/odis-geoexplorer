import React, { useState, useRef } from 'react'

import Head from 'next/head'
import { LogoHeader } from '@/components/LogoHeader'
import { IntroText } from '@/components/IntroText'
import { InfoModal } from '@/components/InfoModal'
// import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import NetworkAnimation from '@/components/NetworkAnimation'
import { useDimensions } from '@/lib/useDimensions'

import { SearchAI } from '@/components/SearchAI'

export default function Home() {
  const [language, setLanguage] = useState<string>('de')
  const ref = useRef<HTMLDivElement>(null)

  const visDimensions = useDimensions(ref)

  return (
    <>
      <Head>
        <title>GeoExplorer Berlin</title>
        <meta
          name="description"
          content="Finde passende oder ähnliche Geodatensätze aus dem Geodatenangebot Berlins dank KI-Unterstützung."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="description"
          content="Finde passende oder ähnliche Geodatensätze aus dem Geodatenangebot Berlins dank KI-Unterstützung."
        />
        <meta name="keywords" content="ODIS,Technologiestiftung Berlin,CityLAB,Open Data,geo," />
        <meta name="theme-color" content="#4c68c7" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta property="og:title" content="GeoExplorer Berlin" />
        <meta
          property="og:description"
          content="Finde passende oder ähnliche Geodatensätze aus dem Geodatenangebot Berlins dank KI-Unterstützung."
        />
        <meta property="og:url" content="https://geoexplorer.odis-berlin.de/" />
        <meta property="og:site_name" content="geoexplorer.odis-berlin.de" />
        <meta property="og:locale" content="de_DE" />
        <meta
          property="og:image"
          content="https://geoexplorer.odis-berlin.de/images/open-graph-800x600.png"
        />
        <meta property="og:image:width" content="800" />
        <meta property="og:image:height" content="600" />
        <meta
          property="og:image"
          content="https://geoexplorer.odis-berlin.de/images/open-graph-1800x1600.png"
        />
        <meta property="og:image:width" content="1800" />
        <meta property="og:image:height" content="1600" />
        <meta property="og:image:alt" content="Vorschau vom Berliner GeoExplorer" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="GeoExplorer Berlin" />
        <meta
          name="twitter:description"
          content="Finde passende oder ähnliche Geodatensätze aus dem Geodatenangebot Berlins dank KI-Unterstützung."
        />
        <meta
          name="twitter:image"
          content="https://geoexplorer.odis-berlin.de/images/social-image-1280x640.png"
        />
      </Head>
      <main
        className="bg-cover bg-fixed bg-odis-light-2 flex flex-col min-h-screen 
         py-8 px-2 sm:px-10 text-odis-dark"
        style={{ backgroundImage: "url('/images/vector.svg')" }}
      >
        {/* <LanguageSwitcher setLanguage={setLanguage} language={language} /> */}
        <LogoHeader />
        <div className="lg:w-3/4 bg-white p-8 sm:p-12 rounded shadow-lg mt-8 max-w-4xl self-center relative overflow-hidden">
          <div
            className="flex-1 hidden sm:block absolute right-0 top-0 z-0 p-16 md:p-10"
            style={{ transform: 'translate(15%)' }}
          >
            {' '}
            <NetworkAnimation width={visDimensions.width} height={250} />
          </div>
          <div className="w-full text-right relative">
            <InfoModal language={language} />
          </div>
          <div className="relative overflow-hidden" ref={ref}>
            <IntroText language={language} />
          </div>

          <SearchAI language={language} />
        </div>
      </main>
    </>
  )
}
