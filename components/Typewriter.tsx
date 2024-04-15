import { useState, useEffect } from 'react'

const Typewriter = ({ sentence, delay = 100 }) => {
  const [words, setWords] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const sentenceArray = sentence.split(' ')

    const interval = setInterval(() => {
      if (currentIndex < sentenceArray.length) {
        setWords((prevWords) => [...prevWords, sentenceArray[currentIndex]])
        setCurrentIndex(currentIndex + 1)
      } else {
        clearInterval(interval)
      }
    }, delay)

    // Cleanup function to clear interval when component unmounts or updates
    return () => {
      clearInterval(interval)
    }
  }, [sentence, delay, currentIndex])

  return (
    <p>
      {words.map((word, index) => (
        <span key={index}>{word} </span>
      ))}
    </p>
  )
}

export default Typewriter
