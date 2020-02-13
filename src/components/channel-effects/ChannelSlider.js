import Slider from '@material-ui/core/Slider';
import { withStyles } from '@material-ui/core/styles';
import { COLORS_CHANGE } from '../../events';
import React from 'react';

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  let max = Math.max(r, g, b);
  let min = Math.min(r, g, b);
  let d = max - min;
  let h;
  if (d === 0) h = 0;
  else if (max === r) h = (g - b) / d % 6;
  else if (max === g) h = (b - r) / d + 2;
  else if (max === b) h = (r - g) / d + 4;
  let l = (min + max) / 2;
  let s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  return [h * 60, s, l];
}

function hslToRgb(h, s, l) {
  let c = (1 - Math.abs(2 * l - 1)) * s;
  let hp = h / 60.0;
  let x = c * (1 - Math.abs((hp % 2) - 1));
  let rgb1;
  if (isNaN(h)) rgb1 = [0, 0, 0];
  else if (hp <= 1) rgb1 = [c, x, 0];
  else if (hp <= 2) rgb1 = [x, c, 0];
  else if (hp <= 3) rgb1 = [0, c, x];
  else if (hp <= 4) rgb1 = [0, x, c];
  else if (hp <= 5) rgb1 = [x, 0, c];
  else if (hp <= 6) rgb1 = [c, 0, x];
  let m = l - c * 0.5;
  return [
    Math.round(255 * (rgb1[0] + m)),
    Math.round(255 * (rgb1[1] + m)),
    Math.round(255 * (rgb1[2] + m))];
}

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
      const hsl = rgbToHsl(...colorData[this.channel])
      this.setState({
        slider: withStyles({
          root: {
            // align with how color-picker displays:
            // https://github.com/casesandberg/react-color/blob/master/src/components/hue/Hue.js#L25
            color: `rgb(${Object.values(hslToRgb(hsl[0],1,.5))})`
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
