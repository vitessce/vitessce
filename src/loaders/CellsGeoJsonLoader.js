import centroid from '@turf/centroid';
import { featureCollection as turfFeatureCollection, point as turfPoint } from '@turf/helpers';
import AbstractTwoStepLoader from './AbstractTwoStepLoader';
import { AbstractLoaderError, LoaderValidationError } from './errors/index';
import LoaderResult from './LoaderResult';

export default class CellsGeoJsonLoader extends AbstractTwoStepLoader {
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

        if (!(geoJson && geoJson.type && geoJson.geometries && geoJson.type === 'GeometryCollection' && Array.isArray(geoJson.geometries))) {
          return this.rejectGeoJson('Vitessce only accepts GeoJSON that is a GeometryCollection.');
        }

        const geoJsonGeometries = geoJson.geometries;
        if (!geoJsonGeometries.every(cell => cell && cell.type && cell.type === 'Polygon')) {
          return this.rejectGeoJson('Vitessce only accepts GeoJSON that is a GeometryCollection of Polygons.');
        }

        const cellsJson = {};
        geoJsonGeometries.forEach((cell, index) => {
          const points = turfFeatureCollection(
            cell.coordinates[0].map(turfPoint),
          );
          if (cell.coordinates.length > 1) {
            console.warn('Vitessce only accepts polygons with no holes.  Only the first ring will be used.');
          }
          cellsJson[String(index)] = {
            poly: cell.coordinates[0],
            xy: centroid(points).geometry.coordinates,
          };
        });
        return Promise.resolve(new LoaderResult(cellsJson, url));
      });
    return this.data;
  }
}
