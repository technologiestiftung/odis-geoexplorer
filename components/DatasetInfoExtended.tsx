'use client'

import React, { useState, useEffect, useRef } from 'react'
import reproject from 'reproject'
import { useDimensions } from '@/lib/useDimensions'

import { DownloadIcon } from '@/components/ui/icons/download'
import { useCopyToClipboard } from '@/lib/useCopyToClipboard'
// import Typewriter from './Typewriter'
// import { LoaderIcon } from '@/components/ui/icons/loader'
import { AiText } from '@/components/AiText'
import { AttributeTable } from '@/components/AttributeTable'
import { SearchIcon } from '@/components/ui/icons/search'
import { MapComponent } from '@/components/Map'
import { Scatterplot } from '@/components/Scatterplot'

export const listOfProjection = {
  'EPSG:25833': '+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
  'EPSG:3035':
    '+proj=laea +lat_0=52 +lon_0=10 +x_0=4321000 +y_0=3210000 +ellps=GRS80 +units=m +no_defs +type=crs',
}

const MAXFEATURES = 500

async function getWFSFeature(url, typeName, purpose) {
  // &SRSNAME=EPSG:4258
  let downloadUrl: string
  if (purpose === 'map') {
    downloadUrl = `${url}?service=WFS&version=1.1.0&request=GetFeature&typeName=${typeName}&outputFormat=application/json&COUNT=${MAXFEATURES}&MAXFEATURES=${MAXFEATURES}`
  }
  if (purpose === 'download') {
    downloadUrl = `${url}?service=WFS&version=1.1.0&request=GetFeature&typeName=${typeName}&outputFormat=application/json`
  }

  console.log('downloadUrldownloadUrl', downloadUrl)

  // Return the promise chain
  return fetch(downloadUrl)
    .then((response) => response.json())
    .then((geojson) => {
      // convert the geodata to EPSG:4326
      let epsg = geojson?.crs?.properties?.name
      epsg = epsg.trim().split(':').pop()
      epsg = 'EPSG:' + epsg
      let geoData = reproject.reproject(geojson, epsg, 'EPSG:4326', listOfProjection)

      return geoData
    })
}

export function DatasetInfoExtended({
  contentDataset,
  inputText,
  setSimilarSearchText,
  scatterPlotData,
}) {
  const [showMap, setShowMap] = useState<boolean>(false)
  const [geoJSON, setGeoJSON] = useState<object | boolean>(false)
  const [showScatterplot, setShowScatterplot] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<string>('')

  const [error, setError] = useState('')

  const { copyToClipboard, hasCopied } = useCopyToClipboard()
  const ref = useRef<HTMLDivElement>(null)
  const visDimensions = useDimensions(ref)

  function downloadData(jsonData, title) {
    const jsonString = JSON.stringify(jsonData)

    // Create blob object
    const blob = new Blob([jsonString], { type: 'application/json' })

    // Create URL from blob
    const url = URL.createObjectURL(blob)

    // Create a link element
    const link = document.createElement('a')
    link.href = url
    const docTitle = title.trim().replaceAll(' ', '_')
    link.download = docTitle

    // Append link to the body
    document.body.appendChild(link)

    // Click the link to trigger the download
    link.click()

    // Cleanup
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  async function getGeoData(purpose, title) {
    setShowScatterplot(false)
    if (purpose === 'map') {
      if (showMap) {
        setShowMap(false)
        return
      }
      if (geoJSON) {
        setShowMap(true)
      } else {
        setIsLoading(purpose)
        try {
          const data = await getWFSFeature(
            contentDataset['Service URL'],
            contentDataset['Layer Name'].replace('Type', ''),
            purpose
          )

          setGeoJSON(data)
          setShowMap(true)
          setIsLoading('')
        } catch (error) {
          // Handle errors here
          setError(purpose)
          console.error(error)
          setIsLoading('')
        }
      }
    }

    if (purpose === 'download') {
      setIsLoading(purpose)

      try {
        const data = await getWFSFeature(
          contentDataset['Service URL'],
          contentDataset['Layer Name'].replace('Type', ''),
          purpose
        )

        downloadData(data, title)
        setIsLoading('')
      } catch (error) {
        // Handle errors here
        setError(purpose)
        console.error(error)
        setIsLoading('')
      }
    }
  }

  console.log('contentDataset', contentDataset)

  const buttonClass =
    'text-center w-48 flex bg-odis-light !text-white p-2 mr-2 rounded-md hover:bg-active hover:!text-odis-dark items-center'

  return (
    <div>
      <div className="px-4 mb-4 italic font-light">{contentDataset['Anmerkung']}</div>
      <div className="px-4 flex">
        <button
          onClick={() =>
            copyToClipboard(
              `${contentDataset['Service URL'].replace('&outputFormat=application/json', '')}`
            )
          }
          className={buttonClass}
        >
          <div className="flex">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="mr-2 overflow-visible"
              viewBox="0 0 16 16"
            >
              <path
                fillRule="evenodd"
                d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z"
              />
            </svg>
            {!hasCopied ? contentDataset['Typ'] + ' kopieren' : 'kopiert!'}
          </div>
        </button>

        <button
          onClick={() => getGeoData('download', contentDataset['Titel'])}
          className={
            buttonClass +
            (error === 'download' ? ' pointer-events-none !bg-gray-300' : '') +
            (contentDataset['Typ'] === 'WMS' ? ' pointer-events-none !bg-gray-300' : '') +
            (isLoading === 'download' ? ' pointer-events-none !bg-gray-300 animate-pulse' : '')
          }
          disabled={
            error === 'download' || isLoading === 'download' || contentDataset['Typ'] === 'WMS'
          }
        >
          <DownloadIcon />
          <span className="pl-2">JSON Download</span>
        </button>
      </div>
      <div className="px-4 flex pt-2 " ref={ref}>
        <button
          onClick={() => getGeoData('map', contentDataset['Titel'])}
          className={
            buttonClass +
            (error === 'map' ? ' pointer-events-none !bg-gray-300 ' : '') +
            (contentDataset['Typ'] === 'WMS' ? ' pointer-events-none !bg-gray-300' : '') +
            (isLoading === 'map' ? ' pointer-events-none !bg-gray-300 animate-pulse' : '')
          }
          disabled={error === 'map' || isLoading === 'map' || contentDataset['Typ'] === 'WMS'}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 16 16"
            className="mr-2"
          >
            <path
              fillRule="evenodd"
              d="M15.817.113A.5.5 0 0 1 16 .5v14a.5.5 0 0 1-.402.49l-5 1a.5.5 0 0 1-.196 0L5.5 15.01l-4.902.98A.5.5 0 0 1 0 15.5v-14a.5.5 0 0 1 .402-.49l5-1a.5.5 0 0 1 .196 0L10.5.99l4.902-.98a.5.5 0 0 1 .415.103M10 1.91l-4-.8v12.98l4 .8zm1 12.98 4-.8V1.11l-4 .8zm-6-.8V1.11l-4 .8v12.98z"
            />
          </svg>
          Kartenvorschau
        </button>
        <button
          onClick={() => {
            setShowMap(false)
            setShowScatterplot(!showScatterplot)
          }}
          className={buttonClass}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="mr-2"
            viewBox="0 0 16 16"
          >
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
          </svg>
          ähnlich Datenpunkte
        </button>
      </div>

      {showMap && (
        <MapComponent
          geojsonData={geoJSON}
          setShowMap={setShowMap}
          datasetTitle={contentDataset['Titel']}
          maxFeatures={MAXFEATURES}
        />
      )}

      {showScatterplot && (
        <Scatterplot
          scatterPlotData={scatterPlotData}
          width={visDimensions.width}
          height={400}
          setSimilarSearchText={setSimilarSearchText}
          title={contentDataset['Titel']}
          slug={contentDataset.slug}
        />
      )}

      {error && (
        <div className=" bg-active-light text-active-dark border-active-dark m-2 overflow-auto rounded-md border border-input p-4">
          Kartendaten konnten leider nicht geladen werden
        </div>
      )}

      {contentDataset['Attribute'] && <AttributeTable contentDataset={contentDataset} />}

      <AiText content={contentDataset} inputText={inputText} />

      {contentDataset['Fisbroker URL'] && (
        <div className="px-4  font-light border-t-[1px] border-gray-300 py-4">
          Du findest diesen Datensatz auch im{' '}
          <a className="!text-odis-light" target="_blank" href={contentDataset['Fisbroker URL']}>
            Fis Broker
          </a>
          . Hier erhälst du Detailinformationen wie letzte Aktualisierungen, Granularität, etc.
        </div>
      )}
    </div>
  )
}
