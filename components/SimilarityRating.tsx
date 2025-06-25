'use client'

import { CheckIcon } from '@/components/ui/icons/check'

export function SimilarityRating({ similarity }) {
  let activeIcons = 0

  if (similarity < 0.6) {
    activeIcons = 1
  } else if (similarity >= 0.6 && similarity < 0.64) {
    activeIcons = 2
  } else if (similarity >= 0.64) {
    activeIcons = 3
  }

  return (
    <div className="flex">
      {[...Array(3)].map((_, index) => (
        <span key={'sim' + index} className={index < activeIcons ? '' : 'opacity-20'}>
          <CheckIcon key={index} />
        </span>
      ))}
    </div>
  )

  // if (similarity < 0.8) {
  //   return (
  //     <svg
  //       width="140"
  //       height="22"
  //       viewBox="0 0 140 22"
  //       fill="none"
  //       xmlns="http://www.w3.org/2000/svg"
  //     >
  //       <circle cx="11" cy="11" r="6" fill="#4C68C7" />
  //       <circle cx="37" cy="11" r="6" fill="#4C68C7" />
  //       <path d="M12 11H42" stroke="#4C68C7" />
  //     </svg>
  //   )
  // } else if (similarity >= 0.8 && similarity < 0.84) {
  //   return (
  //     <svg
  //       width="140"
  //       height="22"
  //       viewBox="0 0 140 22"
  //       fill="none"
  //       xmlns="http://www.w3.org/2000/svg"
  //     >
  //       <circle cx="11" cy="11" r="6" fill="#4C68C7" />
  //       <circle cx="66" cy="11" r="6" fill="#4C68C7" />
  //       <path d="M12 11H72" stroke="#4C68C7" />
  //     </svg>
  //   )
  // } else if (similarity >= 0.84) {
  //   return (
  //     <svg
  //       width="140"
  //       height="22"
  //       viewBox="0 0 140 22"
  //       fill="none"
  //       xmlns="http://www.w3.org/2000/svg"
  //     >
  //       <circle cx="11" cy="11" r="6" fill="#4C68C7" />
  //       <path d="M10 11H124" stroke="#4C68C7" />
  //       <circle cx="125" cy="11" r="6" fill="#4C68C7" />
  //     </svg>
  //   )
  // }

  //   const circleRadius = 10 // Radius of each circle
  //   const svgWidth = similarity * 100 + 2 * circleRadius // Width of the SVG element
  //   const svgHeight = 4 * circleRadius // Height of the SVG element
  //   let distance = 0
  //   if (similarity < 0.8) {
  //     distance = 40
  //   } else if (similarity >= 0.8 && similarity < 0.84) {
  //     distance = 30
  //   } else if (similarity >= 0.84) {
  //     distance = 20
  //   }

  //   // Positions of the circles
  //   const x1 = circleRadius // X position of first circle
  //   const y1 = circleRadius // Y position of both circles (centered vertically)
  //   const x2 = x1 + distance // X position of second circle based on distance

  //   return (
  //     <svg width={svgWidth} height={svgHeight}>
  //       {/* Line connecting the centers of two circles */}
  //       <line x1={x1} y1={y1} x2={x2} y2={y1} stroke="#4C68C7" strokeWidth="4" />
  //       {/* First Circle */}
  //       <circle cx={x1} cy={y1} r={circleRadius} stroke="" fill="#4C68C7" />
  //       {/* Second Circle */}
  //       <circle cx={x2} cy={y1} r={circleRadius} stroke="" fill="#4C68C7" />
  //     </svg>
  //   )
  // }

  // return (
  //   <span className="font-bold text-odis-light">
  //     {similarity < 0.8 ? 'niedrig' : similarity >= 0.8 && similarity < 0.84 ? 'mittel' : 'hoch'}
  //   </span>
  // )
}
