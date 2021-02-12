import React from 'react';
import Adapter from 'enzyme-adapter-react-16';
import { mount, configure } from 'enzyme';
import expect from 'expect';
import VitessceGrid from './VitessceGrid';

configure({ adapter: new Adapter() });

describe('VitessceGrid.js', () => {
  describe('<VitessceGrid />', () => {
    it('renders', () => {
      const config = {
        version: '1.0.0',
        description: 'fake description',
        datasets: [],
        name: 'fake name',
        layout: [
          {
            component: 'FakeComponent',
            props: { description: 'fake prop description' },
            x: 0,
            y: 0,
          },
        ],
      };

      function FakeComponent() {
        return <p>FakeComponent!</p>;
      }
      const getComponent = () => FakeComponent;
      const wrapper = mount(<VitessceGrid config={config} getComponent={getComponent} />);
      expect(wrapper.debug()).toContain('FakeComponent!');
    });
  });
});
