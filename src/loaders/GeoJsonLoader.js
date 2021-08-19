/* eslint-disable */
import centroid from '@turf/centroid';
import { featureCollection as turfFeatureCollection, point as turfPoint } from '@turf/helpers';
import AbstractTwoStepLoader from './AbstractTwoStepLoader';
import { AbstractLoaderError, LoaderValidationError } from './errors/index';
import LoaderResult from './LoaderResult';

export default class GeoJsonLoader extends AbstractTwoStepLoader {
  constructor(dataSource, params) {
    super(dataSource, params);
  }

  rejectGeoJson(reason) {
    const { url, type, fileType } = this;
    return Promise.reject(new LoaderValidationError(type, fileType, url, reason));
  }

  async load() {
    const { url } = this;
    if (this.data) {
      return this.data;
    }
    this.data = this.dataSource.data
      .then((geoJson) => {
        if (geoJson instanceof AbstractLoaderError) {
          return Promise.reject(geoJson);
        }
        
        const cellsJson = {};
        if (!(geoJson.every(cell => cell.type === 'Polygon')
          || geoJson.every(cell => cell.type === 'Point'))) {
          return this.rejectGeoJson('Vitessce only accepts GeoJSON that is excusively Points (i.e centroids) or Polygons');
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

        return Promise.resolve(new LoaderResult(cellsJson, url));
      });
    return this.data;
  }
}
