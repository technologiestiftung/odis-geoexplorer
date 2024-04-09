'use client'

interface warningProps {
  text: string
}

export function WarningBox({ text }: warningProps) {
  // Return the JSX for your component
  return (
    <div className=" bg-active-light text-active-dark border-active-dark m-2 overflow-auto rounded-md border border-input p-4">
      {text}
    </div>
  )
}
