import React from 'react';
import Slick  from 'react-slick';

var Slider = Slick.default;   // work around for import/export default glitch  jl 03/03/2018

class IfefSlideBox extends React.Component {
  render() {
    var settings = {
      className: 'ifef-slide-box',
      infinite: false,
      autoplay: false,
      arrows: false,
      dots: true,
      dotsClass: 'slick-dots slider-pager',
      initialSlide: 0
    };
    
    return (
        <Slider {...settings}>
          { this.props.children }
        </Slider>
    );
  }
}

export default IfefSlideBox;
