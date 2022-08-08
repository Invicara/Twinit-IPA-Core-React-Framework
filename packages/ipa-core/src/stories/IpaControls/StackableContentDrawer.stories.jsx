import React from 'react';
import PropTypes from 'prop-types';
import {StackableDrawer} from "../../IpaDialogs/StackableDrawer";
import StackableDrawerContainer from "../../IpaDialogs/StackableDrawerContainer";
import './StackableDrawer.stories.scss'
import {Typography} from "@material-ui/core";
import {Skeleton} from "@material-ui/lab";
import {StackableContentDrawer} from "../../IpaDialogs/StackableContentDrawer";

export default {
  title: 'Controls/StackableContentDrawer',
  component: StackableContentDrawer,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'fullscreen',
  },
};

const Template = (args) => {
  return <>
  <div>
      <Skeleton variant="circle" width={40} height={40} animation={false} />
      <Skeleton variant="rect" width={210} height={118} animation={false} />
      <Skeleton animation={false} />
  </div>
    {args.drawersLeft && args.drawersLeft.length>0 && generateDrawersInContainer(args,args.drawersLeft,"left", true)}

    {args.drawersRight && args.drawersRight.length>0 && generateDrawersInContainer(args,args.drawersRight,"right", true)}
  </>
  ;
};

export const Left = Template.bind({});
Left.args = {
  drawersLeft: [{
    iconKey: 'fa-search',
    minWidth: 200,
  },{
    iconKey: 'fa-filter',
    minWidth: 200,
  },{
    content: 1,
    childrenMinWidth: 300,
  }],
  //drawersRight: []
};


export const Right = Template.bind({});
Right.args = {
  //drawersLeft:[],
  drawersRight: [{
    content: 1,
    minWidth: '100%',
  },{
    iconKey: 'fa-search',
    minWidth: 200,
  },{
    iconKey: 'fa-filter',
    minWidth: 200,
  }]
};

export const Both = Template.bind({});
Both.args = {
  //drawersLeft:[],
  drawersRight: [{
    iconKey: 'fa-search',
    minWidth: 200,
  }],
  drawersLeft: [{
    iconKey: 'fa-filter',
    minWidth: 200,
  },{
      content: 1,
      minWidth: '100%',
  }]
};

export const Middle = Template.bind({});
Middle.args = {
  drawersLeft: [{
    iconKey: 'fa-filter',
    minWidth: 200,
  },{
    content: 1,
    minWidth: '100%',
  },{
    iconKey: 'fa-search',
    minWidth: 200,
    anchor: 'right',
    level: 1
  }]
};


const generateContentDrawer = (d) =>
    <StackableContentDrawer {...d}>
      {generateContent(d)}
    </StackableContentDrawer>;

const generateDrawersInContainer = (args, drawers, anchor, fullWidth) =>
    <StackableDrawerContainer anchor={anchor} fullWidth={fullWidth}>
      {drawers.map((d, index) => generateDrawer({...d, anchor: d.anchor || anchor},d.level || index+1,d.iconKey))}
    </StackableDrawerContainer>;

const generateDrawer = (d, level, iconKey) => {
  return d.content ? generateContentDrawer(d) : <StackableDrawer {...d} level={level} iconKey={iconKey} defaultOpen={true} isDrawerOpen={true} tooltip={"Hide elements by file"}>
    {generateContent(d)}
  </StackableDrawer>
}

const generateContent = (d) => {
  return <>
    <Typography variant="h4" >
      <span style={{padding: 10, color: 'white'}}>{d.content && `Content min ${d.minChildrenWidth}`} Lorem ipsum dolor sit amet, consectetur adipiscing elit.</span>
    </Typography>
    <Typography variant="h1">
      <Skeleton animation={false} />
    </Typography>
    <Typography variant="h2">
      <Skeleton animation={false}/>
    </Typography>
    <Typography variant="h3">
      <Skeleton animation={false}/>
    </Typography>
    <Typography variant="h4">
      <Skeleton animation={false}/>
    </Typography>
    <Typography variant="h5">
      <Skeleton animation={false}/>
    </Typography>
    <Typography variant="h6">
      <Skeleton animation={false}/>
      <Skeleton animation={false}/>
      <Skeleton animation={false}/>
      <Skeleton animation={false}/>
      <Skeleton animation={false}/>
      <Skeleton animation={false}/>
      <Skeleton animation={false}/>
      <Skeleton animation={false}/>
    </Typography>
  </>
}