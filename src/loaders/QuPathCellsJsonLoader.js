import centroid from '@turf/centroid';
import { featureCollection as turfFeatureCollection, point as turfPoint } from '@turf/helpers';

import cells from '../schemas/cells.schema.json';
import JsonLoader from './JsonLoader';
import { LoaderFetchError } from './errors/index';

export default class QuPathCellsJsonLoader extends JsonLoader {
  constructor(params) {
    super(params);
    this.schema = cells;
  }

  loadJson() {
    const {
      url, requestInit, type, fileType,
    } = this;
    return fetch(url, requestInit).then(async (response) => {
      if (response.ok) {
        const quPathCells = await response.json();
        const cellsJson = {};
        quPathCells.forEach((cell, index) => {
          if (cell.geometry.type === 'polygon') {
            const points = turfFeatureCollection(
              cell.geometry.coordinates[0].map(turfPoint),
            );
            cellsJson[String(index)] = {
              poly: cell.geometry.coordinates[0],
              xy: centroid(points).geometry.coordinates,
            };
          }
        });
        console.log(cellsJson); // eslint-disable-line
        return cellsJson;
      }
      return Promise.reject(
        new LoaderFetchError(type, fileType, url, response.headers),
      );
    });
  }
}
