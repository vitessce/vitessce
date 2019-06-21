import expect from 'expect';
import { onHeatmapMouseMove } from './utils';

describe('utils.js', () => {
  describe('onMouseMove()', () => {
    it('selects the correct cell and calls updateCellsHover', (done) => {
      // Pretend heatmap has 3 cells arranged with IDs [10, 20, 30].
      // Pretend the heatmap element is 100 pixels wide.
      // Pretend we hover over the pixel at x = 34.
      // We expect the cell with ID 20 to be selected.
      const props = {
        cells: {
          10: {
            xy: 0,
            mappings: {},
            factors: {},
          },
          20: {
            xy: 0,
            mappings: {},
            factors: {},
          },
          30: {
            xy: 0,
            mappings: {},
            factors: {},
          },
        },
        clusters: {
          cols: ['10', '20', '30'],
        },
        updateCellsHover(hoverInfo) {
          expect(hoverInfo.cellId).toEqual(20);
          done();
        },
      };
      onHeatmapMouseMove({
        clientX: 34,
        target: {
          getBoundingClientRect() {
            return {
              left: 0,
              width: 100,
            };
          },
        },
      }, props);
    });
  });
});
