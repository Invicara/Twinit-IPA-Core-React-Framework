import React from "react";

import './MiniButton.scss'

const MiniButton = ({className, onClick, value}) =>
  <div className={(className||"") + " mini-button"}
    onClick={(e)=>{e.stopPropagation();onClick()}}>{value}
  </div>

export default MiniButton;

export const MiniIconButton = ({className, icon, onClick}) =>
<div className={(className||"") + " mini-icon-button"}
  onClick={(e)=>{e.stopPropagation();onClick()}}>
    <i className={icon} />
</div>
