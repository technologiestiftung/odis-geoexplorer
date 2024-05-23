'use client'

import React, { useState, useEffect } from 'react'
import { InfoIcon } from '@/components/ui/icons/info'

import { DatasetInfoExtended } from '@/components/DatasetInfoExtended'
import { SimilarityRating } from '@/components/SimilarityRating'

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

export function DatasetInfoRow(props) {
  const { result, inputText, typeFilterValue, setSimilarSearchText, scatterPlotData } = props

  const [showExtraInfo, setShowExtraInfo] = useState<boolean>(false)
  let content = result.parsedContent ? result.parsedContent : {}
  // content['rawContent'] = result.content
  content['slug'] = result.slug

  // Return the JSX for your component
  return (
    <>
      {typeFilterValue.includes(content['Typ']) && (
        <li
          className={
            'hover:bg-odis-extra-light border-b-[1px] overflow-hidden ' +
            (showExtraInfo ? ' bg-odis-extra-light' : '')
          }
        >
          <div
            onClick={() => {
              setShowExtraInfo(!showExtraInfo)
            }}
            key={result.id}
            className="sm:flex cursor-pointer"
          >
            <div className="flex md:basis-4/6 sm:basis-3/4 p-4 overflow-hidden">
              <div className="w-12 font-bold  border !border-odis-dark rounded-full p-1 px-2 h-max mr-4 self-center text-xs">
                {content['Typ']}
              </div>
              <span className="">
                {content['Titel'].replace(' - \\[WMS]', '').replace(' - \\[WFS]', '')}
              </span>
            </div>
            <div className="m-4 md:basis-2/6 sm:basis-1/4 sm:flex hidden">
              <span className="basis-1/2 ml-2">
                <SimilarityRating similarity={result.similarity}></SimilarityRating>
              </span>
              <button
                onClick={() => {
                  setShowExtraInfo(!showExtraInfo)
                }}
                type="submit"
                className="lg:block hidden basis-1/2 text-white text-xs  rounded-md md:w-24 px-1 py-1 md:hover:bg-active md:bg-odis-light md:hover:text-odis-dark  absolute right-0 mr-4"
              >
                <span className="md:block hidden">
                  {showExtraInfo ? 'Weniger Infos' : 'Mehr Infos'}
                </span>
              </button>
            </div>
            <div className="sm:hidden w-full mx-4 mb-2 flex">
              <span className="pr-2 ml-16">Übereinstimmung:</span>{' '}
              <SimilarityRating similarity={result.similarity}></SimilarityRating>
            </div>
          </div>

          {showExtraInfo && (
            <div>
              <div className="">
                <DatasetInfoExtended
                  contentDataset={content}
                  inputText={inputText}
                  setSimilarSearchText={setSimilarSearchText}
                  scatterPlotData={scatterPlotData}
                />
              </div>
            </div>
          )}
        </li>
      )}
    </>
  )
}
