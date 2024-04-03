import React, {useState, useEffect, useRef} from "react"
import './SimpleTextThrobber.scss'

const SimpleTextThrobber = ({throbberText}) => {

  const [dots, setDots] = useState('.')
  const [timer, setTimer] = useState(null)
  const timerRef = useRef()
  
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])
  
  useEffect(() => {
    timerRef.current = timer
  }, [timer])
  
  useEffect(() => {
    
    let time = setTimeout(() => {
      if (dots.length === 5)
        setDots('.')
      else {
        let newDots = dots + "."
        setDots(newDots)
      }
    }, 800)
    setTimer(time)
    
  }, [dots]) 
  
  return <div className="simple-text-throbber">
    {throbberText} {dots}
  </div>

}

export default SimpleTextThrobber