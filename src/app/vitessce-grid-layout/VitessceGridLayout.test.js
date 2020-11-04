import React from 'react';
import Adapter from 'enzyme-adapter-react-16';
import { mount, configure } from 'enzyme';
import expect from 'expect';
import VitessceGridLayout from './VitessceGridLayout';

configure({ adapter: new Adapter() });

describe('VitessceGridLayout.js', () => {
  describe('<VitessceGridLayout />', () => {
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
    it('mount() works', () => {
      const wrapper = mount(<VitessceGridLayout
        layout={layoutJson}
        getComponent={() => FakeComponent}
        draggableHandle=".my-handle"
      />);

      expect(wrapper.find('.react-grid-item').length).toEqual(1);
      expect(wrapper.find('.react-grid-item').text()).toEqual('Hello World');
      expect(wrapper.find('.react-grid-item span:not(.react-resizable-handle)').length).toEqual(1);

      const style = wrapper.find('style');
      expect(style.length).toEqual(1);
      expect(style.text()).toContain('.my-handle {');
      expect(style.text()).toContain('.my-handle:active {');
    });

    it('rowHeight works', () => {
      const wrapper = mount(<VitessceGridLayout
        layout={layoutJson}
        getComponent={() => FakeComponent}
        draggableHandle=".my-handle"
        rowHeight={123}
      />);

      expect(wrapper.find('.react-grid-item').getDOMNode().style.height).toEqual('123px');
    });
  });
});
