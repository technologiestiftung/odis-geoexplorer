'use client'

import React, { useState, useEffect } from 'react'
import { DownloadIcon } from '@/components/ui/icons/download'
import { useCopyToClipboard } from '@/lib/useCopyToClipboard'
import Typewriter from './Typewriter'
import { LoaderIcon } from '@/components/ui/icons/loader'
import { AiText } from '@/components/AiText'
import { AttributeTable } from '@/components/AttributeTable'

export function DatasetInfoExtended({ contentDataset, inputText }) {
  const { copyToClipboard, hasCopied } = useCopyToClipboard()

  console.log('contentDataset', contentDataset)

  const buttonClass = 'w-max flex bg-odis-light !text-white p-2 mr-2 rounded-md hover:bg-active '

  return (
    <div>
      <div className="px-4 mb-4 italic font-light">{contentDataset['Anmerkung']}</div>
      <div className="px-4 flex">
        {contentDataset['Typ'] === 'WFS' && (
          <>
            <a
              target="_blank"
              href={`${
                contentDataset['Service URL']
              }?service=WFS&version=1.1.0&request=GetFeature&typeName=senstadt:${
                contentDataset['Service URL'].split('/')[
                  contentDataset['Service URL'].split('/').length - 1
                ]
              }&outputFormat=application/json`}
              className={buttonClass}
            >
              <DownloadIcon />
              <span className="pl-2">JSON Download</span>
            </a>

            <a
              target="_blank"
              href={'https://wfs-analyser.netlify.app/?wfs=' + contentDataset['Service URL']}
              className={buttonClass}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
                className="mr-2 overflow-visible"
              >
                <path
                  fillRule="evenodd"
                  d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5"
                />
                <path
                  fillRule="evenodd"
                  d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0z"
                />
              </svg>
              WFS analysieren
            </a>
          </>
        )}
        <button
          onClick={() =>
            copyToClipboard(
              `${contentDataset['Service URL'].replace('&outputFormat=application/json', '')}`
            )
          }
          className={buttonClass}
        >
          <div className="flex">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="mr-2 overflow-visible"
              viewBox="0 0 16 16"
            >
              <path
                fillRule="evenodd"
                d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z"
              />
            </svg>
            {!hasCopied ? contentDataset['Typ'] + ' kopieren' : 'kopiert!'}
          </div>
        </button>
      </div>

      {contentDataset['Fisbroker URL'] && (
        <div className="px-4 mt-4 font-light">
          Du findest diesen Datensatz auch im{' '}
          <a className="!text-odis-light" target="_blank" href={contentDataset['Fisbroker URL']}>
            Fis Broker
          </a>
          . Hier erhälst du Detailinformationen wie letzte Aktualisierungen, Granularität, etc.
        </div>
      )}
      {contentDataset['Attribute'] && <AttributeTable contentDataset={contentDataset} />}

      <AiText content={contentDataset.rawContent} inputText={inputText} />
    </div>
  )
}
