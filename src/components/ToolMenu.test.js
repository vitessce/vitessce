import React from 'react';
import Adapter from 'enzyme-adapter-react-16';
import { shallow, configure } from 'enzyme';
import expect from 'expect';
import { IconButton } from './ToolMenu';

configure({ adapter: new Adapter() });

describe('ToolMenu.js', () => {
  describe('<IconButton />', () => {
    it('has .active if isActive', () => {
      const wrapper = shallow(<IconButton isActive />);
      expect(wrapper.find('.active').length).toEqual(1);
    });

    it('missing .active if not isActive', () => {
      const wrapper = shallow(<IconButton />);
      expect(wrapper.find('.active').length).toEqual(0);
    });
  });
});
