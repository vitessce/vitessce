import expect from 'expect';
import ChannelSlider from './ChannelSlider';
import Slider from '@material-ui/core/Slider';
import { shallow } from 'enzyme';
import React from 'react';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

describe('ChannelSlider.js', () => {

  describe('ChannelSlider', () => {
    let channel;
    let color;
    let setSliderValue;

    beforeEach(() => {
      channel = 'testChannel'
      color =  [1, 2, 3]
      setSliderValue = (val) => val
    });

    it('Instantiates and state set', () => {
      const slider = shallow(<ChannelSlider channel={channel} color={color} setSliderValue={setSliderValue} />);
      expect(slider.state('sliderValue')).toEqual([0,20000]);
      expect(slider.state('colorValue')).toEqual([1, 2, 3]);
    });

    it('Slider fails for bad color', () => {
      expect(() => {new ChannelSlider()}).toThrow(TypeError);
    });
    
  });
});
