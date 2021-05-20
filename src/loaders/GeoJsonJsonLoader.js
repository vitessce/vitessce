import centroid from '@turf/centroid';
import { featureCollection as turfFeatureCollection, point as turfPoint } from '@turf/helpers';

import cells from '../schemas/cells.schema.json';
import JsonLoader from './JsonLoader';
import LoaderResult from './LoaderResult';
import { LoaderValidationError } from './errors/index';

export default class QuPathCellsJsonLoader extends JsonLoader {
  constructor(dataSource, params) {
    super(dataSource, params);
    this.schema = cells;
  }

  load() {
    const {
      url, type, fileType,
    } = this;
    if (this.data) {
      return this.data;
    }
    this.data = this.dataSource.data
      .then((geoJson) => {
        const cellsJson = {};
        if (!(geoJson.every(cell => cell.geometry.type === 'Polygon')
          || geoJson.every(cell => cell.geometry.type === 'Point'))) {
          const reason = 'Vitessce only accepts GeoJSON that is excusively Points (i.e centroids) or Polygons';
          return Promise.reject(new LoaderValidationError(type, fileType, url, reason));
        }
        geoJson.forEach((cell, index) => {
          if (cell.geometry.type === 'Polygon') {
            const points = turfFeatureCollection(
              cell.geometry.coordinates[0].map(turfPoint),
            );
            cellsJson[String(index)] = {
              poly: cell.geometry.coordinates[0],
              xy: centroid(points).geometry.coordinates,
            };
          } else {
            cellsJson[String(index)] = {
              xy: cell.geometry.coordinates[0],
            };
          }
        });
        console.log(cellsJson); // eslint-disable-line
        return Promise.resolve(new LoaderResult(cellsJson, url));
      });
    return this.data;
  }
}
