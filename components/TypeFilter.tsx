import { CheckIcon } from '@/components/ui/icons/CheckIcon'

export function TypeFilter({ selectedValues, setSelectedValues }) {
  // Filter values
  const filterValues = ['WFS', 'WMS']

  return (
    <div className="flex pt-4 text-sm">
      <label htmlFor="filter" className="">
        Format:
      </label>
      <div className="flex">
        {filterValues.map((value, index) => (
          <button
            key={'filter-' + index}
            className="flex pl-2"
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
            <span className="pr-2">{value}</span>
            <CheckIcon active={selectedValues.includes(value)} />
          </button>
        ))}
      </div>
    </div>
  )
}
