/* eslint-disable */
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
      transpose,
    } = args;

    let value;
    let offset;
    let rowI;
    let sortedRowI;
    let colI;
    let sortedColI;

    const view = new Uint8Array(data);

    let result;

    // TODO: clean up / remove if statement.
    if(transpose) {

      const numRows = cols.length;
      const numCols = cellOrdering.length;

      result = range(yTiles).map(i => {
        return range(xTiles).map(j => {
          const tileData = new Uint8Array(tileSize * tileSize);

          range(tileSize).forEach(tileX => {
            // Need to iterate over cells in the outer loop.
            colI = (j * tileSize) + tileX; // the row / cell index
            if(colI < numCols) {
              sortedColI = rows.indexOf(cellOrdering[colI]);
              if(sortedColI >= -1) {
                range(tileSize).forEach(tileY => {
                  rowI = (i * tileSize) + tileY; // the col / gene index

                  value = view[sortedColI * numRows + rowI];

                  //value = tileX / tileSize * 255;
                  offset = ((tileSize - tileY - 1) * tileSize + tileX);

                  tileData[offset] = value;
                });
              }
            }
            
          });

          return tileData;
        });
      });
    } else {

      const numRows = cellOrdering.length;
      const numCols = cols.length;

      result = range(yTiles).map(i => {
        return range(xTiles).map(j => {
          const tileData = new Uint8Array(tileSize * tileSize);

          range(tileSize).forEach(tileY => {
            // Need to iterate over cells in the outer loop.
            rowI = (i * tileSize) + tileY; // the row / cell index
            if(rowI < numRows) {
              sortedRowI = rows.indexOf(cellOrdering[rowI]);
              if(sortedRowI >= -1) {
                range(tileSize).forEach(tileX => {
                  colI = (j * tileSize) + tileX; // the col / gene index

                  if(colI < numCols) {
                    value = view[sortedRowI * numCols + colI];
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
    }

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