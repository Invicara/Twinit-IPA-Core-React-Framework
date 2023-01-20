import React from "react"
import { Cancel, CheckCircleRounded} from "@material-ui/icons";

export const Toast = ({children, className}) => {
    return <div className={`toast-notification ${className}`}>{children}</div>  
}
  
export const SuccessToast = ({message}) => {
    return <Toast className={'success-toast'}><CheckCircleRounded className="icon"/>{message}</Toast> 
}

export const ErrorToast = ({message}) => {
    return <Toast className={'error-toast'}><Cancel className="icon"/>{message}</Toast>
}
