import React, { useState, useEffect } from 'react'
import { type Sketch } from '@p5-wrapper/react'
import { NextReactP5Wrapper } from '@p5-wrapper/next'

const sketch: Sketch = (p5) => {
  let labels = [] // Labels for each point
  let width = 0
  let height = 0
  let rotationSpeed = 0.001

  p5.updateWithProps = (props) => {
    if (props.width) {
      width = props.width
    }
    if (props.height) {
      height = props.height
    }
    if (props.labels) {
      labels = props.labels
    }
  }

  let numPoints = 6 // Number of surrounding points
  // let baseRadius = width // Base radius for positioning points
  let points = []
  let myFont // Variable to hold the font

  p5.preload = () => {
    // Load a font; ensure the path is correct in your Next.js public directory
    myFont = p5.loadFont('/IBMPlexMono-Bold.ttf') // Adjust the path as necessary
  }

  p5.setup = () => {
    let baseRadius = height / 2.5 // Base radius for positioning points

    // use 0.75 to take up 3/3 of the available space vertically
    p5.createCanvas(width * 0.75, height, p5.WEBGL)
    p5.background(255)
    p5.textFont(myFont, 10)
    p5.textAlign(p5.CENTER, p5.CENTER) // Center the text around its coordinates
    const loadingElem = document.getElementById('p5_loading')
    if (loadingElem) {
      loadingElem.remove()
    }
    if (width <= 700) {
      // Initialize positions and variations for each point once
      for (let i = 0; i < numPoints; i++) {
        let angle = (p5.TWO_PI / numPoints) * i
        let variation = p5.random(-20, 20) // Random variation in distance
        let radius = baseRadius + variation
        let x = p5.cos(angle) * radius
        let y = p5.sin(angle) * (radius / 1.2)
        let z = p5.random(-100, 100) // Random depth for 3D effect
        points.push({ x: x, y: y, z: z })
      }
    } else {
      for (let i = 0; i < numPoints; i++) {
        let angle = (p5.TWO_PI / numPoints) * i
        // Adjust the radius based on the angle to stretch points horizontally
        let radiusModifier = p5.map(p5.abs(p5.cos(angle)), 0, 1, 0, 1.5) // Scale factor between 0.5 and 1.5 based on the horizontal position
        let radius = baseRadius * radiusModifier + p5.random(-20, 20) // Add some random variation to the radius
        let x = p5.cos(angle) * radius
        let y = p5.sin(angle) * radius
        let z = p5.random(-50, 50) // Add depth variation for a more dynamic 3D effect
        points.push({ x: x, y: y, z: z })
      }
    }

    // points = [
    //   {
    //     x: 101.33514477126838,
    //     y: 0,
    //     z: 19.39527128486219,
    //   },
    //   {
    //     x: 42.3654422033289,
    //     y: 61.14924865107366,
    //     z: -99.07480688220933,
    //   },
    //   {
    //     x: -55.432750045128,
    //     y: 80.01028290118977,
    //     z: -69.0736118818246,
    //   },
    //   {
    //     x: -83.02477135785897,
    //     y: 8.473001707778569e-15,
    //     z: -50.45505502797093,
    //   },
    //   {
    //     x: -40.55817936605731,
    //     y: -58.540689437085724,
    //     z: 128.80440034678645,
    //   },
    //   {
    //     x: 48.18035320241611,
    //     y: -69.5423497276656,
    //     z: 62.31159242738869,
    //   },
    // ]
  }

  p5.draw = () => {
    p5.background(255)

    // Continuous rotation for animation
    p5.rotateY(p5.frameCount * rotationSpeed)

    // Draw the central point
    p5.fill(179, 242, 224)
    p5.noStroke()
    p5.sphere(25) // Smaller sphere for the central point

    // Draw each point and connect with a line
    points.forEach((point, index) => {
      // Draw the blue point
      p5.push()
      // p5.stroke(0, 0, 0)
      p5.fill(53, 80, 171)

      p5.translate(point.x, point.y, point.z)
      p5.sphere(6)
      p5.pop()
    })

    points.forEach((point, index) => {
      p5.push()
      p5.stroke(179, 242, 224)
      p5.translate(0, 0, 0) // Start at the center
      p5.line(0, 0, 0, point.x, point.y, point.z)
      p5.pop()
    })

    p5.fill(0, 0, 0)

    points.forEach((point, index) => {
      p5.push()
      p5.fill(41, 62, 132)

      p5.translate(point.x, point.y, point.z)
      // Apply inverse rotation to only affect the labels
      p5.rotateY(-p5.frameCount * rotationSpeed)
      p5.text(labels[index + 1], 0, -20) // Adjusted position to avoid overlap with the spheres
      p5.pop()
    })

    p5.push() // Isolate transformations for the text
    p5.rotateY(-p5.frameCount * rotationSpeed) // Counter the rotation applied to the scene
    p5.fill(0) // Set text color
    p5.translate(0, -2, 50) // Move text slightly above and in front of the sphere
    p5.text(labels[0], 0, 0) // Adjusted position to avoid overlap with the sphere
    p5.pop() // Revert transformations after drawing the text
  }
}

export default function Page({ width, height }) {
  let allLabels = [
    [
      'Schwamm Stadt',
      'Wassserschutzgebiet',
      'Grundwasser',
      'Naturwald',
      'ATKIS Fießgewässer',
      'Überschwemmung',
      'Schulen',
    ],
    [
      'Licht',
      'Lichtsignale',
      'ATKIS Leitung',
      'Fluchtlinien',
      'Liegenschaften',
      'Beleuchtung',
      'Signalanlagen',
    ],
    [
      'Freizeit',
      'Jugendfreizeit',
      'Hundefreilauf',
      'Naturwald',
      'Freiflächen',
      'Grünbestand',
      'FSC Zertifizierung',
    ],
  ]
  const [labels, setLabels] = useState(allLabels[0])
  const [key, setKey] = useState(0) // Initialize a key state

  let currentIndex = 0

  useEffect(() => {
    let values = [1, 2, 3]

    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % values.length
      setLabels(allLabels[currentIndex])
    }, 6000)

    return () => {
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    setKey(key + 1)
  }, [width])

  return (
    <NextReactP5Wrapper key={key} sketch={sketch} width={width} height={height} labels={labels} />
  )
}
