'use client'

import React, { useState, useEffect } from 'react'
import { SearchIcon } from '@/components/ui/icons/search'
import { LoaderIcon } from '@/components/ui/icons/loader'
import { LoaderCrossIcon } from '@/components/ui/icons/loaderCross'

import { DatasetInfoRow } from '@/components/DatasetInfoRow'
import { text } from '@/lib/text'
import { TypeFilter } from '@/components/TypeFilter'

import { useMatomo } from '@/lib/useMatomo'

const MATCHTHERSHOLD = 0.26
const MATCHTCOUNT = 40

export function SearchAI({ language }) {
  const [inputText, setInputText] = useState<string>('')
  const [searchText, setSearchText] = useState<string>('')

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [searchResults, setSearchResults] = useState<Array<{ id: number }>>([]) // @to  < Array<any> || false >
  // const [creativeSearch, setCreativeSearch] = useState(false)
  // const [showExamples, setShowExamples] = useState(true)
  const [typeFilterValue, setTypeFilterValue] = useState(['WFS'])
  const [hasSearched, setHasSearched] = useState(false)
  const [similarSearchText, setSimilarSearchText] = useState('')
  const [scatterPlotData, setScatterPlotData] = useState([])
  const [showMoreSearchResults, setShowMoreSearchResults] = useState(false)
  const [matchThreshold, setMatchThreshold] = useState<number>(MATCHTHERSHOLD)
  const [matchCount, setMatchCount] = useState<number>(MATCHTCOUNT)

  useMatomo()

  useEffect(() => {
    fetch('./data/tsne_data.csv')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        return response.text()
      })
      .then((csvData) => {
        let rows = csvData.split('\n').map((row) => row.split(','))
        rows.shift()
        rows.pop()
        rows.map((d) => {
          // @ts-ignore
          d[0] = Number(d[0])
          // @ts-ignore
          d[1] = Number(d[1])
        })
        setScatterPlotData(rows)
      })
      .catch((error) => {
        console.error('There was a problem with the fetch operation:', error)
      })
  }, [])

  async function getSearchResults(inputText, matchThreshold?, newMatchCount?) {
    inputText = inputText // push WFS
    let data
    setIsLoading(true)
    try {
      let res

      res = await fetch(
        `/api/get-embeddings/?messages=${inputText}&matchthreshold=${
          matchThreshold || MATCHTHERSHOLD
        }&matchcount=${newMatchCount || MATCHTCOUNT}`,
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

  // when one clicks a point in Datenraum / Scatterplot
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
      setShowMoreSearchResults(false)
    }
  }, [inputText])

  function parseEmbeddingContent(text) {
    text = text.replaceAll('\\', '')
    const splitted = text.split('$$$\n')

    const parsedInfo = {}
    splitted.map((d, i) => {
      let key
      let value

      if (i === 0) {
        key = 'Titel'
        value = d.split('Titel: ')[1]
      } else {
        key = d.split(': ')[0].replace('*   ', '').trim()
        value = d
          .replace(key + ': ', '')
          .replace('*   ', '')
          .trim()

        value = value.replaceAll(/`/g, '')
      }
      if (key === 'Attribute' || key === 'Attribute Beschreibung') {
        value = value.split(',')
        value = value.filter((value, index, self) => {
          return self.indexOf(value) === index
        })
      }
      parsedInfo[key] = value
    })

    return parsedInfo
  }

  async function searchForEmbedding(inputText) {
    if (isLoading || inputText === '') {
      return
    }
    setSearchText(inputText)

    setSearchResults([])
    setHasSearched(false)
    setMatchThreshold(MATCHTHERSHOLD)
    setMatchCount(MATCHTCOUNT)

    const { embeddings } = await getSearchResults(inputText)
    console.log('embeddings: ', embeddings)
    setHasSearched(true)

    embeddings.forEach((embedding) => {
      let parsedContent = embedding.dataset_info ? embedding.dataset_info : {}

      embedding.parsedContent = parsedContent
    })

    setSearchResults(embeddings)
    setShowMoreSearchResults(true)
  }

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    searchForEmbedding(inputText)
  }

  async function getMoreSearchResults() {
    if (isLoading || inputText === '') {
      return
    }
    const newMatchThreshold = matchThreshold - 0.02
    if (newMatchThreshold < 0) {
      setShowMoreSearchResults(false)
      return
    }
    setMatchThreshold(newMatchThreshold)
    const newMatchCount = matchCount + 10
    setMatchCount(newMatchCount)

    const { embeddings } = await getSearchResults(inputText, newMatchThreshold, newMatchCount)
    embeddings.forEach((embedding) => {
      let parsedContent = embedding.dataset_info ? embedding.dataset_info : {}

      embedding.parsedContent = parsedContent
    })

    console.log('embeddings: ', embeddings)

    setHasSearched(true)

    if (embeddings.length === searchResults.length) {
      setShowMoreSearchResults(false)
    }

    // function mergeUniqueArrays(arr1, arr2, key) {
    //   const mergedArray = [...arr1, ...arr2]
    //   const uniqueObjects = mergedArray.filter(
    //     (obj, index, self) => index === self.findIndex((t) => t[key] === obj[key])
    //   )
    //   return uniqueObjects
    // }

    // console.log('embeddingsembeddings', embeddings)

    // const allResults = mergeUniqueArrays(searchResults, embeddings, 'id')

    setSearchResults(embeddings)
  }

  return (
    <div className="chat-container relative mt-4">
      <form onSubmit={handleSubmit} className="relative">
        <input
          disabled={isLoading}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60 pl-4 pr-[45px] "
          placeholder={text[language].searchPlaceholder}
        />
        <button className="absolute right-4 top-2 text-gray-500 " type="submit">
          {isLoading ? <LoaderCrossIcon animate={isLoading} /> : <SearchIcon />}
        </button>
      </form>

      <div className="suggestions mt-4 text-xs text-odis-dark ">
        {text[language]?.exampleQuestions.map((item, index) => (
          <button
            type="button"
            key={index}
            className="rounded-md px-3 py-1 m-1 ml-0
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
      </div>

      {searchResults && searchResults?.length > 0 && (
        <>
          <TypeFilter
            selectedValues={typeFilterValue}
            setSelectedValues={setTypeFilterValue}
            searchResults={searchResults}
          />

          <div className="mt-2 overflow-auto rounded-md border border-input text-sm [&_ul]:list-disc [&_li]:ml-4 [&_a]:text-blue-500">
            <div>
              {/* <table className="w-full"> */}
              <ul className="w-full">
                <li className="border-b-[1px] md:text-lg text-left flex font-bold">
                  <div className="md:basis-4/6 sm:basis-3/4 m-4 ">Datensatztitel</div>
                  <div className="md:basis-2/6 sm:basis-1/4 m-4 hidden sm:block">Similarity</div>
                </li>
                {searchResults.map((result) => (
                  <React.Fragment key={result.id}>
                    <DatasetInfoRow
                      result={result}
                      inputText={inputText}
                      typeFilterValue={typeFilterValue}
                      setSimilarSearchText={setSimilarSearchText}
                      scatterPlotData={scatterPlotData}
                    ></DatasetInfoRow>
                  </React.Fragment>
                ))}
              </ul>
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

      {hasSearched && showMoreSearchResults && (
        <button
          className="flex items-center -translate-x-2/4 left-1/2 absolute underline text-odis-light  pt-2 text-sm"
          onClick={getMoreSearchResults}
        >
          Suche erweitern
          {isLoading && (
            <span className="pl-2 w-6 scale-50">
              <LoaderIcon />
            </span>
          )}
        </button>
      )}

      {!showMoreSearchResults && searchResults.length ? (
        <p className="flex items-center -translate-x-2/4 left-1/2 absolute text-gray-500  pt-2 text-sm">
          keine weiteren Ergebnisse
        </p>
      ) : null}
    </div>
  )
}
