import Slider from '@material-ui/core/Slider';
import PubSub from 'pubsub-js';
import { withStyles } from '@material-ui/core/styles';
import React from 'react';
import { COLORS_CHANGE } from '../../events';

export default class ChannelSlider extends React.Component {
  constructor(props) {
    super(props);
    const {
      channel, color, setSliderValue, range,
    } = props;
    this.channel = channel;
    const initRange = [range[0], Math.ceil(range[1] / 5)];
    // "5" is arbitrary, but the data tends to be left-skewed.
    // Eventually we want this to be based on the data in the image.
    this.state = {
      sliderValue: initRange,
      range,
      colorValue: color,
    };
    this.slider = withStyles({
      root: {
        color: `rgb(${color})`,
      },
    })(Slider);
    setSliderValue({ channel, sliderValue: initRange });
    this.handleSliderChange = this.handleSliderChange.bind(this);
  }

  handleSliderChange(value) {
    const channelValue = { channel: this.channel, sliderValue: value };
    this.setState({ sliderValue: value });
    const { setSliderValue } = this.props;
    setSliderValue(channelValue);
  }

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillMount() {
    this.colorsChangeToken = PubSub.subscribe(COLORS_CHANGE, this.onColorsChange.bind(this));
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.colorsChangeToken);
  }

  onColorsChange(msg, channelRgb) {
    const { channel, rgb } = channelRgb;
    if (channel === this.channel) {
      this.setState({
        colorValue: rgb,
      });
    }
  }

  render() {
    const { sliderValue, range, colorValue } = this.state;
    const { slider } = this;
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
        style={
          {
            color: `rgb(${colorValue})`,
          }
        }
        orientation="horizontal"
      />
    );
  }
}
