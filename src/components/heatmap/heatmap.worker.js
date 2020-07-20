/* eslint-disable */
import { interpolatePlasma } from '../interpolate-colors';
import range from 'lodash/range';

function getTiles(self, args) {
    console.log("I am in a worker");
    const {
      curr,
      xTiles,
      yTiles,
      tileSize,
      cellOrdering,
      rows,
      cols,
      data,
    } = args;

    let value;
    let alpha;
    let offset;
    let rowI;
    let sortedRowI;
    let colI;

    const height = cellOrdering.length;
    const width = cols.length;

    const view = new Uint8Array(data);

    const result = range(yTiles).map(i => {
      return range(xTiles).map(j => {
        const tileData = new Uint8ClampedArray(tileSize * tileSize);

        range(tileSize).forEach(tileY => {
          rowI = (i * tileSize) + tileY; // the row / cell index
          if(rowI < height) {
            sortedRowI = rows.indexOf(cellOrdering[rowI]);
            if(sortedRowI >= -1) {
              range(tileSize).forEach(tileX => {
                colI = (j * tileSize) + tileX; // the col / gene index

                if(colI < width) {
                  value = view[sortedRowI * width + colI];
                } else {
                  value = 0;
                }
                offset = ((tileSize - tileY - 1) * tileSize + tileX);

                tileData[offset] = value;
              });
            }
          }
        });

        return tileData;
      });
    });
    self.postMessage({ tiles: result, buffer: data, curr: curr }, [data]);
}

if (typeof self !== 'undefined') {

    const nameToFunction = {
        'getTiles': getTiles,
    };

    self.addEventListener('message', event => {
      try {
        const [name, args] = event.data;
        nameToFunction[name](self, args);
      } catch(e) {
        console.warn(e);
      }
    });
}