import { useState, useEffect } from 'react'

const Typewriter = ({ sentence, delay = 100 }) => {
  const [words, setWords] = useState([])

  useEffect(() => {
    const timer = setTimeout(() => {
      const sentenceArray = sentence.split(' ')
      let currentIndex = 0

      const interval = setInterval(() => {
        if (currentIndex < sentenceArray.length) {
          setWords((prevWords) => [...prevWords, sentenceArray[currentIndex]])
          currentIndex++
        } else {
          clearInterval(interval)
        }
      }, delay)

      return () => {
        clearInterval(interval)
        setWords([]) // Reset words state when component is unmounted
      }
    }, 0) // Initial delay of 1 second before starting to type

    return () => clearTimeout(timer)
  }, [sentence, delay])

  return (
    <p>
      {words.map((word, index) => (
        <span key={index}>{word} </span>
      ))}
    </p>
  )
}

export default Typewriter
