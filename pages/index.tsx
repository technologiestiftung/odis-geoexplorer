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
      </Head>
      <main
        className="bg-odis-light-2 flex flex-col min-h-screen bg-cover bg-center bg-no-repeat py-8 px-10 text-odis-dark"
        style={{ backgroundImage: "url('/images/vector.svg')" }}
      >
        <LanguageSwitcher setLanguage={setLanguage} language={language} />
        <LogoHeader />
        <div className="md:w-3/4 bg-white p-8 sm:p-12 rounded border border-input mt-8 max-w-4xl self-center">
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
