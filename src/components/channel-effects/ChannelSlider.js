import Slider from '@material-ui/core/Slider';
import PubSub from 'pubsub-js';
import { withStyles } from '@material-ui/core/styles';
import React from 'react';
import { COLORS_CHANGE } from '../../events';

export default class ChannelSlider extends React.Component {
  constructor(props) {
    super(props);
    const { channel } = props;
    this.channel = channel;
    this.state = {
      sliderValue: [],
      slider: null,
      colorValue: [],
    };
    this.handleSliderChange = this.handleSliderChange.bind(this);
  }

  handleSliderChange(value) {
    const channelValue = {};
    channelValue[this.channel] = value;
    this.setState({ sliderValue: value });
    const { setSliderValue } = this.props;
    setSliderValue(channelValue);
  }

  componentDidMount() {
    this.handleSliderChange([0, 20000]);
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
          // eslint-disable-next-line no-unused-vars
          onChange={(e, v) => this.handleSliderChange(v)}
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
