import React from 'react';
import Adapter from 'enzyme-adapter-react-16';
import { shallow, configure } from 'enzyme';
import expect from 'expect';
import Status from './Status';

configure({ adapter: new Adapter() });

describe('Status.js', () => {
  describe('<Status />', () => {
    it('shows warning', () => {
      const wrapper = shallow(<Status warn="WARN" />);
      expect(wrapper.find('.alert-warning').text()).toEqual('WARN');
    });

    it('shows info', () => {
      const wrapper = shallow(<Status info="INFO" />);
      expect(wrapper.text()).toEqual('INFO');
    });

    it('shows both', () => {
      const wrapper = shallow(<Status info="INFO" warn="WARN" />);
      expect(wrapper.text()).toEqual('INFOWARN');
    });
  });
});
