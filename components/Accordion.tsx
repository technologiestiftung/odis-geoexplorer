import { ChevronDown } from '@/components/ui/icons/ChevronDown'
import React, { FC, useState, useEffect } from 'react'

interface AccordionPropType {
  title: string
  titleClasses?: string
  content: React.JSX.Element
  active?: boolean
}

export const Accordion: FC<AccordionPropType> = ({ title, titleClasses = '', content, active }) => {
  const [isActive, setIsActive] = useState<boolean>(active || false)

  useEffect(() => {
    setIsActive(active || false)
  }, [active])

  return (
    <div className="text-odis-dark mt-[24px] border-b border-dashed border-light-grey pb-[4px] overflow-x-hidden">
      <button
        className={`flex w-full justify-between`}
        onClick={() => {
          setIsActive(!isActive)
        }}
        tabIndex={isActive ? 1 : 0}
      >
        <h2 className={`${titleClasses} text-left  font-bold`}>{title}</h2>
        <span
          className={`transform transition-transform
						 ${isActive ? 'rotate-180' : 'rotate-0'}
					`}
        >
          {' '}
          <ChevronDown />
        </span>
      </button>
      {isActive && <div className="w-full pb-[10px] pt-[16px] ">{content}</div>}
    </div>
  )
}
