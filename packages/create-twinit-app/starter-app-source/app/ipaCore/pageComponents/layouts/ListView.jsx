import React from "react"
import {IfefContent, IfefSubHeaderBar} from '@invicara/react-ifef';
import {mobiscroll} from '@invicara/invicara-lib';
import '@invicara/invicara-lib/dist/invicara-lib.css';
import ContainerView from "./ContainerView";

export default class ListView extends React.Component {
  render() {
    const {subtitle, listItem, data, itemTap} = this.props;
    return <ContainerView {...this.props}>
      <IfefSubHeaderBar {...this.props}><h2 className="title">{subtitle}</h2></IfefSubHeaderBar>
      <IfefContent customClasses="padding" {...this.props}>
        <div style={{height: 'calc(88vh - 60px)', overflow: 'auto'}}>
          <mobiscroll.Listview theme="ios" itemType={listItem} sortable={true}
                               onItemTap={itemTap}
                               data={data}/>
        </div>
      </IfefContent>
    </ContainerView>;
  }
}