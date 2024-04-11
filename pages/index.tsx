import React, { useState } from 'react'

import Head from 'next/head'
import { LogoHeader } from '@/components/LogoHeader'
import { IntroText } from '@/components/IntroText'
import { AboutText } from '@/components/AboutText'
import { InfoModal } from '@/components/InfoModal'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

import { SearchAI } from '@/components/SearchAI'

export default function Home() {
  const [language, setLanguage] = useState<string>('de')

  return (
    <>
      <Head>
        <title>GeoExplore Berlin</title>
        <meta name="description" content="" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content="" />
        <meta name="keywords" content="ODIS,Technologiestiftung Berlin,CityLAB,Open Data" />
        <meta name="theme-color" content="#4c68c7" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta property="og:title" content="GeoExplorer Berlin" />
        <meta property="og:description" content="" />
        <meta property="og:url" content="https://????.odis-berlin.de/" />
        <meta property="og:site_name" content="?????.odis-berlin.de" />
        <meta property="og:locale" content="de_DE" />
        <meta property="og:image" content="https://?????.odis-berlin.de/open-graph-800x600.png" />
        <meta property="og:image:width" content="800" />
        <meta property="og:image:height" content="600" />
        <meta property="og:image" content="https://?????.odis-berlin.de/open-graph-1800x1600.png" />
        <meta property="og:image:width" content="1800" />
        <meta property="og:image:height" content="1600" />
        <meta property="og:image:alt" content="Vorschau vom Berliner GeoExplorer" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="GeoExplore Berlin" />
        <meta name="twitter:description" content="" />
        <meta
          name="twitter:image"
          content="https://?????.odis-berlin.de/social-image-1280x640.png"
        />
      </Head>
      <main
        className="bg-cover bg-fixed bg-odis-light-2 flex flex-col min-h-screen 
         py-8 px-10 text-odis-dark"
        style={{ backgroundImage: "url('/images/vector.svg')" }}
      >
        {/* <LanguageSwitcher setLanguage={setLanguage} language={language} /> */}
        <LogoHeader />
        <div className="lg:w-3/4 bg-white p-8 sm:p-12 rounded shadow-lg mt-8 max-w-4xl self-center">
          <div className="w-full text-right">
            <InfoModal language={language} />
          </div>
          <IntroText language={language} />
          <SearchAI language={language} />
          <AboutText />
        </div>
      </main>
    </>
  )
}
