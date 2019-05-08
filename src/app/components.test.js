import React from 'react';
import Adapter from 'enzyme-adapter-react-16';
import { shallow, configure } from 'enzyme';
import expect from 'expect';
import { DatasetList, resolveLayout } from './components';

configure({ adapter: new Adapter() });

describe('app/components.js', () => {
  describe('<DatasetList />', () => {
    it('is empty if configs is empty', () => {
      const wrapper = shallow(<DatasetList configs={[]} />);
      expect(wrapper.find('a').length).toEqual(0);
    });

    it('has one if datasets has one', () => {
      const configs = [{ name: 'foo', id: 'bar', description: 'Foo? Bar!' }];
      const wrapper = shallow(<DatasetList configs={configs} />);
      expect(wrapper.find('a').length).toEqual(1);
    });
  });

  describe('resolveLayout', () => {
    const layout = [
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
        layout,
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
        layout,
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
