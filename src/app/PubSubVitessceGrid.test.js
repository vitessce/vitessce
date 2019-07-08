import React from 'react';
import Adapter from 'enzyme-adapter-react-16';
import { shallow, configure } from 'enzyme';
import expect from 'expect';
import PubSubVitessceGrid from './PubSubVitessceGrid';

configure({ adapter: new Adapter() });

describe('PubSubVitessceGrid.js', () => {
  describe('<PubSubVitessceGrid />', () => {
    it('renders', () => {
      const config = {
        description: 'fake description',
        layers: [],
        name: 'fake name',
        staticLayout: [
          {
            component: 'FakeComponent',
            props: { description: 'fake prop description' },
            x: 0,
            y: 0,
          },
        ],
      };

      function FakeComponent() {
        return <p>FakeComponent</p>;
      }
      const getComponent = () => FakeComponent;
      const wrapper = shallow(<PubSubVitessceGrid config={config} getComponent={getComponent} />);
      expect(wrapper.find('.p').length).toEqual(1);
    });
  });
});
