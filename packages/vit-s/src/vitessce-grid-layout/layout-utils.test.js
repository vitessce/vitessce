import { describe, it, expect } from 'vitest';
import {
  makeGridLayout, getMaxRows, resolveLayout,
} from './layout-utils.js';

describe('layout-utils.js', () => {
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
      {
        uid: 'i0', component: 'NoProps', x: 0, y: 0,
      },
      {
        uid: 'i1', component: 'HasProps', props: { foo: 'bar' }, x: 1, y: 1, w: 1, h: 1,
      },
    ];
    const expectedComponents = {
      i0: {
        uid: 'i0',
        component: 'NoProps',
        coordinationScopes: {},
        coordinationScopesBy: {},
        props: {},
      },
      i1: {
        uid: 'i1',
        component: 'HasProps',
        coordinationScopes: {},
        coordinationScopesBy: {},
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
              h: 1, i: 'i0', w: 4, x: 0, y: 0,
            },
            {
              h: 1, i: 'i1', w: 4, x: 4, y: 1,
            },
          ],
          1000: [
            {
              h: 1, i: 'i0', w: 3, x: 0, y: 0,
            },
            {
              h: 1, i: 'i1', w: 6, x: 3, y: 1,
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
              h: 1, i: 'i0', w: 1, x: 0, y: 0,
            },
            {
              h: 1, i: 'i1', w: 1, x: 1, y: 1,
            },
          ],
        },
      );
      expect(breakpoints).toEqual({ ID: 1000 });
      expect(components).toEqual(expectedComponents);
    });
  });
});
