import Slider from '@material-ui/core/Slider';
import PubSub from 'pubsub-js';
import { withStyles } from '@material-ui/core/styles';
import React from 'react';
import { COLORS_CHANGE } from '../../events';

const INIT_RANGE = [0, 20000];

export default class ChannelSlider extends React.Component {
  constructor(props) {
    super(props);
    const { channel, color, setSliderValue } = props;
    this.channel = channel;
    this.state = {
      sliderValue: INIT_RANGE,
      slider: withStyles({
        root: {
          color: `rgb(${color})`,
        },
      })(Slider),
      colorValue: color,
    };
    setSliderValue({ [this.channel]: INIT_RANGE });
    this.handleSliderChange = this.handleSliderChange.bind(this);
  }

  handleSliderChange(value) {
    const channelValue = { [this.channel]: value };
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

  onColorsChange(msg, rgbData) {
    if (Object.keys(rgbData)[0] === this.channel) {
      const slider = withStyles({
        root: {
          color: `rgb(${rgbData[this.channel]})`,
        },
      })(Slider);
      const colorValue = rgbData[this.channel];
      this.setState({
        slider,
        colorValue,
      });
    }
  }

  render() {
    const { sliderValue, slider } = this.state;
    const ColorSlider = slider;
    return (
      <ColorSlider
        value={sliderValue}
        // eslint-disable-next-line no-unused-vars
        onChange={(e, v) => this.handleSliderChange(v)}
        valueLabelDisplay="auto"
        getAriaLabel={() => this.channel}
        channel={this.channel}
        min={0}
        max={65535}
        orientation="horizontal"
      />
    );
  }
}
