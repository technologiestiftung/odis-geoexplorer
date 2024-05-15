'use client'

import React, { useState, useEffect, useRef } from 'react'
import reproject from 'reproject'
import { useDimensions } from '@/lib/useDimensions'

import { DownloadIcon } from '@/components/ui/icons/download'
import { LinkOutIcon } from '@/components/ui/icons/LinkOutIcon'
import { Radio } from '@/components/ui/icons/Radio'

import { AiText } from '@/components/AiText'
import { AttributeTable } from '@/components/AttributeTable'
import { MapComponent } from '@/components/Map'
import { Scatterplot } from '@/components/Scatterplot'
import { WarningBox } from '@/components/WarningBox'
import { CopyInput } from '@/components/CopyInput'

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
      if (geoData && geoData.crs && geoData.crs.properties) {
        geoData.crs.properties.name = 'EPSG:4326'
      }
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
  const [showScatterplot, setShowScatterplot] = useState<boolean>(true)
  const [isLoading, setIsLoading] = useState<string>('')

  const [error, setError] = useState('')

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

          // check if the data has geometries
          if (data.type === 'FeatureCollection') {
            if (!data.features[0]?.geometry) {
              setError('map')
              return
            }
          } else {
            if (!data?.geometry) {
              setError('map')
              return
            }
          }

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
    'text-center  md:w-48  flex bg-odis-light !text-white p-2 mr-2 rounded-md hover:bg-active hover:!text-odis-dark items-center'

  return (
    <div>
      <div className="px-4 mb-4 italic font-light">{contentDataset['Anmerkung']}</div>
      <div className="px-4 flex">
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

        <a className={buttonClass} target="_blank" href={contentDataset['Fisbroker URL']}>
          <LinkOutIcon />
          <span className="pl-2"> FIS-Broker-Eintrag</span>
        </a>
        <span className="hidden md:block w-80">
          <CopyInput url={contentDataset['Service URL']} type={contentDataset['Typ']} />
        </span>
      </div>
      <span className="block md:hidden px-4 pt-4">
        <CopyInput url={contentDataset['Service URL']} type={contentDataset['Typ']} />
      </span>

      <div className="w-full my-4 border-y" ref={ref}>
        <div className="overflow-hidden flex bg-white border-odis-dark border w-fit absolute z-10 m-2 rounded-md">
          <button
            onClick={() => {
              setShowMap(false)
              setShowScatterplot(true)
            }}
            className="flex p-2 items-center"
          >
            <Radio selected={showScatterplot} />
            <span className="pl-2">Datenraum</span>
          </button>
          <button
            onClick={() => getGeoData('map', contentDataset['Titel'])}
            className={
              'flex p-2 items-center ' +
              (error === 'map' ? ' pointer-events-none !bg-gray-300 ' : '') +
              (contentDataset['Typ'] === 'WMS'
                ? ' pointer-events-none !bg-gray-300 text-white'
                : '')
            }
            disabled={error === 'map' || isLoading === 'map' || contentDataset['Typ'] === 'WMS'}
          >
            <Radio selected={showMap} />
            <span className="pl-2">Karte</span>
          </button>
        </div>

        {/* <div
          className="bg-odis-extra-light absolute content-center text-center"
          style={{ width: '100%', height: '400px' }}
        >
          <p className="content-center ">Geodaten werden geladen</p>
        </div> */}

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
            slug={contentDataset.slug}
          />
        )}
      </div>
      {error && <WarningBox text={'Kartendaten konnten leider nicht geladen werden'} />}

      {contentDataset['Attribute'] ? (
        <AttributeTable contentDataset={contentDataset} />
      ) : contentDataset['Typ'] === 'WFS' ? (
        <WarningBox text={'Es konnten keine Attribute gefunden werden'} />
      ) : (
        <WarningBox text={'Attribute sind bei WMS nicht verfügbar'} />
      )}

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
