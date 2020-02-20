import React from 'react';
import PubSub from 'pubsub-js';

import { Checkbox } from 'antd';
import ChannelSlider from './ChannelSlider';
import PopoverColor from '../sets/PopoverColor';

import TitleInfo from '../TitleInfo';
import {
  SLIDERS_CHANGE, RASTER_ADD, COLORS_CHANGE, CHANNEL_TOGGLE,
} from '../../events';

const VIEWER_PALETTE = [
  [255, 127, 0],
  [228, 26, 28],
  [55, 126, 184],
  [77, 175, 74],
  [152, 78, 163],
  [255, 255, 51],
];

export default class ChannelsSubscriber extends React.Component {
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
    Object.keys(sliderData.channels)
      .sort()
      .forEach((channel, i) => {
        this.setColorValue({ channel, color: VIEWER_PALETTE[i] });
        this.toggleChannel(channel);
      });
  }

  // eslint-disable-next-line class-methods-use-this
  setSliderValue(sliderValue) {
    PubSub.publish(SLIDERS_CHANGE, sliderValue);
  }

  setColorValue({ channel, color }) {
    const colorValue = { [channel]: color };
    this.setState(prevState => ({ colorValues: { ...prevState.colorValues, ...colorValue } }));
    PubSub.publish(COLORS_CHANGE, colorValue);
  }

  toggleChannel(channel) {
    this.setState((prevState) => {
      const channelToggle = !prevState.channelsOn[channel];
      const channelOn = { [channel]: channelToggle };
      PubSub.publish(CHANNEL_TOGGLE, channelOn);
      return { channelsOn: { ...prevState.channelsOn, ...channelOn } };
    });
  }

  render() {
    const { colorValues, channelsOn } = this.state;
    const hr = <hr style={{ border: '1px solid #000' }} />;
    const channelSliders = Object.keys(colorValues)
      .sort()
      .map((channel, i) => {
        const channelColor = colorValues[channel] || VIEWER_PALETTE[i];
        return (
          <div key={`container-${channel}`}>
            <p>{channel}</p>
            <div className="channel-container">
              <Checkbox
                className="channel-checked"
                checked={channelsOn[channel]}
                onChange={() => this.toggleChannel(channel)}
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
            {hr}
          </div>
        );
      });
    return (
      <TitleInfo title="Channel Levels" isScroll componentWillUnmount={this.componentWillUnmount}>
        {hr}
        {channelSliders}
      </TitleInfo>
    );
  }
}
