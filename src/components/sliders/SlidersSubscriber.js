import React from 'react';
import PubSub from 'pubsub-js';

import Sliders from './Sliders';

import TitleInfo from '../TitleInfo';
import { SLIDERS_ADD, SLIDERS_CHANGE } from '../../events';

export default class SlidersSubscriber extends React.Component {
  constructor(props) {
    super(props);
    this.state = { sliderValues: {}, colorValues: {} };
    this.setSliderValue = this.setSliderValue.bind(this);
    this.componentWillUnmount = this.componentWillUnmount.bind(this);
  }

  componentWillMount() {
    this.slidersAddToken = PubSub.subscribe(SLIDERS_ADD, this.slidersAddSubscriber.bind(this));
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.slidersAddToken);
  }

  slidersAddSubscriber(msg, sliderData) {
    this.setState({ ...sliderData });
  }

  setSliderValue(sliderValue) {
    this.setState(prevState => {
      return { sliderValues: { ...prevState.sliderValues, ...sliderValue } };
    });
    PubSub.publish(SLIDER_CHANGE, sliderValue);
  }

  render() {
    const { sliderValues, colorValues } = this.state;
    return (
      <TitleInfo
        title="Channel Levels"
        isScroll
        componentWillUnmount={this.componentWillUnmount}
      >
        <Sliders
          sliderValues={sliderValues}
          colorValues={colorValues}
          setSliderValue={this.setSliderValue}
        />
      </TitleInfo>
    );
  }
}
