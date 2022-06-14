import expect from 'expect';
import {
  expandExpressionMatrixZarr,
} from './convenience-file-types';

describe('src/app/convenience-file-types.js', () => {
  describe('expandExpressionMatrixZarr', () => {
    it('expands expression-matrix.zarr', () => {
      expect(expandExpressionMatrixZarr({
        fileType: 'expression-matrix.zarr',
        url: 'http://localhost:8000/expression-matrix.zarr',
      })).toEqual([
        {
          fileType: 'obsFeatureMatrix.expression-matrix.zarr',
          url: 'http://localhost:8000/expression-matrix.zarr',
          coordinationValues: {
            obsType: 'cell',
            featureType: 'gene',
          },
        },
      ]);
    });
  });
});
