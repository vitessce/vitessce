import expect from 'expect';
import React from 'react';
import { shallow, render, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import VitessceGrid from './VitessceGrid';

configure({ adapter: new Adapter() });

describe('VitessceGrid.js', () => {
  describe('<VitessceGrid />', () => {
    function FakeComponent(props) {
      const { text } = props;
      return <span>{text}</span>;
    }
    /* eslint-disable object-curly-newline */
    /* eslint-disable object-property-newline */
    const layoutJson = {
      columns: {
        600: [0, 2, 4, 8],
      },
      components: [
        { component: 'FakeComponent',
          props: { text: 'Hello World' },
          x: 0, y: 0, w: 2 },
      ],
    };
    /* eslint-enable */
    it('shallow() works', () => {
      const wrapper = shallow(<VitessceGrid
        layout={layoutJson}
        getComponent={() => FakeComponent}
        draggableHandle=".my-handle"
      />);

      expect(wrapper.find('div').length).toEqual(1);
      expect(wrapper.find('div').text()).toEqual('<FakeComponent />');

      expect(wrapper.find('span').length).toEqual(0);

      const style = wrapper.find('style');
      expect(style.length).toEqual(1);
      expect(style.text()).toContain('.my-handle {');
      expect(style.text()).toContain('.my-handle:active {');
    });

    it('render() works', () => {
      const wrapper = render(<VitessceGrid
        layout={layoutJson}
        getComponent={() => FakeComponent}
        draggableHandle=".my-handle"
      />);

      expect(wrapper.find('div').length).toEqual(1);
      expect(wrapper.find('div').text()).toEqual('Hello World');

      expect(wrapper.find('span').length).toEqual(2);

      const style = wrapper.find('style');
      expect(style.length).toEqual(0);
      // TODO: Why does render() not generate style?
    });

    it('rowHeight works', () => {
      const wrapper = render(<VitessceGrid
        layout={layoutJson}
        getComponent={() => FakeComponent}
        draggableHandle=".my-handle"
        rowHeight={123}
      />);

      expect(wrapper['1'].children[0].attribs.style).toContain('height:123px');
    });
  });
});
