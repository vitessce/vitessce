import expect from 'expect';
import {
  expandExpressionMatrixZarr,
  expandRasterJson,
  expandRasterOmeZarr,
  expandGenesJson,
  expandCellsJson,
  expandClustersJson,
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
  describe('expandClustersJson', () => {
    it('expands clusters.json', () => {
      expect(expandClustersJson({
        fileType: 'clusters.json',
        url: 'http://localhost:8000/clusters.json',
      })).toEqual([
        {
          fileType: 'obsFeatureMatrix.clusters.json',
          url: 'http://localhost:8000/clusters.json',
          coordinationValues: {
            obsType: 'cell',
            featureType: 'gene',
          },
        },
      ]);
    });
  });
  describe('expandGenesJson', () => {
    it('expands', () => {
      expect(expandGenesJson({
        fileType: 'genes.json',
        url: 'http://localhost:8000/genes.json',
      })).toEqual([
        {
          fileType: 'obsFeatureMatrix.genes.json',
          url: 'http://localhost:8000/genes.json',
          coordinationValues: {
            obsType: 'cell',
            featureType: 'gene',
          },
        },
      ]);
    });
  });
  describe('expandCellsJson', () => {
    it('expands when there are no options', () => {
      expect(expandCellsJson({
        fileType: 'cells.json',
        url: 'http://localhost:8000/cells.json',
      })).toEqual([
        {
          fileType: 'obsLocations.cells.json',
          url: 'http://localhost:8000/cells.json',
          coordinationValues: {
            obsType: 'cell',
            featureType: 'gene',
          },
        },
        {
          fileType: 'obsSegmentations.cells.json',
          url: 'http://localhost:8000/cells.json',
          coordinationValues: {
            obsType: 'cell',
            featureType: 'gene',
          },
        },
      ]);
    });
    it('expands when there is an array of embedding types', () => {
      expect(expandCellsJson({
        fileType: 'cells.json',
        url: 'http://localhost:8000/cells.json',
        options: {
          embeddingTypes: ['UMAP', 't-SNE'],
          obsLabelsTypes: ['cluster', 'subcluster'],
        },
      })).toEqual([
        {
          fileType: 'obsLocations.cells.json',
          url: 'http://localhost:8000/cells.json',
          coordinationValues: {
            obsType: 'cell',
            featureType: 'gene',
          },
        },
        {
          fileType: 'obsSegmentations.cells.json',
          url: 'http://localhost:8000/cells.json',
          coordinationValues: {
            obsType: 'cell',
            featureType: 'gene',
          },
        },
        {
          fileType: 'obsEmbedding.cells.json',
          url: 'http://localhost:8000/cells.json',
          coordinationValues: {
            obsType: 'cell',
            featureType: 'gene',
            embeddingType: 'UMAP',
          },
        },
        {
          fileType: 'obsEmbedding.cells.json',
          url: 'http://localhost:8000/cells.json',
          coordinationValues: {
            obsType: 'cell',
            featureType: 'gene',
            embeddingType: 't-SNE',
          },
        },
        {
          fileType: 'obsLabels.cells.json',
          url: 'http://localhost:8000/cells.json',
          coordinationValues: {
            obsType: 'cell',
            featureType: 'gene',
            obsLabelsType: 'cluster',
          },
        },
        {
          fileType: 'obsLabels.cells.json',
          url: 'http://localhost:8000/cells.json',
          coordinationValues: {
            obsType: 'cell',
            featureType: 'gene',
            obsLabelsType: 'subcluster',
          },
        },
      ]);
    });
  });
});
