/* eslint-disable */
import { interpolatePlasma } from '../interpolate-colors';
import range from 'lodash/range';

function getTiles(self, args) {
    console.log("I am in a worker");
    const {
        xTiles,
        yTiles,
        tileSize,
        cellOrdering,
        rows,
        cols,
        data,
    } = args;
    console.info('from worker, PRE send back data.byteLength:', data.byteLength);

    let value;
    let alpha;
    let offset;
    let color;
    let rowI;
    let sortedRowI;
    let colI;

    const height = cellOrdering.length;
    const width = cols.length;

    const view = new Uint8Array(data);

    const result = range(yTiles).map(i => {
      return range(xTiles).map(j => {
        const tileData = new Uint8ClampedArray(tileSize * tileSize * 4);

        range(tileSize).forEach(tileY => {
          rowI = (i * tileSize) + tileY; // the row / cell index
          if(rowI < height) {
            sortedRowI = rows.indexOf(cellOrdering[rowI]);
            if(sortedRowI >= -1) {
              range(tileSize).forEach(tileX => {
                colI = (j * tileSize) + tileX; // the col / gene index

                if(colI < width) {
                  value = view[sortedRowI * width + colI];
                  alpha = 255;
                } else {
                  value = 0;
                  alpha = 0;
                }
                offset = ((tileSize - tileY - 1) * tileSize + tileX) * 4;

                color = interpolatePlasma(value / 255);

                tileData[offset + 0] = color[0];
                tileData[offset + 1] = color[1];
                tileData[offset + 2] = color[2];
                tileData[offset + 3] = 255;
              });
            }
          }
        });

        return new ImageData(tileData, tileSize, tileSize);
      });
    });
    self.postMessage({ tiles: result, buffer: data }, [data]);
    console.info('from worker, POST send back data.byteLength:', data.byteLength);
}

if (typeof self !== 'undefined') {

    const nameToFunction = {
        'getTiles': getTiles,
    };

    self.addEventListener('message', event => {
      const [name, args] = event.data;
      nameToFunction[name](self, args);
    });
}