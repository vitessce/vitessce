import centroid from '@turf/centroid';
import { featureCollection as turfFeatureCollection, point as turfPoint } from '@turf/helpers';

import cells from '../schemas/cells.schema.json';
import JsonLoader from './JsonLoader';
import { LoaderFetchError, LoaderValidationError } from './errors/index';

export default class GeoJsonJsonLoader extends JsonLoader {
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
        if (!(geoJson.every(cell => cell.geometry.type === 'Polygon')
          || geoJson.every(cell => cell.geometry.type === 'Point'))) {
          this.rejectGeoJson('Vitessce only accepts GeoJSON that is excusively Points (i.e centroids) or Polygons');
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
        return cellsJson;
      }
      return Promise.reject(
        new LoaderFetchError(type, fileType, url, response.headers),
      );
    });
  }
}
