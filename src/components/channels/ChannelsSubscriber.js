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
  [0, 0, 255],
  [0, 255, 0],
  [255, 0, 0],
  [255, 255, 0],
  [0, 255, 255],
  [255, 0, 255],
  [255, 255, 255],
  [255, 128, 0],
];

const STANDARD_MAX = 65535;

export default class ChannelsSubscriber extends React.Component {
  constructor(props) {
    super(props);
    this.state = { colorValues: {}, channelsOn: {}, rangeValues: {} };
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

  rasterAddSubscriber(msg, rasterData) {
    Object.keys(rasterData)
      .forEach((channel, i) => {
        const rangeValue = { [channel]: rasterData[channel].range };
        this.setState(prevState => ({ rangeValues: { ...prevState.rangeValues, ...rangeValue } }));
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
    const { colorValues, channelsOn, rangeValues } = this.state;
    const hr = <hr style={{ border: '1px solid #000' }} />;
    const channelSliders = Object.keys(colorValues)
      .map((channel, i) => {
        const channelColor = colorValues[channel] || VIEWER_PALETTE[i];
        const rangeValue = rangeValues[channel] || [0, STANDARD_MAX];
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
                palette={VIEWER_PALETTE}
              />
              <ChannelSlider
                channel={channel}
                setSliderValue={this.setSliderValue}
                range={rangeValue}
                color={channelColor}
              />
            </div>
            {hr}
          </div>
        );
      });
    return (
      <TitleInfo title="Channel Levels" isScroll componentWillUnmount={this.componentWillUnmount}>
        <div className="sliders">
          {hr}
          {channelSliders}
        </div>
      </TitleInfo>
    );
  }
}
