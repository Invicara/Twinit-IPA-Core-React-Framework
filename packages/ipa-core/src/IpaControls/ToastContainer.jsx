import React, {useState} from "react"

import './ToastNotification.scss'

let toastCount = 0

export const useToast = () => {
  const [toasts, setToasts] = useState([])

  function addToast({toast, delay}) {
    const id = toastCount++
    const newToast = {toast, id}
    setToasts(prev => ([...prev, newToast]))

    const timer = setTimeout(() => {
      setToasts((toasts) => {
        return toasts.filter((toast) => toast.id !== id)
      })
    }, delay)
  }
  return [toasts, addToast]
}

const ToastContainer = ({children, toasts}) => {

  return ( 
      <div className="toast-notification">
        {toasts? toasts.map(({toast, id}) => <div key={id}>{toast}</div>
        ) : {children}}
       </div>
  )
}

export default ToastContainer;