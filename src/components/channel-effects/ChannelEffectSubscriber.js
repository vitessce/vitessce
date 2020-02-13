import React from 'react';
import PubSub from 'pubsub-js';

import ChannelSlider from './ChannelSlider';
import ChannelColorSelector from './ChannelColorSelector';

import TitleInfo from '../TitleInfo';
import { SLIDERS_CHANGE, RASTER_ADD, COLORS_CHANGE } from '../../events';

export default class ChannelEffectSubscriber extends React.Component {
  constructor(props) {
    super(props);
    this.state = {channels:[]}
    this.setSliderValue = this.setSliderValue.bind(this);
    this.setColorValue = this.setColorValue.bind(this);
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
    const sliderValues = {}
    const colorValues = {}
    this.setState({ channels: [...Object.keys(sliderData.channels)] });
  }

  setSliderValue(sliderValue) {
    PubSub.publish(SLIDERS_CHANGE, sliderValue);
  }

  setColorValue(colorValue) {
    PubSub.publish(COLORS_CHANGE, colorValue);
  }

  render() {
    const { channels } = this.state;
    const channelSliders = channels.map((channel) => {
      return(
        <div key={`container-${channel}`}>
          <p>{channel}</p>
          <ChannelSlider
            channel={channel}
            setSliderValue={this.setSliderValue}
            max={65535}
          />
          <ChannelColorSelector
            channel={channel}
            setColorValue={this.setColorValue}
          />
          <hr style={{border: "1px solid #000"}}/>
        </div>
    )
    })
    return (
      <TitleInfo
        title="Channel Levels"
        isScroll
        componentWillUnmount={this.componentWillUnmount}
      >
      <hr style={{border: "1px solid #000"}}/>
        {channelSliders}
      </TitleInfo>
    );
  }
}
