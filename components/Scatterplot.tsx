'use client'
// import { text } from '@/lib/text'

import * as d3 from 'd3'
import { useState } from 'react'
// import { InteractionData, Tooltip } from './Tooltip'

const MARGIN = { top: 60, right: 60, bottom: 60, left: 60 }

type ElementType = [number, number, string]

type ScatterplotProps = {
  scatterPlotData: Array<ElementType>
  width: number
  height: number
  setSimilarSearchText: any
  title: string
  slug: string
}
export type InteractionData = {
  xPos: number
  yPos: number
  name: string
}

export function Scatterplot({
  scatterPlotData,
  width,
  height,
  setSimilarSearchText,
  title,
  slug,
}: ScatterplotProps) {
  console.log('slug', slug)

  const boundsWidth = width - MARGIN.right - MARGIN.left
  const boundsHeight = height - MARGIN.top - MARGIN.bottom

  const [hovered, setHovered] = useState<InteractionData | null>(null)

  let embeddingCoo = scatterPlotData.filter((d) => d[2] === slug)
  embeddingCoo = [embeddingCoo[0][0], embeddingCoo[0][1]]

  // Scales
  const xVals = scatterPlotData.map((d) => Number(d[0]) ?? d[0])
  const yVals = scatterPlotData.map((d) => Number(d[1]) ?? d[1])

  function getCoordinatesWithinRadius(
    scatterPlotData,
    point,
    radiusPercent,
    minX,
    maxX,
    minY,
    maxY
  ) {
    // Calculate the total range for x and y dimensions
    const totalRangeX = maxX - minX
    const totalRangeY = maxY - minY

    // Calculate the radius based on the total range and percentage
    const radiusX = totalRangeX * (radiusPercent / 100)
    const radiusY = totalRangeY * (radiusPercent / 100)

    // Filter the coordinates within the radius
    return scatterPlotData.filter((coord) => {
      const [x, y] = coord
      return Math.abs(x - point[0]) <= radiusX && Math.abs(y - point[1]) <= radiusY
    })
  }

  const filteredPoints = getCoordinatesWithinRadius(
    scatterPlotData,
    embeddingCoo,
    10,
    Math.min(...xVals),
    Math.max(...xVals),
    Math.min(...yVals),
    Math.max(...yVals)
  )

  console.log('filteredPoints', filteredPoints)

  const xValsFiltered = filteredPoints.map((d) => Number(d[0]) ?? d[0])
  const yValsFiltered = filteredPoints.map((d) => Number(d[1]) ?? d[1])

  const minMaxY = [Math.min(...yValsFiltered), Math.max(...yValsFiltered)]
  const minMaxX = [Math.min(...xValsFiltered), Math.max(...xValsFiltered)]

  const yScale = d3.scaleLinear().domain(minMaxY).range([boundsHeight, 0])
  const xScale = d3.scaleLinear().domain(minMaxX).range([0, boundsWidth])

  // Build the shapes
  const allShapes = scatterPlotData.map((d, i) => {
    return (
      <circle
        key={i}
        r={d[2] === slug ? 18 : 8}
        cx={xScale(d[0])}
        cy={yScale(d[1])}
        stroke={'#1d2c5d'}
        fill={d[2] === slug ? '#B3F2E0' : '#1d2c5d'}
        fillOpacity={d[2] === slug ? 0.9 : 0.5}
        onMouseEnter={() =>
          setHovered({
            xPos: xScale(d[0]),
            yPos: yScale(d[1]),
            name: d[2],
          })
        }
        onMouseLeave={() => setHovered(null)}
        onClick={() => {
          setSimilarSearchText(d[2])
        }}
        className={`cursor-pointer ${d[2] === slug ? '' : 'z-20'}`}
      />
    )
  })

  return (
    // <div ref={mapContainer} style={{ width: '100%', height: '400px' }}>
    <div style={{ position: 'relative' }} className="my-2 bg-odis-light-2 ">
      <svg width={width} height={height} fill="white">
        <g
          width={boundsWidth}
          height={boundsHeight}
          transform={`translate(${[MARGIN.left, MARGIN.top].join(',')})`}
        >
          {/* Circles */}
          {allShapes}
        </g>
      </svg>

      {/* Tooltip */}
      {/* <div
        style={{
          width: boundsWidth,
          height: boundsHeight,
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          marginLeft: MARGIN.left,
          marginTop: MARGIN.top,
        }}
      >
        <Tooltip interactionData={hovered} />
      </div> */}

      {hovered && (
        <div
          //   className="absolute bg-odis-light text-white p-1 rounded w-max text-xl z-20 px-2"
          className={
            'absolute p-1 rounded w-max text-xl z-20 px-2 ' +
            (hovered.name === slug ? 'bg-active text-odis-dark' : 'bg-odis-dark text-white')
          }
          style={{
            left: hovered.xPos,
            top: hovered.yPos,
          }}
        >
          {hovered.name}
        </div>
      )}
    </div>
  )
}
