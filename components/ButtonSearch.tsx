'use client'

import React, { useState, useEffect } from 'react'
import { useChat } from 'ai/react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { DownloadIcon } from '@/components/ui/icons/download'

export function ButtonSearch(props) {
  const { initialQuestion, dataset, nameDataset, contentDataset, searchId, embedId } = props
  const [isButtonPressed, setButtonPressed] = useState(false)

  const { messages, input, handleInputChange, handleSubmit, isLoading, setInput } = useChat({
    api: `/api/button-search`,
    body: {
      nameDataset,
      contentDataset,
      initialQuestion,
    },
  })

  function extractAbstractAndUrl(inputString) {
    const abstractRegex = /Abstract:\s*([\s\S]*?)(?=\*\s*Keywords:|\n\n|\n\s*\*|\n$|$)/
    const urlRegex = /Url zum Datendownload \(json-Format\):\s*(.*?)(?=\n|$)/

    const abstractMatch = inputString.match(abstractRegex)
    const urlMatch = inputString.match(urlRegex)

    if (!abstractMatch) {
      return null // Abstract not found
    }

    const abstractText = abstractMatch[1].trim()
    const downloadUrl = urlMatch ? urlMatch[1].replace(/\\/g, '').trim() : null

    return { abstractText, downloadUrl }
  }

  const extractedInfo = extractAbstractAndUrl(contentDataset)

  // useEffect(() => {
  //   if (searchId === embedId) {
  //     console.log('searchIdsearchId', searchId, embedId)

  //     setInput(nameDataset)
  //     setButtonPressed(true)
  //   }
  // }, [searchId])

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {nameDataset && (
          <button
            onClick={() => {
              setInput(nameDataset)
              setButtonPressed(true)
            }}
            type="submit"
            className="text-white text-xs bg-odis-light rounded-md w-20 px-1 py-1 hover:bg-blue-700"
          >
            hier noch mal klicken
          </button>
        )}
        <input type="text" className="hidden" value={nameDataset} onChange={handleInputChange} />
      </form>

      <div>
        {isButtonPressed && (
          <div className="mt-2">
            {/* <div className="font-bold">{nameDataset}</div> */}
            <div>{extractedInfo.abstractText}</div>

            <a
              target="_blank"
              href={extractedInfo.downloadUrl}
              className="flex mt-2 space-x-1 items-center pointer-events-auto"
            >
              <DownloadIcon />
              <span> Daten-Download (im json-Format)</span>
            </a>
          </div>
        )}

        {messages &&
          messages.map((m) => (
            <div key={m.id} className="mt-2 text-odis-light">
              {m.role === 'user' ? (
                <div className="hidden">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{`${m.content}`}</ReactMarkdown>
                </div>
              ) : (
                <div>
                  <div className="font-bold">
                    Worum geht es in diesem Datensatz und wofür kann er verwendet werden?
                  </div>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{`${m.content}`}</ReactMarkdown>
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  )
}
