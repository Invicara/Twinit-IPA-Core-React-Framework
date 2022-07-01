import React from 'react';
import PropTypes from 'prop-types';
import {StackableDrawer} from "../../IpaDialogs/StackableDrawer";
import StackableDrawerContainer from "../../IpaDialogs/StackableDrawerContainer";
import './StackableDrawer.stories.scss'
import {Typography} from "@material-ui/core";
import {Skeleton} from "@material-ui/lab";

export default {
  title: 'Controls/StackableDrawer',
  component: StackableDrawer,
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
    <StackableDrawerContainer anchor="left">
    {args.drawersLeft && args.drawersLeft.length>0 && generateDrawers(args,args.drawersLeft,"left")}
    </StackableDrawerContainer>
    <StackableDrawerContainer anchor="right">
    {args.drawersRight && args.drawersRight.length>0 && generateDrawers(args,args.drawersRight,"right")}
    </StackableDrawerContainer>
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
  }],
  //drawersRight: []
};


export const Right = Template.bind({});
Right.args = {
  //drawersLeft:[],
  drawersRight: [{
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
  }]
};

const generateDrawers = (args, drawers, anchor) =>
    drawers.map((d, index) => generateDrawer({...d, anchor: anchor},index+1,d.iconKey));

const generateDrawer = (args, level, iconKey) => {
  return     <StackableDrawer {...args} level={level} iconKey={iconKey} defaultOpen={true} isDrawerOpen={true} tooltip={"Hide elements by file"}>
    <Typography variant="h4" >
      <span style={{padding: 10, color: 'white'}}>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</span>
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
  </StackableDrawer>
}