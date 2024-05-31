'use client'

import React, { useState, useEffect } from 'react'
import { type Sketch } from '@p5-wrapper/react'
import { NextReactP5Wrapper } from '@p5-wrapper/next'
let setupFailed = false

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

    try {
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
    } catch (error) {
      console.error('error network animation: ', error)
      setupFailed = true
    } finally {
    }
  }

  p5.draw = () => {
    if (setupFailed) return
    p5.background(255)
    // p5.ambientLight(100) // Adds soft white light to the scene
    // p5.pointLight(255, 255, 255, p5.width / 2, p5.height / 2, 255) // Bright white light from the center of the canvas
    // p5.directionalLight(255, 255, 255, 1, 1, -20) // White light from a specific direction    // Continuous rotation for animation
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
      p5.fill('#4c68c7')

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

    p5.fill('#1d2c5d')

    // points.forEach((point, index) => {
    //   p5.push()

    //   // const depthFactor = p5.map(point.z, -100, 100, 255, 50); // Assuming z ranges from -100 to 100
    //   // p5.fill(53, 80, 171, depthFactor);  // Use RGBA for fill to set opacity based on depth

    //   p5.fill(41, 62, 132)
    //   p5.translate(point.x, point.y, point.z)
    //   // Apply inverse rotation to only affect the labels
    //   p5.rotateY(-p5.frameCount * rotationSpeed)
    //   p5.text(labels[index + 1], 0, -20) // Adjusted position to avoid overlap with the spheres
    //   p5.pop()
    // })
    // let labelDetails = [] // New array to store label details including bounding box
    points.forEach((point, index) => {
      p5.push()
      p5.translate(point.x, point.y, point.z)
      p5.rotateY(-p5.frameCount * rotationSpeed) // Counter the rotation to render the label correctly

      let label = labels[index + 1]
      // let labelWidth = p5.textWidth(label)
      // let labelHeight = 20 // Approximate height based on text size

      // labelDetails[index] = {
      //   x: point.x - labelWidth / 2,
      //   y: point.y - labelHeight / 2,
      //   width: labelWidth,
      //   height: labelHeight,
      //   text: label,
      // }

      p5.text(label, 0, -20)
      p5.pop()
    })

    // p5.mouseClicked = () => {
    //   let mouseXAdjusted = p5.mouseX - p5.width / 2 // Adjust for WEBGL mode
    //   let mouseYAdjusted = p5.mouseY - p5.height / 2

    //   labelDetails.forEach((label) => {
    //     if (
    //       mouseXAdjusted > label.x &&
    //       mouseXAdjusted < label.x + label.width &&
    //       mouseYAdjusted > label.y &&
    //       mouseYAdjusted < label.y + label.height
    //     ) {
    //       console.log('Clicked on label:', label.text)
    //       // Perform any action here, such as opening a link or updating the state
    //     }
    //   })
    // }
    // let overAnyLabel = false
    // labelDetails.forEach((label) => {
    //   let mouseXAdjusted = p5.mouseX - p5.width / 2 // Adjust for WEBGL mode
    //   let mouseYAdjusted = p5.mouseY - p5.height / 2
    //   if (
    //     mouseXAdjusted > label.x &&
    //     mouseXAdjusted < label.x + label.width &&
    //     mouseYAdjusted > label.y &&
    //     mouseYAdjusted < label.y + label.height
    //   ) {
    //     overAnyLabel = true
    //   }
    // })

    // if (overAnyLabel) {
    //   p5.cursor(p5.HAND)
    // } else {
    //   p5.cursor(p5.ARROW)
    // }
    // points.forEach((point, index) => {
    //   p5.push();
    //   // Adjust fill based on z-coordinate to create depth effect
    //   const depthFactor = p5.map(point.z, -100, 100, 255, 50); // Assuming z ranges from -100 to 100
    //   p5.fill(53, 80, 171, depthFactor);  // Use RGBA for fill to set opacity based on depth

    //   p5.translate(point.x, point.y, point.z);
    //   p5.sphere(6);
    //   p5.pop();
    // });

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
      'Grundwasser',
      'Naturwald',
      'ATKIS Fießgewässer',
      'Überschwemmung',
      'Wassserschutzgebiet',
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
