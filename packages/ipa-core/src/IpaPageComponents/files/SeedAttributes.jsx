import React, {useState} from "react";

export const SeedAttributes = ({onClick, display}) => {
    const [clicked, setClicked] = useState(false)

    const handleClick = async(e) => {
      e.preventDefault()
      await onClick()
      setClicked(true)
    }

    return <div>
      <a href="#" onClick={handleClick}>
        {clicked && <i className="fas fa-check"></i>}
        Select Files List with Attributes
      </a>
    </div>
}