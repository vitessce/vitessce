import React from 'react';
import Adapter from 'enzyme-adapter-react-16';
import { mount, configure } from 'enzyme';
import expect from 'expect';
import jest from 'jest-mock';
import PubSubVitessceGrid from './PubSubVitessceGrid';

configure({ adapter: new Adapter() });

describe('PubSubVitessceGrid.js', () => {
  describe('<PubSubVitessceGrid />', () => {
    const mockDSName = 'Wang';
    const mockNewDim = {
      x: 0, y: 0, w: 4, h: 4,
    };
    const mockNewDim2 = {
      x: 4, y: 0, w: 8, h: 4,
    };
    const savedMockLayout = {
      vitGrid:
        JSON.stringify({
          [mockDSName]: [mockNewDim, mockNewDim2],
        }),
    };
    function FakeComponent() {
      return <p>FakeComponent!</p>;
    }
    const getComponent = () => FakeComponent;
    const config = {
      description: 'fake description',
      layers: [],
      name: mockDSName,
      staticLayout: [
        {
          component: 'FakeComponent',
          props: { description: 'fake prop description' },
          x: 0,
          y: 0,
          h: 10,
          w: 5,
        },
        {
          component: 'FakeComponent2',
          props: { description: 'fake prop description' },
          x: 5,
          y: 0,
          h: 10,
          w: 5,
        },
      ],
    };
    jest.spyOn(Object.getPrototypeOf(window.localStorage), 'setItem').mockReturnValue(savedMockLayout);

    it('renders', () => {
      const wrapper = mount(<PubSubVitessceGrid config={config} getComponent={getComponent} />);
      expect(wrapper.debug()).toContain('FakeComponent!');
    });
    it('loads a data set layout from local storage', () => {
      jest.spyOn(Object.getPrototypeOf(window.localStorage), 'getItem').mockImplementation(() => savedMockLayout.vitGrid);
      const wrapper = mount(<PubSubVitessceGrid config={config} getComponent={getComponent} />);
      expect(wrapper.debug()).toContain(`x={${mockNewDim.x}}`);
      expect(wrapper.debug()).toContain(`y={${mockNewDim.y}}`);
      expect(wrapper.debug()).toContain(`h={${mockNewDim.h}}`);
      expect(wrapper.debug()).toContain(`w={${mockNewDim.w}}`);
    });
    it('onLayoutChange updates local storage', () => {
      const updatedDim = {
        x: 2, y: 2, w: 4, h: 4,
      };
      jest.spyOn(Object.getPrototypeOf(window.localStorage), 'setItem').mockImplementation((name, newLayout) => {
        savedMockLayout[name] = newLayout;
      });
      const wrapper = mount(<PubSubVitessceGrid config={config} getComponent={getComponent} />);
      wrapper.instance().onLayoutChange([updatedDim, mockNewDim2]);
      expect(savedMockLayout.vitGrid).toContain(`"x":${updatedDim.x}`);
      expect(savedMockLayout.vitGrid).toContain(`"y":${updatedDim.y}`);
    });
  });
});
