import React from 'react';
import Adapter from 'enzyme-adapter-react-16';
import { shallow, configure } from 'enzyme';
import expect from 'expect';
import { DatasetPicker } from './app';

configure({ adapter: new Adapter() });

describe('app', () => {
  describe('DatasetPicker', () => {
    it('is empty if datasets is empty', () => {
      const wrapper = shallow(<DatasetPicker datasets={{}} />);
      expect(wrapper.find('a').length).toEqual(0);
    });

    it('has one if datasets has one', () => {
      const datasets = { fake: { name: 'NAME', description: 'DESCRIPTION' } };
      const wrapper = shallow(<DatasetPicker datasets={datasets} />);
      expect(wrapper.find('a').length).toEqual(1);
    });
  });
});
