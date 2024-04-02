'use client'

import React, { useState, useEffect } from 'react'
import { DownloadIcon } from '@/components/ui/icons/download'
import { useCopyToClipboard } from '@/lib/useCopyToClipboard'
import Typewriter from './Typewriter'
import { LoaderIcon } from '@/components/ui/icons/loader'
import { AiText } from '@/components/AiText'
import { AttributeTable } from '@/components/AttributeTable'
import { SearchIcon } from '@/components/ui/icons/search'

export function DatasetInfoExtended({ contentDataset, inputText, setSimilarSearchText }) {
  const { copyToClipboard, hasCopied } = useCopyToClipboard()

  console.log('contentDataset', contentDataset)

  const buttonClass =
    'align-center w-max flex bg-odis-light !text-white p-2 mr-2 rounded-md hover:bg-active hover:!text-odis-dark'

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
              }?service=WFS&version=1.1.0&request=GetFeature&typeName=${contentDataset[
                'Layer Name'
              ].replace('Type', '')}&outputFormat=application/json&CRS=CRS:84`}
              className={buttonClass}
            >
              <DownloadIcon />
              <span className="pl-2">JSON Download</span>
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
        <button
          onClick={() => setSimilarSearchText(contentDataset['Titel'])}
          className={buttonClass}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="mr-2"
            viewBox="0 0 16 16"
          >
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
          </svg>
          ähnlichen Daten
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
