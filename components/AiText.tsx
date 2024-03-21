'use client'
// import { text } from '@/lib/text'
import React, { useState, useEffect } from 'react'
import { DownloadIcon } from '@/components/ui/icons/download'
import { useCopyToClipboard } from '@/lib/useCopyToClipboard'
import Typewriter from './Typewriter'
import { LoaderIcon } from '@/components/ui/icons/loader'

export function AiText({ content, inputText }) {
  console.log('inputText', inputText)

  const [showExplanation, setShowExplanation] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [message, setMessage] = useState<string>('')

  async function getExtraInfo(initialQuestion, contentDataset) {
    // if (message) {
    //   setMessage('')
    //   return
    // }
    if (message) {
      // setShowExtraInfo(!showExtraInfo)
      return
    }
    let data
    setIsLoading(true)
    try {
      let res

      res = await fetch(`/api/get-dataset-info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentDataset: contentDataset,
          initialQuestion: initialQuestion,
          promptType: 'info',
        }),
        cache: process.env.NODE_ENV === 'development' ? 'no-store' : 'default',
      })

      if (res.ok) {
        data = await res.json()
      }
    } catch (error) {
      setIsLoading(false)
      console.error('error loading extended info:', error)
    } finally {
      setIsLoading(false)
      setMessage(data.result.message.content)
      // setShowExtraInfo(true)
      console.log(' data.result.message.content', data.result.message.content)

      return data
    }
  }

  return (
    <div className="px-4 pt-4 pb-4">
      <p className="font-md font-bold"> Warum wird dieser Datensatz angezeigt?</p>
      <button
        disabled={isLoading || message !== ''}
        onClick={() => getExtraInfo(inputText, content)}
        className="text-odis-light pb-2 hover:text-active flex items-center"
      >
        K.I.-generierte Antwort anzeigen
        {isLoading && (
          <span className="pl-2 w-6">
            <LoaderIcon />
          </span>
        )}
      </button>

      {message && (
        <div className="font-light bg-odis-extra-light p-4 font-robot">
          {message && <Typewriter sentence={message} />}
        </div>
      )}
    </div>
  )
}
