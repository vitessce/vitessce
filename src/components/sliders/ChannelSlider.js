import Slider from '@material-ui/core/Slider';
import { withStyles } from '@material-ui/core/styles';
import React from 'react';

export default class ChannelSlider extends React.Component {

  constructor(props) {
    super(props);
    const { channel } = props
    this.channel = channel
    this.slider = withStyles({
        root: {
          color: `rgb(${[Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256) ]})`
        }
    })(Slider)
    this.state = {sliderValue:[0,20000]}
    const slidersObj = {}
    slidersObj[channel] = [0,20000]
    this.props.setSliderValue(slidersObj);
    this.handleSliderChange = this.handleSliderChange.bind(this);
  }

  handleSliderChange(event, value) {
    var channelValue = {};
    channelValue[this.channel] = value;
    this.setState({sliderValue: value });
    this.props.setSliderValue(channelValue);
  }

  render(){
    const { sliderValue } = this.state
    const ChannelSlider = this.slider
    return(
      <React.Fragment>
        <p>{this.channel}</p>
        <ChannelSlider
          value={sliderValue}
          onChange={this.handleSliderChange}
          valueLabelDisplay="auto"
          getAriaLabel={() => this.channel}
          min={0}
          max={65535}
          orientation="horizontal"
        />
      </React.Fragment>
    )
  }
}
