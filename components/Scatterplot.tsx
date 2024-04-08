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
  const [hovered, setHovered] = useState<InteractionData | null>(null)

  const scaleFactor = 6

  // Scales
  const xVals = scatterPlotData.map((d) => Number(d[0]) ?? d[0])
  const yVals = scatterPlotData.map((d) => Number(d[1]) ?? d[1])

  const minMaxY = [Math.min(...yVals), Math.max(...yVals)]
  const minMaxX = [Math.min(...xVals), Math.max(...xVals)]

  const yScale = d3.scaleLinear().domain(minMaxY).range([height, 0])
  const xScale = d3.scaleLinear().domain(minMaxX).range([0, width])

  let newCenter = scatterPlotData.filter((d) => d[2] === slug)
  newCenter = [Number(newCenter[0][0]), Number(newCenter[0][1])]

  scatterPlotData = scatterPlotData.filter((d) => d[2] !== slug)
  scatterPlotData = [[...newCenter, slug], ...scatterPlotData]
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
        onMouseEnter={() =>
          setHovered({
            xPos: xScale(d[0]),
            yPos: yScale(d[1]),
            // xPos: 10,
            // yPos: 10,
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
    <div style={{ position: 'relative' }} className="my-4 bg-odis-light-2 ">
      <svg width={width} height={height} fill="white">
        <defs>
          <radialGradient id="grad6" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stop-color="#B3F2E0" stop-opacity="1" />
            <stop offset="100%" stop-color="rgba(0,0,0,0)" stop-opacity="0" />
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

      <p className="p-2">
        Die Positionen der Datenpunkte zueinander zeigen, wie ähnlich sie von der KI betrachtet
        werden.
      </p>
    </div>
  )
}
