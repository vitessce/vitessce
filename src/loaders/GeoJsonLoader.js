/* eslint-disable */
import centroid from '@turf/centroid';
import { featureCollection as turfFeatureCollection, point as turfPoint } from '@turf/helpers';

import cells from '../schemas/cells.schema.json';
import JsonLoader from './JsonLoader';
import { LoaderFetchError, LoaderValidationError } from './errors/index';

export default class GeoJsonLoader extends JsonLoader {
  constructor(params) {
    super(params);
    this.schema = cells;
  }

  rejectGeoJson(reason) {
    const { url, type, fileType } = this;
    return Promise.reject(new LoaderValidationError(type, fileType, url, reason));
  }

  loadJson() {
    const {
      url, requestInit, type, fileType,
    } = this;
    return fetch(url, requestInit).then(async (response) => {
      if (response.ok) {
        const geoJson = await response.json();
        const cellsJson = {};
        if (!(geoJson.every(cell => cell.type === 'Polygon')
          || geoJson.every(cell => cell.type === 'Point'))) {
          this.rejectGeoJson('Vitessce only accepts GeoJSON that is excusively Points (i.e centroids) or Polygons');
        }
        geoJson.forEach((cell, index) => {
          if (cell.type === 'Polygon') {
            const points = turfFeatureCollection(
              cell.coordinates[0].map(turfPoint),
            );
            if (cell.coordinates.length > 1) {
              console.warn('Vitessce only accepts polygons with no holes.  Only the first ring will be used');
            }
            cellsJson[String(index)] = {
              poly: cell.coordinates[0],
              xy: centroid(points).geometry.coordinates,
            };
          } else {
            cellsJson[String(index)] = {
              xy: cell.coordinates[0],
            };
          }
        });
        console.log(cellsJson);
        return cellsJson;
      }
      return Promise.reject(
        new LoaderFetchError(type, fileType, url, response.headers),
      );
    });
  }
}
