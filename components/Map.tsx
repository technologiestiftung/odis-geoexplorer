import React, { useRef, useEffect, useState } from 'react'
import maplibregl, { Popup } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { mapStyle } from '@/lib/mapStyle'
import bbox from '@turf/bbox'
import { getType } from '@turf/invariant'
interface MapProps {
  geojsonData: any | object
  setShowMap: React.Dispatch<React.SetStateAction<boolean>>
  datasetTitle: string
  maxFeatures: number
}

import { AttentionIcon } from '@/components/ui/icons/attention'

export const MapComponent = ({ geojsonData, setShowMap, datasetTitle, maxFeatures }: MapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const popup = useRef<Popup | null>(null)
  const [featureCount, setFeatureCount] = useState<number>(0) // @to  < Array<any> || false >

  useEffect(() => {
    if (!mapContainer.current || !geojsonData) return
    let type: string
    let geoFeatureType: string
    if (geojsonData?.type === 'FeatureCollection') {
      geoFeatureType = getType(geojsonData.features[0])
    } else {
      geoFeatureType = getType(geojsonData)
    }

    if (geoFeatureType === 'MultiPolygon' || geoFeatureType === 'Polygon') {
      type = 'fill'
    } else if (geoFeatureType === 'MultiLineString' || geoFeatureType === 'LineString') {
      type = 'line'
    } else if (geoFeatureType === 'MultiPoint' || geoFeatureType === 'Point') {
      type = 'circle'
    } else {
      // GeometryCollection is not supported
      console.error('unknown geo feature: ', geojsonData)
      return
    }

    if (geojsonData.features && geojsonData.features.length) {
      setFeatureCount(geojsonData.features.length)
    }

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      // @ts-ignore
      style: mapStyle(),
      // @ts-ignore
      bounds: bbox(geojsonData),
      attributionControl: false,
      scrollZoom: false, // Disable map scroll
    })

    map.current.on('load', () => {
      map.current?.addSource('geojson-data', {
        type: 'geojson',
        data: geojsonData,
      })

      map.current?.addLayer({
        id: 'geojson-layer',
        // @ts-ignore
        type: type,
        // @ts-ignore
        source: 'geojson-data',
        paint: {
          [`${type}-color`]: '#263c89',
          [`${type}-opacity`]: 0.8,
          ...(type === 'line' && {
            [`line-width`]: 3,
          }),
        },
      })
      // @ts-ignore

      map.current?.fitBounds(bbox(geojsonData), { padding: 30 })

      map.current?.on('click', 'geojson-layer', (e) => {
        if (!e.features || !e.features[0]) return

        const feature = e.features[0]
        const properties = feature.properties
        let popupContent = '<div class="overflow-y-auto p-2 max-h-28 rounded-md">'
        popupContent += Object.entries(properties)
          .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
          .join('<br/>')
        popupContent += '<div />'

        if (popup.current) {
          popup.current.setLngLat(e.lngLat).setHTML(popupContent).addTo(map.current!)
        } else {
          popup.current = new maplibregl.Popup({ closeButton: false })
            .setLngLat(e.lngLat)
            .setHTML(popupContent)
            .addTo(map.current!)
        }
      })
    })

    return () => {
      map.current?.remove()
    }
  }, [geojsonData])

  return (
    <div className="" style={{ width: '100%' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '400px' }}>
        <button
          title="close map"
          className="absolute p-4 right-0 z-10 "
          onClick={() => setShowMap(false)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
          </svg>
        </button>

        <div className="rounded-md absolute m-2 mt-8 right-0 z-10 inline-grid bg-white p-2 bottom-4">
          <button
            className="mb-2"
            onClick={() => {
              map.current?.zoomIn()
            }}
            title="zoom in"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z" />
              <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
            </svg>
          </button>

          <button
            onClick={() => {
              map.current?.zoomOut()
            }}
            title="zoom out"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z" />
              <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8" />
            </svg>
          </button>
        </div>
        <p className="absolute bottom-0 right-2 z-10 !font-nunito text-md">
          {/* {datasetTitle} <br /> */}
          &copy;{' '}
          <a className="!text-odis-light" href="https://www.openstreetmap.org/copyright">
            OpenStreetMap
          </a>{' '}
          contributors
        </p>
        {featureCount >= maxFeatures && (
          <p className="bg-odis-extra-light text-odis-light flex absolute bottom-0 left-0 z-10 !font-nunito text-md rounded-md  m-2 p-2 border border-odis-light">
            <AttentionIcon />{' '}
            <span className="pl-2">Vorschau auf {maxFeatures} Datenpunkte eingeschränkt</span>
          </p>
        )}
      </div>
    </div>
  )
}
