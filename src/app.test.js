import React from 'react';
import Adapter from 'enzyme-adapter-react-16';
import { shallow, configure } from 'enzyme';
import expect from 'expect';
import { DatasetPicker } from './app';

configure({ adapter: new Adapter() });

describe('app', () => {
  describe('DatasetPicker', () => {
    it('produces a list', () => {
      const wrapper = shallow(<DatasetPicker datasets={{}} />);
      expect(wrapper.find('a').length).toEqual(0);
    });
  });
});
