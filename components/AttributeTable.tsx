'use client'
// import { text } from '@/lib/text'
import React, { useState, useEffect } from 'react'
import { LoaderIcon } from '@/components/ui/icons/loader'
import { CodeIcon } from '@/components/ui/icons/CodeIcon'

export function AttributeTable({ contentDataset }) {
  const [attr, setAttr] = useState(contentDataset['Attribute'])
  const [attrDesc, setAttrDesc] = useState(contentDataset['Attribute Beschreibung'])
  const [hasFullDescription, setHasFullDescription] = useState(false)
  const [aiGeneratedDescriptions, setAiGeneratedDescriptions] = useState(false)

  const [isLoading, setIsLoading] = useState<boolean>(false)

  async function generateDescriptions(contentDataset) {
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
          contentDataset: JSON.stringify({ contentDataset }),
          promptType: 'attrDescription',
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

      console.log('datadatadatadata', data)

      data = JSON.parse(data.result.message.content)

      console.log('datadata', data)

      if (data) {
        // const descriptionArray = data.attribute.map((key) => aiGeneratedDescriptions[key] || '')

        setAiGeneratedDescriptions(data)
      }
    }
  }

  useEffect(() => {
    if (!attr || !attrDesc) return
    const attrWithoutGeom = attr.filter((d) => d !== 'geom')
    console.log(attrWithoutGeom.length, attrDesc.length)

    if (attrWithoutGeom.length === attrDesc.length) {
      setHasFullDescription(true)
    }
  }, [attrDesc])

  //   useEffect(() => {
  //     console.log('aiGeneratedDescriptions', aiGeneratedDescriptions)
  //     if (aiGeneratedDescriptions['geom']) {
  //       delete aiGeneratedDescriptions['geom']
  //     }

  //     const descriptionArray = attr.map((key) => aiGeneratedDescriptions[key] || '')

  //     console.log('descriptionArray  ', descriptionArray)
  //     setAttrDesc(descriptionArray)
  //   }, [aiGeneratedDescriptions])

  //   useEffect(() => {
  //     console.log('aiGeneratedDescriptions', aiGeneratedDescriptions)
  //   }, [aiGeneratedDescriptions])

  aiGeneratedDescriptions

  return (
    <table className="my-2 mt-4 w-full border-b-[1px] border-gray-300">
      <tbody>
        <tr className="border-b-[1px] text-md font-normal text-left">
          <th className="p-2 pl-4">Datenattribut</th>
          <th className="p-2 pl-4 flex items-center">
            Beschreibung
            {/* {!hasFullDescription ? (
              <>
                <button
                  onClick={() => generateDescriptions(contentDataset['rawContent'])}
                  className={`flex ml-2 p-1 bg-odis-light text-white rounded-md font-light hover:bg-active ${
                    aiGeneratedDescriptions ? ' opacity-40' : ''
                  }`}
                  disabled={aiGeneratedDescriptions}
                >
                  {aiGeneratedDescriptions ? (
                    <span onClick={() => generateDescriptions(contentDataset['rawContent'])}>
                      Antwort mit K.I. generieren
                    </span>
                  ) : (
                    ''
                  )}

                  {isLoading && <LoaderIcon />}
                </button>
              </>
            ) : (
              ''
            )} */}
            {!hasFullDescription && !aiGeneratedDescriptions && (
              <button
                className="font-normal pl-2 text-odis-light  hover:text-odis-dark flex items-center"
                onClick={() => generateDescriptions(contentDataset)}
              >
                <CodeIcon /> <span className="pl-1"></span>
                mit K.I. generieren
                {isLoading && (
                  <span className="scale-50">
                    <LoaderIcon />
                  </span>
                )}
              </button>
            )}
          </th>
        </tr>

        {attr?.map((attr, index) => (
          <tr key={attr} className={index % 2 === 1 ? 'bg-odis-light-2 w-full' : 'w-full'}>
            <td className="p-2 pl-4 font-light">{attr}</td>
            {hasFullDescription ? (
              <td className="p-2 pl-4 font-light">{attrDesc[index]}</td>
            ) : aiGeneratedDescriptions ? (
              <td className="pl-4 font-light font-robot-light">
                {aiGeneratedDescriptions[attr] ? aiGeneratedDescriptions[attr] : ''}
              </td>
            ) : (
              <td></td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
