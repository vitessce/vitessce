import React from 'react';
import Adapter from 'enzyme-adapter-react-16';
import { shallow, configure } from 'enzyme';
import expect from 'expect';
import CurrentSetManager from './CurrentSetManager';
import Sets from './sets';

configure({ adapter: new Adapter() });

describe('CurrentSetManager.js', () => {
  describe('<CurrentSetManager />', () => {
    it('has disabled styles if no current selection', () => {
      const setsState = Sets.initialState;
      const wrapper = shallow(<CurrentSetManager sets={setsState} />);
      expect(wrapper.find('.sets-manager-disabled').length).toEqual(1);
    });

    it('has start saving button but no input if current selection is not empty', () => {
      let setsState = Sets.initialState;
      setsState = Sets.setCurrentSet(setsState, new Set([1, 2, 3]));
      const wrapper = shallow(<CurrentSetManager sets={setsState} />);
      expect(wrapper.find('.sets-manager-disabled').length).toEqual(0);
      expect(wrapper.find('.set-item-save').length).toEqual(1);
      expect(wrapper.find('input').length).toEqual(0);
    });

    it('has save button and input if start saving button was pressed', () => {
      let setsState = Sets.initialState;
      setsState = Sets.setCurrentSet(setsState, new Set([1, 2, 3]));
      const wrapper = shallow(<CurrentSetManager sets={setsState} />);
      const button = wrapper.find('.set-item-save');
      button.simulate('click', { preventDefault: () => {} });
      wrapper.update();
      expect(wrapper.find('input').length).toEqual(1);
    });
  });
});
