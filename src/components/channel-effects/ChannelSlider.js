import Slider from '@material-ui/core/Slider';
import { withStyles } from '@material-ui/core/styles';
import { COLORS_CHANGE } from '../../events';
import React from 'react';

export default class ChannelSlider extends React.Component {

  constructor(props) {
    super(props);
    const { channel } = props
    this.channel = channel
    this.state = {
      sliderValue: [0,20000],
      slider: null,
      colorValue: []
    }
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

  componentWillMount() {
    this.colorsChangeToken = PubSub.subscribe(COLORS_CHANGE, this.onColorsChange.bind(this));
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.colorsChangeToken);
  }

  onColorsChange(msg, colorData) {
    if(Object.keys(colorData)[0] == this.channel){
      this.setState({
        slider: withStyles({
          root: {
            // align with how color-picker displays:
            // https://github.com/casesandberg/react-color/blob/master/src/components/hue/Hue.js#L25
            color: `rgb(${colorData[this.channel]})`
          }
        })(Slider),
        colorValue: colorData[this.channel]
      })
    }
  }

  render(){
    const { sliderValue, colorValue } = this.state
    if(colorValue.length > 0) {
      const ChannelSlider = this.state.slider
      return(
        <ChannelSlider
          value={sliderValue}
          onChange={this.handleSliderChange}
          valueLabelDisplay="auto"
          getAriaLabel={() => this.channel}
          min={0}
          max={65535}
          orientation="horizontal"
        />
      )
    }
    else{
      return null
    }
  }
}
