import React from 'react';
import PubSub from 'pubsub-js';

import { Checkbox } from 'antd';
import ChannelSlider from './ChannelSlider';
import PopoverColor from '../sets/PopoverColor';
import { VIEWER_PALETTE } from '../utils';

import TitleInfo from '../TitleInfo';
import {
  SLIDERS_CHANGE, RASTER_ADD, COLORS_CHANGE, CHANNEL_TOGGLE,
} from '../../events';

export default class ChannelEffectSubscriber extends React.Component {
  constructor(props) {
    super(props);
    this.state = { colorValues: {}, channelsOn: {} };
    this.setSliderValue = this.setSliderValue.bind(this);
    this.setColorValue = this.setColorValue.bind(this);
    this.toggleChannel = this.toggleChannel.bind(this);
    this.componentWillUnmount = this.componentWillUnmount.bind(this);
  }

  componentWillMount() {
    this.rasterAddToken = PubSub.subscribe(RASTER_ADD, this.rasterAddSubscriber.bind(this));
  }

  componentDidMount() {
    const { onReady } = this.props;
    onReady();
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.rasterAddToken);
  }

  rasterAddSubscriber(msg, sliderData) {
    Object.keys(sliderData.channels).sort().forEach((channel, i) => {
      this.setColorValue({ channel, color: VIEWER_PALETTE[i] });
      this.toggleChannel(channel);
    });
  }

  // eslint-disable-next-line class-methods-use-this
  setSliderValue(sliderValue) {
    PubSub.publish(SLIDERS_CHANGE, sliderValue);
  }

  setColorValue({ channel, color }) {
    const colorValue = {};
    colorValue[channel] = color;
    this.setState(prevState => ({ colorValues: { ...prevState.colorValues, ...colorValue } }));
    PubSub.publish(COLORS_CHANGE, colorValue);
  }

  toggleChannel(channel) {
    this.setState((prevState) => {
      const channelOn = {};
      const channelToggle = !prevState.channelsOn[channel];
      channelOn[channel] = channelToggle;
      PubSub.publish(CHANNEL_TOGGLE, channelOn);
      return { channelsOn: { ...prevState.channelsOn, ...channelOn } };
    });
  }

  render() {
    const { colorValues, channelsOn } = this.state;
    const channelSliders = Object.keys(colorValues).sort().map((channel, i) => {
      const channelColor = colorValues[channel] || VIEWER_PALETTE[i];
      return (
        <div key={`container-${channel}`}>
          <p>{channel}</p>
          <div className="channel-container">
            <Checkbox
              className="channel-checked"
              checked={channelsOn[channel]}
              onChange={e => this.toggleChannel(channel)}
            />
            <PopoverColor
              prefixClass="channel"
              color={channelColor}
              setColor={color => this.setColorValue({ channel, color })}
              placement="left"
            />
            <ChannelSlider
              channel={channel}
              setSliderValue={this.setSliderValue}
              max={65535}
              color={channelColor}
            />
          </div>
          <hr style={{ border: '1px solid #000' }} />
        </div>
      );
    });
    return (
      <TitleInfo
        title="Channel Levels"
        isScroll
        componentWillUnmount={this.componentWillUnmount}
      >
        <hr style={{ border: '1px solid #000' }} />
        {channelSliders}
      </TitleInfo>
    );
  }
}
