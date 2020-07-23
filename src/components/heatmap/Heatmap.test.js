/* eslint-disable */
import React from 'react';
import Adapter from 'enzyme-adapter-react-16';
import { configure, mount } from 'enzyme';
import expect from 'expect';
import Heatmap from './Heatmap';
import { clusters, cellColors } from './Heatmap.test.fixtures';
import { sum } from 'd3-array';

configure({ adapter: new Adapter() });

describe('<Heatmap/>', () => {
    it('renders a DeckGL element', () => {
      const wrapper = mount(
        <Heatmap
            uuid="heatmap-0"
            theme="dark"
            width={100}
            height={100}
            clusters={clusters}
            cellColors={cellColors}
            transpose={true}
        />
      );
      expect(wrapper.find('#deckgl-wrapper').length).toEqual(1);
    });

    it('renders a DeckGL element containing image data', (done) => {
        const wrapper = mount(
          <Heatmap
              uuid="heatmap-0"
              theme="dark"
              width={100}
              height={100}
              clusters={clusters}
              cellColors={cellColors}
              transpose={true}
          />
        );
        const gl = wrapper.find('#deckgl-wrapper canvas').getDOMNode().getContext('webgl2');
        const pixels = new Uint8Array(100 * 100 * 4);
        
        // Need to wait for the worker to finish working.
        setTimeout(() => {
            gl.readPixels(0, 0, 100, 100, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
            const pixelSum = sum(Array.from(pixels));
            expect(pixels.length).toEqual(40000);
            // A quick check for regressions.

            // TODO: make this test more interpretable.
            expect(pixelSum).toEqual(294429);
            done();
        }, 1000);
      });

});