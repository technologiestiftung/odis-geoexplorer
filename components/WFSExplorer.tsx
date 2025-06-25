'use client'

import { LinkOutIcon } from '@/components/ui/icons/LinkOutIcon'

const buttonClass =
  'text-center  md:w-48  flex bg-odis-light !text-white p-2 mr-2 rounded-md hover:bg-active hover:!text-odis-dark items-center'

export function WFSExplorer({ url, layer }) {
  const link = `https://wfsexplorer.netlify.app/?wfs=${url}${layer ? '&layer=' + layer : ''}`
  return (
    <a className={buttonClass} target="_blank" href={link}>
      <LinkOutIcon />
      <span className="pl-2">Daten Explorieren</span>
    </a>
  )
}
