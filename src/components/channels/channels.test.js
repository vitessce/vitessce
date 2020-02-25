import expect from 'expect';
import { shallow, configure } from 'enzyme';
import React from 'react';

import Adapter from 'enzyme-adapter-react-16';
import ChannelSlider from './ChannelSlider';

configure({ adapter: new Adapter() });

describe('ChannelSlider.js', () => {
  describe('ChannelSlider', () => {
    let channel;
    let color;
    let setSliderValue;

    beforeEach(() => {
      channel = 'testChannel';
      color = [1, 2, 3];
      setSliderValue = val => val;
    });

    it('Instantiates and state set', () => {
      const slider = shallow(
        <ChannelSlider
          channel={channel}
          color={color}
          setSliderValue={setSliderValue}
        />,
      );
      expect(slider.state('sliderValue')).toEqual([0, 20000]);
      expect(slider.state('colorValue')).toEqual([1, 2, 3]);
    });

    it('Slider fails for bad color', () => {
      expect(() => new ChannelSlider()).toThrow(TypeError);
    });
  });
});
