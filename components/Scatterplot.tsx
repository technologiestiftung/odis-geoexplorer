'use client'
import * as d3 from 'd3'
import { useState, useRef, useEffect, useMemo } from 'react'
import { InfoIcon } from '@/components/ui/icons/info'

type ElementType = [number, number, string, string] // [tsne_x, tsne_y, slug, heading]

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
  const [scaleFactor, setScaleFactor] = useState(initScale)
  const [panX, setPanX] = useState(0)
  const [panY, setPanY] = useState(0)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const isDraggingRef = useRef(false)
  const dragStartRef = useRef({ x: 0, y: 0 })
  const panStartRef = useRef({ x: 0, y: 0 })
  const hasBeenDraggedRef = useRef(false)

  // 1. Calculate Scales based on the data boundaries
  const { xScale, yScale, newCenter } = useMemo(() => {
    const xVals = scatterPlotData.map((d) => Number(d[0]) ?? d[0])
    const yVals = scatterPlotData.map((d) => Number(d[1]) ?? d[1])

    const minMaxY = d3.extent(yVals) as [number, number]
    const minMaxX = d3.extent(xVals) as [number, number]

    const yScale = d3.scaleLinear().domain(minMaxY).range([height, 0])
    const xScale = d3.scaleLinear().domain(minMaxX).range([0, width])

    const centerPoint = scatterPlotData.find((d) => d[2] === slug)
    let centerCoords = [0, 0]
    if (centerPoint) {
      centerCoords = [Number(centerPoint[0]), Number(centerPoint[1])]
    }

    return { xScale, yScale, newCenter: centerCoords }
  }, [scatterPlotData, width, height, slug])

  // 2. Align viewport to the selected node on mount or slug change
  useEffect(() => {
    if (newCenter) {
      const initialX = width / 2 - xScale(newCenter[0]) * scaleFactor
      const initialY = height / 2 - yScale(newCenter[1]) * scaleFactor
      setPanX(initialX)
      setPanY(initialY)
    }
  }, [slug, width, height, xScale, yScale, newCenter])

  // 3. Zoom triggers pan adjustment to keep it centered
  const adjustZoom = (newScale: number) => {
    const oldScale = scaleFactor
    setScaleFactor(newScale)
    
    // Zoom relative to the center of the viewport
    const centerX = width / 2
    const centerY = height / 2
    
    setPanX((prev) => centerX - ((centerX - prev) * newScale) / oldScale)
    setPanY((prev) => centerY - ((centerY - prev) * newScale) / oldScale)
    setSearchText('')
    setHovered(null)
  }

  const zoomIn = () => {
    if (scaleFactor < 25) {
      adjustZoom(scaleFactor + 1)
    }
  }

  const zoomOut = () => {
    if (scaleFactor > 1) {
      adjustZoom(scaleFactor - 1)
    }
  }

  // Helper to find data point under screen space coordinates
  const getPointAtPosition = (mouseX: number, mouseY: number): ElementType | null => {
    let closestPoint: ElementType | null = null
    let minDistance = 10 // hit test radius in pixels

    for (const d of scatterPlotData) {
      const px = xScale(Number(d[0])) * scaleFactor + panX
      const py = yScale(Number(d[1])) * scaleFactor + panY
      const dx = mouseX - px
      const dy = mouseY - py
      const dist = dx * dx + dy * dy
      if (dist < minDistance * minDistance) {
        minDistance = Math.sqrt(dist)
        closestPoint = d
      }
    }
    return closestPoint
  }

  // 4. Render canvas loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    ctx.scale(dpr, dpr)

    ctx.clearRect(0, 0, width, height)

    // A. Draw lines from center to all other points
    const cx = xScale(newCenter[0]) * scaleFactor + panX
    const cy = yScale(newCenter[1]) * scaleFactor + panY

    ctx.beginPath()
    ctx.strokeStyle = 'rgba(179, 242, 224, 0.5)'
    ctx.lineWidth = 0.5
    for (const d of scatterPlotData) {
      // Don't draw line to itself
      if (d[2] === slug) continue
      const px = xScale(Number(d[0])) * scaleFactor + panX
      const py = yScale(Number(d[1])) * scaleFactor + panY
      ctx.moveTo(cx, cy)
      ctx.lineTo(px, py)
    }
    ctx.stroke()

    // B. Draw circles (non-selected first)
    for (const d of scatterPlotData) {
      if (d[2] === slug) continue
      const px = xScale(Number(d[0])) * scaleFactor + panX
      const py = yScale(Number(d[1])) * scaleFactor + panY

      ctx.beginPath()
      ctx.arc(px, py, 5, 0, 2 * Math.PI)
      ctx.fillStyle = '#1d2c5d'
      ctx.globalAlpha = 0.15
      ctx.fill()
      
      ctx.globalAlpha = 1.0
      ctx.lineWidth = 0.5
      ctx.strokeStyle = '#1d2c5d'
      ctx.stroke()
    }

    // C. Draw the selected center circle on top
    const px = xScale(newCenter[0]) * scaleFactor + panX
    const py = yScale(newCenter[1]) * scaleFactor + panY

    ctx.beginPath()
    ctx.arc(px, py, 4, 0, 2 * Math.PI)
    ctx.fillStyle = '#B3F2E0'
    ctx.fill()

    ctx.lineWidth = 1
    ctx.strokeStyle = '#ffffff'
    ctx.stroke()

  }, [width, height, scaleFactor, panX, panY, scatterPlotData, slug, newCenter, xScale, yScale])

  // 5. Mouse Interaction Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true
    hasBeenDraggedRef.current = false
    dragStartRef.current = { x: e.clientX, y: e.clientY }
    panStartRef.current = { x: panX, y: panY }
    const canvas = canvasRef.current
    if (canvas) canvas.style.cursor = 'grabbing'
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    if (isDraggingRef.current) {
      const dx = e.clientX - dragStartRef.current.x
      const dy = e.clientY - dragStartRef.current.y
      
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
        hasBeenDraggedRef.current = true
      }

      setPanX(panStartRef.current.x + dx)
      setPanY(panStartRef.current.y + dy)
      setSearchText((prev) => (prev !== '' ? '' : prev))
      setHovered((prev) => (prev !== null ? null : prev))
      canvas.style.cursor = 'grabbing'
    } else {
      // Hover hit testing
      if (searchText) {
        canvas.style.cursor = 'default'
        return
      }

      const rect = canvas.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      const point = getPointAtPosition(mouseX, mouseY)
      if (point) {
        // Determine quadrant
        const transformOriginX = mouseX < width / 2 ? 'left' : 'right'
        const transformOriginY = mouseY < height / 2 ? 'top' : 'bottom'

        setHovered({
          xPos: e.clientX + 10,
          yPos: e.clientY + 10,
          name: point[3].replace('"', ''),
          slugName: point[2],
          transformOriginX,
          transformOriginY,
        })
        canvas.style.cursor = 'pointer'
      } else {
        setHovered((prev) => (prev !== null ? null : prev))
        canvas.style.cursor = 'grab'
      }
    }
  }

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = false

    const canvas = canvasRef.current
    if (canvas) {
      const rect = canvas.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top
      const point = getPointAtPosition(mouseX, mouseY)
      canvas.style.cursor = point ? 'pointer' : 'grab'
    }

    if (!hasBeenDraggedRef.current) {
      // Click hit testing
      if (canvas) {
        const rect = canvas.getBoundingClientRect()
        const mouseX = e.clientX - rect.left
        const mouseY = e.clientY - rect.top

        const point = getPointAtPosition(mouseX, mouseY)
        if (point) {
          e.stopPropagation()
          if (searchText) {
            setSearchText('')
            setHovered(null)
          } else {
            setSearchText(point[3])
          }
        }
      }
    }
  }

  const handleMouseLeave = () => {
    isDraggingRef.current = false
    if (!searchText) {
      setHovered(null)
    }
    const canvas = canvasRef.current
    if (canvas) canvas.style.cursor = 'grab'
  }

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (
        (canvasRef.current && canvasRef.current.contains(target)) ||
        target.closest('.scatterplot-tooltip')
      ) {
        return
      }
      setSearchText('')
      setHovered(null)
    }
    window.addEventListener('click', handleClick)
    return () => {
      window.removeEventListener('click', handleClick)
    }
  }, [])

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

      <canvas
        ref={canvasRef}
        className="cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      />

      {hovered && (
        <div
          className={
            'fixed p-1 rounded max-w-48 text-md z-20 px-2 border border-odis-dark overflow-hidden scatterplot-tooltip ' +
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
                e.stopPropagation()
                e.preventDefault()
                setSimilarSearchText(searchText)
                setSearchText('')
                setHovered(null)
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
