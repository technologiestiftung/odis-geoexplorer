import { CheckIcon } from '@/components/ui/icons/CheckIcon'
import { useState, useEffect } from 'react'

export function TypeFilter({ selectedValues, setSelectedValues, searchResults }) {
  // Filter values
  const filterValues = ['WFS', 'WMS']

  const [amountWFS, setAmountWFS] = useState(0)
  const [amountWMS, setAmountWMS] = useState(0)

  useEffect(() => {
    let wfsCount = 0
    let wmsCount = 0
    searchResults.forEach((d) => {
      if (d.parsedContent['Typ'] === 'WMS') {
        wmsCount++
      } else {
        wfsCount++
      }
    })
    setAmountWFS(wfsCount)
    setAmountWMS(wmsCount)
  }, [searchResults])

  return (
    <div className="flex pt-4 text-sm">
      <label htmlFor="filter" className="">
        Format:
      </label>
      <div className="flex">
        {filterValues.map((value, index) => (
          <button
            key={'filter-' + index}
            className="flex pl-2 items-center"
            onClick={() => {
              let newVals = JSON.parse(JSON.stringify(selectedValues))
              if (newVals.includes(value)) {
                newVals.splice(newVals.indexOf(value), 1)
              } else {
                newVals.push(value)
              }
              setSelectedValues(newVals)
            }}
          >
            <span className="pr-1">{value}</span>
            <span className="pr-1">({index === 0 ? amountWFS : amountWMS})</span>

            <CheckIcon active={selectedValues.includes(value)} />
          </button>
        ))}
      </div>
    </div>
  )
}
