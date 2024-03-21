'use client'

export function LanguageSwitcher({ setLanguage, language }) {
  // Return the JSX for your component

  const languages = ['de', 'en', 'fr']
  return (
    <div className="fixed right-2 top-0">
      {languages.map((lang) => (
        <button
          key={lang}
          className="p-2 opacity-60 hover:opacity-100"
          onClick={() => {
            setLanguage(lang)
          }}
        >
          {lang}
        </button>
      ))}
    </div>
  )
}
