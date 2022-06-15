/* eslint-disable */
import expect from 'expect';
import {
  expandRasterJson,
  expandRasterOmeZarr,
} from './convenience-file-types';

describe('src/app/convenience-file-types.js', () => {
  describe('expandRasterJson', () => {
    it('expands raster.json', () => {
      expect(expandRasterJson({
        fileType: 'raster.json',
        url: 'http://localhost:8000/raster.json',
      })).toEqual([
        {
          fileType: 'image.raster.json',
          url: 'http://localhost:8000/raster.json',
        },
        {
          fileType: 'obsSegmentations.raster.json',
          url: 'http://localhost:8000/raster.json',
        },
      ]);
    });
  });
  describe('expandRasterOmeZarr', () => {
    it('expands raster.ome-zarr', () => {
      expect(expandRasterOmeZarr({
        fileType: 'raster.ome-zarr',
        url: 'http://localhost:8000/raster.zarr',
      })).toEqual([
        {
          fileType: 'image.ome-zarr',
          url: 'http://localhost:8000/raster.zarr',
        },
      ]);
    });
  });
});
