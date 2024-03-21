import React from 'react'

export function TypeFilter({ selectedValue, setSelectedValue }) {
  // Filter values
  const filterValues = ['WFS & WMS', 'WFS', 'WMS']

  return (
    <div className="flex pt-4 text-sm">
      <label htmlFor="filter" className="">
        Folgendes Format anzeigen:
      </label>
      <div className="flex">
        {filterValues.map((value, index) => (
          <div className="flex items-center pl-2 font-light" key={index}>
            <input
              type="radio"
              id={`option${index + 1}`}
              name="filter"
              value={value}
              onChange={() => setSelectedValue(value)}
              className=" focus:ring-active text-active ring-active focus:bg-active bg-active"
              defaultChecked={selectedValue === value}
            />
            <label className="pl-1" htmlFor={`option${index + 1}`}>
              {value}
            </label>
          </div>
        ))}
      </div>
    </div>
  )
}
