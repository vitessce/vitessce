import React from 'react';
import PubSub from 'pubsub-js';

import ChannelSlider from './ChannelSlider';

import TitleInfo from '../TitleInfo';
import { SLIDERS_CHANGE, RASTER_ADD } from '../../events';

export default class SlidersSubscriber extends React.Component {
  constructor(props) {
    super(props);
    this.state = {channels:[]}
    this.setChannelSliderValue = this.setSliderValue.bind(this);
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

  render() {
    const { channels } = this.state;
    console.log(channels)
    const channelSliders = channels.map((channel) => {
      console.log(channel);
      return(
        <div key={`container-${channel}`}>
          <ChannelSlider
            channel={channel}
            setSliderValue={this.setSliderValue}
            max={65535}
          />
        </div>
    )
    })
    console.log(channelSliders)
    return (
      <TitleInfo
        title="Channel Levels"
        isScroll
        componentWillUnmount={this.componentWillUnmount}
      >
        {channelSliders}
      </TitleInfo>
    );
  }
}
