'use client'

import { InfoIcon } from '@/components/ui/icons/info'
import { Tooltip } from 'react-tooltip'

import { useCopyToClipboard } from '@/lib/useCopyToClipboard'
const wfsText =
  'Ein WFS (Web Feature Service) ist ein Online-Dienst, der es ermöglicht, geografische Daten über das Internet abzurufen.'
const wmsText =
  'Ein WMS (Web Map Service) ist ein Online-Dienst, der es ermöglicht, geografische Daten über das Internet abzurufen.'

export function CopyInput({ url, type }) {
  const { copyToClipboard, hasCopied } = useCopyToClipboard()

  return (
    <div className="flex items-center  bg-white p-2 border border-odis-dark rounded">
      <label htmlFor="inputField" className="pr-2 whitespace-nowrap font-bold flex-shrink-0">
        {type}:
      </label>
      <input
        id="inputField"
        type="text"
        className="flex-grow text-ellipsis overflow-hidden  pr-2 focus:ring-odis-dark"
        value={url}
        readOnly
        placeholder="URL"
        title={url} // Displays full URL on hover
        style={{ minWidth: '0' }} // Ensure input shrinks correctly in flex container
      />
      <button
        onClick={() => copyToClipboard(url)}
        className="flex items-center justify-center flex-shrink-0"
        aria-label="Copy URL" // Accessibility improvement
      >
        {!hasCopied ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="mr-2 hover:text-active "
            viewBox="0 0 16 16"
          >
            <path
              fillRule="evenodd"
              d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="currentColor"
            className="mr-2 "
            viewBox="0 0 16 16"
          >
            <path
              className=""
              d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z"
            />
          </svg>
        )}
      </button>
      <span
        data-tooltip-id="url-tooltip"
        data-tooltip-content={type === 'WFS' ? wfsText : wmsText}
        className="flex items-center justify-center flex-shrink-0 hover:text-active "
      >
        <InfoIcon />
      </span>
      <Tooltip
        id="url-tooltip"
        style={{ width: '150px', backgroundColor: '#4c68c7', color: 'white', zIndex: 30 }}
      />
    </div>
  )
}
