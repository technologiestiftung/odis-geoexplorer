'use client'
// import { text } from '@/lib/text'

import * as d3 from 'd3'
import { useState, useRef, useEffect } from 'react'

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
  const [searchText, setSearchText] = useState<string>('')
  const [scaleFactor, setScaleFactor] = useState(0) // Initial scale factor
  const gRef = useRef(null)

  useEffect(() => {
    // Define interpolation function
    const interpolateScaleFactor = d3.interpolate(0, 7)

    // Define timer function
    const timer = d3.timer((elapsed) => {
      // Calculate progress
      const progress = Math.min(1, elapsed / 2000) // 2000ms duration for animation

      // Update scaleFactor using interpolation function
      setScaleFactor(interpolateScaleFactor(progress))

      // Check if animation is complete
      if (progress === 1) {
        timer.stop() // Stop the timer
      }
    })

    // Cleanup function
    return () => {
      timer.stop() // Stop the timer if component unmounts
    }
  }, []) // This effect runs only once on mount

  //   useEffect(() => {
  //     const dragHandler = d3.drag().on('drag', function (event) {
  //       console.log('--------')

  //       const currentTransform = d3.select(this).attr('transform')
  //       const translate = currentTransform
  //         .substring(currentTransform.indexOf('(') + 1, currentTransform.indexOf(')'))
  //         .split(',')
  //       const newX = parseInt(translate[0]) + event.dx
  //       const newY = parseInt(translate[1]) + event.dy
  //       d3.select(this).attr('transform', `translate(${newX},${newY})`)
  //     })

  //     console.log('ööölllll')

  //     d3.select(gRef.current).call(dragHandler)
  //   }, [])

  useEffect(() => {
    const svg = d3.select(gRef.current) // Ensure this selects the <g> element

    const dragHandler = d3
      .drag()
      .on('start', function (event) {
        // Optional: action on drag start
      })
      .on('drag', function (event) {
        // Adjust the transform to move the element
        d3.select(this).attr('transform', `translate(${event.x},${event.y})`)

        console.log('ääää')
      })

    svg.call(dragHandler)
  }, [])

  const zoomIn = () => {
    setScaleFactor(scaleFactor + 1)
  }

  const zoomOut = () => {
    if (scaleFactor > 1) {
      setScaleFactor(scaleFactor - 1)
    }
  }

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

  const transform = `translate(${width / 2 - xScale(newCenter[0]) * scaleFactor}, ${
    height / 2 - yScale(newCenter[1]) * scaleFactor
  }) scale(${scaleFactor})`

  // Build the shapes
  const allShapes = scatterPlotData.map((d, i) => {
    return (
      <g>
        <circle
          key={i}
          points={`${xScale(d[0]) - 5},${yScale(d[1])} ${xScale(d[0])},${yScale(d[1]) - 5} ${
            xScale(d[0]) + 5
          },${yScale(d[1])} ${xScale(d[0])},${yScale(d[1]) + 5}`}
          r={((d[2] === slug ? 2 : 1) * scaleFactor) / 2 / 4}
          // r={(d[2] === slug ? 22 : 8) / scaleFactor}
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
              xPos: e.clientX + 10,
              yPos: e.clientY + 10,
              name: d[3],
              slugName: d[2],
            })
            e.stopPropagation()
            e.preventDefault()
          }}
          onMouseLeave={() => setHovered(null)}
          onClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
            setSearchText(d[3])
          }}
          className={`cursor-pointer ${d[2] === slug ? '' : 'z-20'}`}
        />
      </g>
    )
  })

  const allLines = scatterPlotData.map((d, i) => {
    return (
      <g>
        <line
          x1={xScale(newCenter[0])}
          y1={yScale(newCenter[1])}
          x2={xScale(d[0])}
          y2={yScale(d[1])}
          stroke={'#B3F2E0'}
          strokeWidth={0.5 / scaleFactor}
          strokeOpacity={0.5}
        />
      </g>
    )
  })

  const buttonClass =
    'absolute m-2 text-center w-48 bg-odis-light !text-white p-2 mr-2 rounded-md hover:bg-active hover:!text-odis-dark items-center w-40 truncate overflow-hidden'

  return (
    <div style={{ position: 'relative' }} className="my-4 border-y ">
      {searchText && (
        <button
          onClick={(e) => {
            setSimilarSearchText(searchText)
          }}
          className={buttonClass}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="mr-2 inline"
            viewBox="0 0 16 16"
          >
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
          </svg>
          {searchText}
        </button>
      )}

      <div className="rounded-md absolute m-2 mt-2 right-0 z-10 inline-grid bg-white p-2 ">
        <button className="mb-2" onClick={zoomIn} title="zoom in">
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

        <button onClick={zoomOut} title="zoom out">
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
      <svg
        width={width}
        height={height}
        fill="white"
        onClick={() => {
          setSearchText('')
        }}
      >
        {/* <defs>
          <radialGradient id="grad6" cx="50%" cy="50%" r="30%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="#B3F2E0" stopOpacity="1" />
            <stop offset="100%" stopColor="rgba(230, 240, 247,0)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx={width / 2} cy={height / 2} rx={width} ry={height} fill="url(#grad6)" /> */}

        {/* <g transform={transform}> */}
        <g transform={transform}>
          {/* <g transform={transform} ref={(node) => d3.select(node).call(dragHandler)}> */}
          {allLines}

          {allShapes}
        </g>
      </svg>

      {hovered && (
        <div
          className={
            'fixed p-1 rounded max-w-48 text-md z-20 px-2 border border-odis-dark ' +
            (hovered.slugName === slug ? 'bg-active text-odis-dark' : 'bg-white text-odis-dark')
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
