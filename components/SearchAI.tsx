'use client'

import React, { useState, useEffect } from 'react'
import { SearchIcon } from '@/components/ui/icons/search'
import { LoaderIcon } from '@/components/ui/icons/loader'
import { LoaderCrossIcon } from '@/components/ui/icons/loaderCross'

import { DatasetInfoRow } from '@/components/DatasetInfoRow'
import { text } from '@/lib/text'
import { TypeFilter } from '@/components/TypeFilter'

export function SearchAI({ language }) {
  const [inputText, setInputText] = useState<string>('')
  const [searchText, setSearchText] = useState<string>('')

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [searchResults, setSearchResults] = useState<Array<object>>([]) // @to  < Array<any> || false >
  const [creativeSearch, setCreativeSearch] = useState(false)
  const [showExamples, setShowExamples] = useState(true)
  const [typeFilterValue, setTypeFilterValue] = useState(['WFS', 'WMS'])
  const [hasSearched, setHasSearched] = useState(false)

  const [similarSearchText, setSimilarSearchText] = useState('')

  async function getSearchResults(inputText) {
    let data
    setIsLoading(true)
    try {
      let res

      res = await fetch(
        `/api/get-embeddings/?messages=${inputText}&matchthreshold=${
          // creativeSearch ? 0.3 : 0.78
          // 0.3
          0.78
        }`,
        {
          cache: process.env.NODE_ENV === 'development' ? 'no-store' : 'default',
        }
      )

      if (res.ok) {
        data = await res.json()
      }
    } catch (error) {
      setIsLoading(false)
      console.error(error)
    } finally {
      setIsLoading(false)
      return data
    }
  }

  useEffect(() => {
    if (similarSearchText) {
      setInputText(similarSearchText)
      searchForEmbedding(similarSearchText)
    }
  }, [similarSearchText])

  useEffect(() => {
    if (inputText === '') {
      setSearchResults([])
      setHasSearched(false)
    }
  }, [inputText])

  async function searchForEmbedding(inputText) {
    if (isLoading || inputText === '') {
      return
    }
    const { embeddings } = await getSearchResults(inputText)
    console.log('embeddings: ', embeddings)
    setSearchText(inputText)
    setHasSearched(true)
    setSearchResults(embeddings)
  }

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    searchForEmbedding(inputText)
  }

  return (
    <div className="chat-container relative mt-4">
      <form onSubmit={handleSubmit} className="relative">
        <input
          disabled={isLoading}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex h-10 w-full rounded-full border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60 pl-4 pr-[45px] "
          placeholder={text[language].searchPlaceholder}
        />
        <button className="absolute right-4 top-2 text-gray-500 " type="submit">
          {isLoading ? <LoaderCrossIcon animate={isLoading} /> : <SearchIcon />}
        </button>
      </form>

      <div className="suggestions mt-4 text-xs text-odis-dark ">
        <button
          className="flex align-center"
          onClick={() => {
            setShowExamples(!showExamples)
          }}
          style={{ alignItems: 'center' }}
        >
          <span className="pr-2"> {text[language].exampleText}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="10"
            height="10"
            fill="currentColor"
            viewBox="0 0 16 16"
            className={showExamples ? 'rotate-180' : ''}
          >
            <path
              fillRule="evenodd"
              d="M7.022 1.566a1.13 1.13 0 0 1 1.96 0l6.857 11.667c.457.778-.092 1.767-.98 1.767H1.144c-.889 0-1.437-.99-.98-1.767z"
            />
          </svg>
        </button>
        {showExamples && (
          <>
            {text[language]?.exampleQuestions.map((item, index) => (
              <button
                type="button"
                key={index}
                className="rounded-full px-3 py-1 m-1 ml-0
                  bg-odis-light-2 
                  hover:active hover:bg-active text-odis-dark
                  transition-colors"
                onClick={() => {
                  setInputText(item)
                }}
              >
                {item}
              </button>
            ))}
          </>
        )}
      </div>

      {searchResults && searchResults?.length > 0 && (
        <>
          <TypeFilter selectedValues={typeFilterValue} setSelectedValues={setTypeFilterValue} />

          <div className="mt-2 overflow-auto rounded-md border border-input text-sm [&_ul]:list-disc [&_li]:ml-4 [&_a]:text-blue-500">
            <div>
              {/* <table className="w-full"> */}
              <ul className="w-full">
                <li className="border-b-[1px] text-lg text-left flex font-bold">
                  <div className="basis-3/5 m-4">Datensatztitel</div>
                  <div className="basis-1/5  m-4">Übereinstimmung</div>
                  <div className="basis-1/5 m-4"></div>
                </li>
                {searchResults.map((result) => (
                  <React.Fragment key={result.id}>
                    <DatasetInfoRow
                      result={result}
                      inputText={inputText}
                      typeFilterValue={typeFilterValue}
                      setSimilarSearchText={setSimilarSearchText}
                    ></DatasetInfoRow>
                  </React.Fragment>
                ))}
              </ul>
              {/* </table> */}
            </div>
          </div>
        </>
      )}
      {/* If no results found */}
      {hasSearched && inputText !== '' && searchResults && searchResults.length == 0 && (
        <div className=" bg-odis-extra-light text-odis-light border-odis-light mt-8 overflow-auto rounded-md border border-input p-4">
          Leider wurde zu "<span className="font-bold">{`${searchText}`}</span>" keine Datensätze
          gefunden.
        </div>
      )}
    </div>
  )
}
