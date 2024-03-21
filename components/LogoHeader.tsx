'use client'

// Import necessary modules from React and Next.js
import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'

export function LogoHeader() {
  return (
    <div className="logo">
      <div>
        <div className="cursor-pointer">
          <Link href="https://odis-berlin.de/" target="_blank">
            <Image src={'/logo-odis.svg'} width="200" height="100" alt="Odis logo" />
          </Link>
        </div>
      </div>
    </div>
  )
}
