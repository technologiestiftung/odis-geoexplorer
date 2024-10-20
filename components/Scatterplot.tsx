'use client'
import * as d3 from 'd3'
import { useState, useRef, useEffect } from 'react'
import { InfoIcon } from '@/components/ui/icons/info'

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
  slugName: string
  transformOriginX: string
  transformOriginY: string
}

export function Scatterplot({
  scatterPlotData,
  width,
  height,
  setSimilarSearchText,
  slug,
}: ScatterplotProps) {
  const initScale = 7

  const [hovered, setHovered] = useState<InteractionData | null>(null)
  const [searchText, setSearchText] = useState<string>('')
  const [scaleFactor, setScaleFactor] = useState(initScale) // Initial scale factor
  const [scaleDirection, setScaleDirection] = useState('') // Initial scale factor
  const [hasZoomed, setHasZoomed] = useState(false) // Initial scale factor
  // set transform here

  const [hasBeenDragged, setHasBeenDragged] = useState(false) // Initial scale factor

  const svgRef = useRef(null)

  const zoomIn = () => {
    if (scaleFactor < 20) {
      setScaleFactor(scaleFactor + 1)
      setScaleDirection('in')
      setSearchText('')
      setHovered(null)
    }
  }

  const zoomOut = () => {
    if (scaleFactor > 1) {
      setScaleFactor(scaleFactor - 1)
      setScaleDirection('out')
      setSearchText('')
      setHovered(null)
    }
  }

  useEffect(() => {
    // Scales
    const xVals = scatterPlotData.map((d) => Number(d[0]) ?? d[0])
    const yVals = scatterPlotData.map((d) => Number(d[1]) ?? d[1])

    const minMaxY = [Math.min(...yVals), Math.max(...yVals)]
    const minMaxX = [Math.min(...xVals), Math.max(...xVals)]

    const yScale = d3.scaleLinear().domain(minMaxY).range([height, 0])
    const xScale = d3.scaleLinear().domain(minMaxX).range([0, width])

    // const rScale = d3.scaleLinear().domain([1, 20]).range([1, 1])

    let newCenter = scatterPlotData.filter((d) => d[2] === slug)
    if (!newCenter[0]) return
    // @ts-ignore
    let selectedName = newCenter[0][3]
    // @ts-ignore
    newCenter = [Number(newCenter[0][0]), Number(newCenter[0][1])]

    scatterPlotData = scatterPlotData.filter((d) => d[2] !== slug)
    // @ts-ignore
    scatterPlotData = [[...newCenter, slug, selectedName], ...scatterPlotData]

    let transform = `translate(${width / 2 - xScale(newCenter[0]) * scaleFactor}, ${
      height / 2 - yScale(newCenter[1]) * scaleFactor
    }) scale(${scaleFactor})`

    if (scaleFactor !== initScale || hasZoomed || hasBeenDragged) {
      setHasZoomed(true)
      const currentTransform = d3.select(svgRef.current).select('g').attr('transform')
      const translate = currentTransform
        .substring(currentTransform.indexOf('(') + 1, currentTransform.indexOf(')'))
        .split(',')

      const oldZoom = !scaleDirection
        ? scaleFactor
        : scaleDirection === 'in'
        ? scaleFactor - 1
        : scaleFactor + 1
      const newX = -(((-parseInt(translate[0]) + width / 2) * scaleFactor) / oldZoom - width / 2)
      const newY = -(((-parseInt(translate[1]) + height / 2) * scaleFactor) / oldZoom - height / 2)
      transform = `translate(${newX},${newY}) scale(${scaleFactor})`
      setScaleDirection('')
    }

    const dragHandler = d3
      .drag()
      .on('drag', function (event) {
        const currentTransform = d3.select(this).select('g').attr('transform')
        const translate = currentTransform
          .substring(currentTransform.indexOf('(') + 1, currentTransform.indexOf(')'))
          .split(',')

        const newX = parseInt(translate[0]) + event.dx
        const newY = parseInt(translate[1]) + event.dy
        setHasBeenDragged(true)
        d3.select(this)
          .select('g')
          .attr('transform', `translate(${newX},${newY}) scale(${scaleFactor})`)
        setSearchText('')
        setHovered(null)
      })
      .on('end', () => {
        d3.select(svgRef.current).style('cursor', 'grab')
      })

    d3.select(svgRef.current).select('g').remove()

    // Initial render of the scatterplot
    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .style('background', 'white')
      .on('mousedown', () => {
        d3.select(svgRef.current).style('cursor', 'grabbing')
      })
      .on('mouseup', () => {
        d3.select(svgRef.current).style('cursor', 'grab')
      })
      .call(dragHandler)

    const group = svg.append('g').attr('transform', transform)

    group
      .selectAll('line')
      .data(scatterPlotData)
      .join('line')
      .attr('x1', (d) => xScale(newCenter[0]))
      .attr('y1', (d) => yScale(newCenter[1]))
      .attr('x2', (d) => xScale(d[0]))
      .attr('y2', (d) => yScale(d[1]))
      .attr('stroke', '#B3F2E0')
      .attr('stroke-width', (d) => 0.5 / scaleFactor)
      .attr('stroke-opacity', 0.5)

    // Render circles
    group
      .selectAll('circle')
      .data(scatterPlotData)
      .join('circle')
      .attr('cx', (d) => xScale(d[0]))
      .attr('cy', (d) => yScale(d[1]))
      .attr('r', (d) => {
        return (d[2] === slug ? 2 : 1) * 1
      })

      .attr('fill', (d) => (d[2] === slug ? '#B3F2E0' : '#1d2c5d'))
      .attr('fill-opacity', (d) => {
        return d[2] === slug ? 1 : 0.1
      })
      .attr('stroke', (d) => {
        return d[2] === slug ? '#fff' : '#1d2c5d'
      })
      .attr('stroke-width', (d) => 1 / scaleFactor)
      .on('mouseenter', (e, d) => {
        if (searchText) return

        e.stopPropagation()
        e.preventDefault()

        const svgRect = e.currentTarget.ownerSVGElement.getBoundingClientRect()
        let xPos = e.clientX - svgRect.left
        let yPos = e.clientY - svgRect.top

        // Determine which quadrant of the SVG we're in
        const horizontalHalf = svgRect.width / 2
        const verticalHalf = svgRect.height / 2

        let transformOriginX = xPos < horizontalHalf ? 'left' : 'right'
        let transformOriginY = yPos < verticalHalf ? 'top' : 'bottom'

        setHovered({
          xPos: e.clientX + 10,
          yPos: e.clientY + 10,
          name: d[3].replace('"', ''),
          slugName: d[2],
          transformOriginX: transformOriginX,
          transformOriginY: transformOriginY,
        })
      })
      .on('mouseleave', (e) => {
        searchText ? null : setHovered(null)
      })
      .attr('class', (d) => {
        return `${searchText ? '' : 'cursor-pointer'} ${d[2] === slug ? '' : 'z-20'}`
      })
      .on('click', (e, d) => {
        e.stopPropagation()
        e.preventDefault()
        if (searchText) {
          setSearchText('')
          setHovered(null)
        } else {
          setSearchText(d[3])
        }
      })
  }, [width, height, scaleFactor, searchText]) // Only re-render when data or size changes

  useEffect(() => {
    const handleClick = () => {
      setSearchText('')
      setHovered(null)
    }

    // Add event listener
    window.addEventListener('click', handleClick)

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener('click', handleClick)
    }
  }, []) // Empty dependency array ensures this runs only on mount and unmount

  const buttonClass =
    'absolute m-2 text-center w-48 bg-odis-light !text-white p-2 mr-2 rounded-md hover:bg-active hover:!text-odis-dark items-center w-40 truncate overflow-hidden'

  return (
    <div style={{ position: 'relative' }} className="">
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

      <svg ref={svgRef} className="cursor-grab"></svg>

      {hovered && (
        <div
          className={
            'fixed p-1 rounded max-w-48 text-md z-20 px-2 border border-odis-dark overflow-hidden ' +
            (hovered.slugName === slug ? 'bg-active text-odis-dark' : 'bg-white text-odis-dark')
          }
          style={{
            left: hovered.xPos,
            top: hovered.yPos,
            transform: `translate(${hovered.transformOriginX === 'right' ? '-110%' : '0%'},${
              hovered.transformOriginY === 'top' ? '0%' : '-120%'
            })`,
          }}
        >
          {hovered.name}

          {searchText && (
            <button
              onClick={(e) => {
                setSimilarSearchText(searchText)
              }}
              className={
                'relative m-2 text-center  bg-odis-light !text-white p-2 mr-2 rounded-md hover:bg-active hover:!text-odis-dark items-center w-40 truncate overflow-hidden'
              }
              style={{ zIndex: 40 }}
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
              explorieren
            </button>
          )}
        </div>
      )}
      <p className="bg-odis-extra-light text-odis-light flex absolute bottom-0 left-0 z-10 !font-nunito text-md rounded-md  m-2 p-2 border border-odis-light">
        <InfoIcon />
        <span className="pl-2">
          Die Positionen der Datensätze zueinander zeigen, wie ähnlich sie von der KI betrachtet
          werden.
        </span>
      </p>
    </div>
  )
}
