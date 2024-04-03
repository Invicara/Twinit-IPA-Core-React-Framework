import React from "react";
import IfefIcon from '../react-ifef/components/ifefIcon';

export const PopoverMenuView = ({actions}) => <div className="content">
  <ul className="asf-popover-menu">
    {actions.map((item, index) =>
      <li className="item-icon-right"
          key={index}
          onClick={item.onClick}
          {...item}>
        <a>
          {item.title}
        </a>
        <IfefIcon icon="ios-arrow-right"/>
      </li>
    )}
  </ul>
</div>;