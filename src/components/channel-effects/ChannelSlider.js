import Slider from '@material-ui/core/Slider';
import PubSub from 'pubsub-js';
import { withStyles } from '@material-ui/core/styles';
import React from 'react';
import { COLORS_CHANGE } from '../../events';

export default class ChannelSlider extends React.Component {
  constructor(props) {
    super(props);
    const { channel, setSliderValue } = props;
    this.channel = channel;
    this.state = {
      sliderValue: [0, 20000],
      slider: null,
      colorValue: [],
    };
    const slidersObj = {};
    slidersObj[channel] = [0, 20000];
    setSliderValue(slidersObj);
    this.handleSliderChange = this.handleSliderChange.bind(this);
  }

  handleSliderChange(event, value) {
    const channelValue = {};
    channelValue[this.channel] = value;
    this.setState({ sliderValue: value });
    const { setSliderValue } = this.props;
    setSliderValue(channelValue);
  }

  componentWillMount() {
    this.colorsChangeToken = PubSub.subscribe(COLORS_CHANGE, this.onColorsChange.bind(this));
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.colorsChangeToken);
  }

  onColorsChange(msg, colorData) {
    if (Object.keys(colorData)[0] === this.channel) {
      const slider = withStyles({
        root: {
          color: `rgb(${colorData[this.channel]})`,
        },
      })(Slider);
      const colorValue = colorData[this.channel];
      this.setState({
        slider,
        colorValue,
      });
    }
  }

  render() {
    const { sliderValue, colorValue, slider } = this.state;
    if (colorValue.length > 0) {
      const ColorSlider = slider;
      return (
        <ColorSlider
          value={sliderValue}
          onChange={this.handleSliderChange}
          valueLabelDisplay="auto"
          getAriaLabel={() => this.channel}
          min={0}
          max={65535}
          orientation="horizontal"
        />
      );
    }

    return null;
  }
}
