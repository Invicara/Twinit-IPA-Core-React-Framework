import React, {useEffect} from 'react';

const EmptyComponent = (props) => {
  useEffect(()=>{
    props.isLoading && props.onLoadComplete && props.onLoadComplete();
  })
  console.log("EmptyComponent",props);
  return <React.Fragment></React.Fragment>;
};


export default EmptyComponent