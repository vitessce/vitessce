import expect from 'expect';
import React from 'react';
import { shallow, render, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import VitessceGrid, { makeGridLayout, getMaxRows, resolveLayout } from './VitessceGrid';

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

  describe('makeGridLayout', () => {
    it('applies columnXs and makes list from object', () => {
      const columnXs = [0, 4, 8, 12];
      const layout = {
        bigLeft: { x: 0, y: 0, w: 2 },
        smallRight: { x: 2, y: 0 },
        smallLeft: { x: 0, y: 1 },
        bigRight: { x: 1, y: 1, w: 2 },
        wholeRow: { x: 0, y: 2, w: 3 },
      };
      const gridLayout = makeGridLayout(columnXs, layout);
      expect(gridLayout).toEqual(
        /* Disable eslint so it's easier to copy-and-paste from test results. */
        /* eslint-disable quote-props */
        /* eslint-disable quotes */
        [
          {
            "h": 1,
            "i": "bigLeft",
            "w": 8,
            "x": 0,
            "y": 0,
          },
          {
            "h": 1,
            "i": "smallRight",
            "w": 4,
            "x": 8,
            "y": 0,
          },
          {
            "h": 1,
            "i": "smallLeft",
            "w": 4,
            "x": 0,
            "y": 1,
          },
          {
            "h": 1,
            "i": "bigRight",
            "w": 8,
            "x": 4,
            "y": 1,
          },
          {
            "h": 1,
            "i": "wholeRow",
            "w": 12,
            "x": 0,
            "y": 2,
          },
        ],
        /* eslint-enable */
      );
    });
  });

  describe('getMaxRows', () => {
    it('works', () => {
      const columnXs = [0, 4, 8, 12];
      const layout = {
        bigLeft: { x: 0, y: 0, w: 2 },
        smallRight: { x: 2, y: 0 },
        smallLeft: { x: 0, y: 1 },
        bigRight: { x: 1, y: 1, w: 2 },
        wholeRow: { x: 0, y: 2, w: 3 },
      };
      const gridLayout = makeGridLayout(columnXs, layout);
      expect(getMaxRows([gridLayout])).toEqual(3);
    });
  });

  describe('resolveLayout', () => {
    const componentsSpec = [
      { component: 'NoProps', x: 0, y: 0 },
      {
        component: 'HasProps', props: { foo: 'bar' }, x: 1, y: 1, w: 1, h: 1,
      },
    ];
    const expectedComponents = {
      r0_c0: {
        component: 'NoProps',
        props: {},
      },
      r1_c1: {
        component: 'HasProps',
        props: {
          foo: 'bar',
        },
      },
    };

    it('handles responsive', () => {
      const {
        cols, layouts, breakpoints, components,
      } = resolveLayout({
        columns: {
          1000: [0, 3, 9, 12],
          800: [0, 4, 8, 12],
        },
        components: componentsSpec,
      });
      expect(cols).toEqual({ 800: 12, 1000: 12 });
      expect(layouts).toEqual(
        {
          800: [
            {
              h: 1, i: 'r0_c0', w: 4, x: 0, y: 0,
            },
            {
              h: 1, i: 'r1_c1', w: 4, x: 4, y: 1,
            },
          ],
          1000: [
            {
              h: 1, i: 'r0_c0', w: 3, x: 0, y: 0,
            },
            {
              h: 1, i: 'r1_c1', w: 6, x: 3, y: 1,
            },
          ],
        },
      );
      expect(breakpoints).toEqual({
        800: '800',
        1000: '1000',
      });
      expect(components).toEqual(expectedComponents);
    });

    it('handles static', () => {
      const {
        cols, layouts, breakpoints, components,
      } = resolveLayout(
        componentsSpec,
      );
      expect(cols).toEqual({ ID: 12 });
      expect(layouts).toEqual(
        {
          ID: [
            {
              h: 1, i: 'r0_c0', w: 1, x: 0, y: 0,
            },
            {
              h: 1, i: 'r1_c1', w: 1, x: 1, y: 1,
            },
          ],
        },
      );
      expect(breakpoints).toEqual({ ID: 1000 });
      expect(components).toEqual(expectedComponents);
    });
  });
});
