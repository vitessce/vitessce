import { expandAnndataZarr } from './joint-file-types';

describe('src/app/file-options-schemas.js', () => {
  describe('Options validation for joint file type expansion functions', () => {
    it('anndata.zarr with invalid options fails validation', () => {
      expect(() => expandAnndataZarr({
        fileType: 'anndata.zarr',
        url: 'http://localhost:8000/anndata.zarr',
        options: {
          obsFeatureMatrix: 1,
        },
      })).toThrow();
    });
    it('anndata.zarr with extra options fails validation', () => {
      expect(() => expandAnndataZarr({
        fileType: 'anndata.zarr',
        url: 'http://localhost:8000/anndata.zarr',
        options: {
          bad: 'bad',
        },
      })).toThrow();
    });
  });
});
