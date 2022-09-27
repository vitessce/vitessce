import React from 'react';
import Adapter from 'enzyme-adapter-react-16';
import { shallow, configure } from 'enzyme';
import expect from 'expect';
import Status from './Status';


configure({ adapter: new Adapter() });

function assertElementHasText(wrapper, query, text) {
  expect(wrapper.find(query).text()).toEqual(text);
}

describe('Status.js', () => {
  describe('<Status />', () => {
    it('shows warning', () => {
      const wrapper = shallow(<Status warn="WARN" />);
      assertElementHasText(wrapper, '.alert-warning', 'WARN');
    });

    it('shows info', () => {
      const wrapper = shallow(<Status info="INFO" />);
      assertElementHasText(wrapper, '[className="details"]', 'INFO');
      // The warning also has the "details" class, among others,
      // so ".details" is not sufficient.
    });

    it('shows both', () => {
      const wrapper = shallow(<Status info="INFO" warn="WARN" />);
      assertElementHasText(wrapper, '[className="details"]', 'INFO');
      assertElementHasText(wrapper, '.alert-warning', 'WARN');
    });
  });
});
