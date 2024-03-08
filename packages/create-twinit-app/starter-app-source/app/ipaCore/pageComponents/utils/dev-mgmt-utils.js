export const copyToClipboard = (json, what) => {
   navigator.clipboard.writeText(json)
   alert(`${what} copied to clipboard`)
 }