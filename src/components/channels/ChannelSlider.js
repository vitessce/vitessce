import Slider from '@material-ui/core/Slider';
import PubSub from 'pubsub-js';
import { withStyles } from '@material-ui/core/styles';
import React from 'react';
import { COLORS_CHANGE } from '../../events';

export default class ChannelSlider extends React.Component {
  constructor(props) {
    super(props);
    const { channel, color, setSliderValue, range } = props;
    this.channel = channel;
    const initRange = [range[0], Math.ceil(range[1] / 5)]
    this.state = {
      sliderValue: initRange,
      range,
      slider: withStyles({
        root: {
          color: `rgb(${color})`,
        },
      })(Slider),
      colorValue: color,
    };
    setSliderValue({ [this.channel]: initRange });
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
    const { sliderValue, slider, range } = this.state;
    const ColorSlider = slider;
    return (
      <ColorSlider
        value={sliderValue}
        // eslint-disable-next-line no-unused-vars
        onChange={(e, v) => this.handleSliderChange(v)}
        valueLabelDisplay="auto"
        getAriaLabel={() => this.channel}
        channel={this.channel}
        min={range[0]}
        max={range[1]}
        orientation="horizontal"
      />
    );
  }
}
