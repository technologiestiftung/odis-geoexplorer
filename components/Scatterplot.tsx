'use client'
// import { text } from '@/lib/text'

import * as d3 from 'd3'
import { useState } from 'react'

type ElementType = [number, number, string]

type ScatterplotProps = {
  scatterPlotData: Array<ElementType>
  width: number
  height: number
  setSimilarSearchText: any
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
  slug,
}: ScatterplotProps) {
  console.log('scatterPlotData', scatterPlotData)

  const [hovered, setHovered] = useState<InteractionData | null>(null)
  const [searchText, setSearchText] = useState<string>('')

  const scaleFactor = 6

  // Scales
  const xVals = scatterPlotData.map((d) => Number(d[0]) ?? d[0])
  const yVals = scatterPlotData.map((d) => Number(d[1]) ?? d[1])

  const minMaxY = [Math.min(...yVals), Math.max(...yVals)]
  const minMaxX = [Math.min(...xVals), Math.max(...xVals)]

  const yScale = d3.scaleLinear().domain(minMaxY).range([height, 0])
  const xScale = d3.scaleLinear().domain(minMaxX).range([0, width])

  let newCenter = scatterPlotData.filter((d) => d[2] === slug)
  let selectedName = newCenter[0][3]
  newCenter = [Number(newCenter[0][0]), Number(newCenter[0][1])]

  scatterPlotData = scatterPlotData.filter((d) => d[2] !== slug)
  scatterPlotData = [[...newCenter, slug, selectedName], ...scatterPlotData]
  //   scatterPlotData.push([...newCenter, slug])

  const transform = `translate(${width / 2 - xScale(newCenter[0]) * scaleFactor}, ${
    height / 2 - yScale(newCenter[1]) * scaleFactor
  }) scale(${scaleFactor})`

  // Build the shapes
  const allShapes = scatterPlotData.map((d, i) => {
    return (
      <circle
        key={i}
        r={(d[2] === slug ? 22 : 8) / scaleFactor}
        cx={xScale(d[0])}
        cy={yScale(d[1])}
        stroke={d[2] === slug ? '#fff' : '#1d2c5d'}
        strokeWidth={1 / scaleFactor}
        fill={d[2] === slug ? '#B3F2E0' : '#1d2c5d'}
        fillOpacity={d[2] === slug ? 1 : 0.1}
        onMouseEnter={(e) => {
          e.stopPropagation()
          e.preventDefault()
          setHovered({
            // xPos: xScale(d[0]),
            // yPos: yScale(d[1]),
            // xPos: 10,
            // yPos: 10,
            xPos: e.clientX + 10,
            yPos: e.clientY + 10,
            name: d[3],
          })
          e.stopPropagation()
          e.preventDefault()
        }}
        onMouseLeave={() => setHovered(null)}
        onClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
          setSearchText(d[3])
          //   setSimilarSearchText(d[2])
        }}
        className={`cursor-pointer ${d[2] === slug ? '' : 'z-20'}`}
      />
    )
  })

  const buttonClass =
    'absolute m-2 text-center w-52 flex bg-odis-light !text-white p-2 mr-2 rounded-md hover:bg-active hover:!text-odis-dark items-center'

  return (
    <div style={{ position: 'relative' }} className="my-4 border-y ">
      {searchText && (
        <button
          className={buttonClass}
          onClick={(e) => {
            setSimilarSearchText(searchText)
          }}
        >
          {searchText}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="ml-2"
            viewBox="0 0 16 16"
          >
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
          </svg>
        </button>
      )}
      <svg
        width={width}
        height={height}
        fill="white"
        onClick={() => {
          setSearchText('')
        }}
      >
        <defs>
          <radialGradient id="grad6" cx="50%" cy="50%" r="30%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="#B3F2E0" stopOpacity="1" />
            <stop offset="100%" stopColor="rgba(230, 240, 247,0)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx={width / 2} cy={height / 2} rx={width} ry={height} fill="url(#grad6)" />

        <g transform={transform}>
          {' '}
          {/* Circles */}
          {allShapes}
        </g>
      </svg>

      {hovered && (
        <div
          className={
            'fixed p-1 rounded max-w-48 text-md z-20 px-2 border border-odis-dark ' +
            (hovered.name === slug ? 'bg-active text-odis-dark' : 'bg-white text-odis-dark')
          }
          style={{
            left: hovered.xPos,
            top: hovered.yPos,
          }}
        >
          {hovered.name}
        </div>
      )}
      <p className="p-2">
        {/* <p className="p-2 absolute bottom-0 pointer-events-none"> */}
        Die Positionen der Datenpunkte zueinander zeigen, wie ähnlich sie von der KI betrachtet
        werden.
      </p>
    </div>
  )
}
