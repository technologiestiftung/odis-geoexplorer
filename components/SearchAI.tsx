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
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [searchResults, setSearchResults] = useState<Array<any> | boolean>(false) // @to  < Array || false >
  const [creativeSearch, setCreativeSearch] = useState(false)
  const [showExamples, setShowExamples] = useState(true)
  const [typeFilterValue, setTypeFilterValue] = useState('WFS & WMS')
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
          0.3
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

  async function searchForEmbedding(inputText) {
    if (isLoading || inputText === '') {
      return
    }
    const { embeddings } = await getSearchResults(inputText)
    console.log('embeddings: ', embeddings)

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
        <button className="absolute right-4 top-2 text-gray-500 dark:text-gray-100" type="submit">
          {isLoading ? <LoaderCrossIcon animate={isLoading} /> : <SearchIcon />}
        </button>
      </form>

      <div className="suggestions mt-4 text-xs text-gray-500 dark:text-gray-100">
        <button
          className="flex align-center"
          onClick={() => {
            setShowExamples(!showExamples)
          }}
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
                  hover:active hover:bg-active hover:text-white
                  border border-slate-200 dark:border-slate-600
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
          <TypeFilter selectedValue={typeFilterValue} setSelectedValue={setTypeFilterValue} />

          <div className="mt-2 overflow-auto rounded-md border border-input text-sm [&_ul]:list-disc [&_li]:ml-4 [&_a]:text-blue-500">
            <div>
              <table className="w-full">
                <tbody className="">
                  <tr className="border-b-[1px] text-lg text-left">
                    <th className="p-4">Datensatztitel</th>
                    <th className="p-4">Übereinstimmung</th>
                    <th className=""></th>
                  </tr>
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
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
      {/* If no results found */}
      {searchResults && searchResults.length == 0 && (
        <div className=" bg-warning-100 text-warning-300 border-warning-200 mt-8 overflow-auto rounded-md border border-input p-4">
          Leider wurde zu "<span className="font-bold">{`${inputText}`}</span>" keine Datensätze
          gefunden.
        </div>
      )}
    </div>
  )
}