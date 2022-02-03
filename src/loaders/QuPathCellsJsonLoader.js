import centroid from '@turf/centroid';
import { featureCollection as turfFeatureCollection, point as turfPoint } from '@turf/helpers';

import { AbstractLoaderError } from './errors/index';
import LoaderResult from './LoaderResult';

import cells from '../schemas/cells.schema.json';
import JsonLoader from './JsonLoader';

export default class QuPathCellsJsonLoader extends JsonLoader {
  constructor(dataSource, params) {
    super(dataSource, params);
    this.schema = cells;
  }

  load() {
    const {
      url,
    } = this;
    if (this.data) {
      return this.data;
    }
    this.data = this.dataSource.data
      .then((data) => {
        if (data instanceof AbstractLoaderError) {
          return Promise.reject(data);
        }
        const quPathCells = data;
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
        return Promise.resolve(new LoaderResult(cellsJson, url));
      });
    return this.data;
  }
}
