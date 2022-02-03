import centroid from '@turf/centroid';
import { featureCollection as turfFeatureCollection, point as turfPoint } from '@turf/helpers';

import { AbstractLoaderError } from './errors/index';
import LoaderResult from './LoaderResult';

import cells from '../schemas/cells.schema.json';
import JsonLoader from './JsonLoader';
<<<<<<< HEAD:src/loaders/QuPathCellsJsonLoader.js

export default class QuPathCellsJsonLoader extends JsonLoader {
  constructor(dataSource, params) {
    super(dataSource, params);
=======
import { LoaderFetchError, LoaderValidationError } from './errors/index';

export default class GeoJsonJsonLoader extends JsonLoader {
  constructor(params) {
    super(params);
>>>>>>> 8c88cca6 (Rename):src/loaders/GeoJsonJsonLoader.js
    this.schema = cells;
  }

  load() {
    const {
      url,
    } = this;
<<<<<<< HEAD:src/loaders/QuPathCellsJsonLoader.js
    if (this.data) {
      return this.data;
    }
    this.data = this.dataSource.data
      .then((data) => {
        if (data instanceof AbstractLoaderError) {
          return Promise.reject(data);
        }
        const quPathCells = data;
=======
    return fetch(url, requestInit).then(async (response) => {
      if (response.ok) {
        const geoJson = await response.json();
>>>>>>> 8c88cca6 (Rename):src/loaders/GeoJsonJsonLoader.js
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
        return Promise.resolve(new LoaderResult(cellsJson, url));
      });
    return this.data;
  }
}
