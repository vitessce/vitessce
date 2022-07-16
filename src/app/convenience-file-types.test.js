import expect from 'expect';
import {
  expandExpressionMatrixZarr,
  expandRasterJson,
  expandRasterOmeZarr,
  expandGenesJson,
  expandCellsJson,
  expandAnndataZarr,
  expandAnndataCellsZarr,
  expandAnndataCellSetsZarr,
  expandAnndataExpressionMatrixZarr,
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
  // cells
  describe('expandAnndataCellsZarr', () => {
    it('expands when there are no options', () => {
      expect(expandAnndataCellsZarr({
        fileType: 'anndata-cells.zarr',
        url: 'http://localhost:8000/anndata.zarr',
      })).toEqual([]);
    });
    it('expands when there are lots of options', () => {
      expect(expandAnndataCellsZarr({
        fileType: 'anndata-cells.zarr',
        url: 'http://localhost:8000/anndata.zarr',
        options: {
          mappings: {
            't-SNE': {
              key: 'obsm/tsne',
            },
            PCA: {
              dims: [2, 3],
              key: 'obsm/pca',
            },
          },
          xy: 'obsm/locations',
          poly: 'obsm/segmentations',
          factors: [
            'obs/cluster',
            'obs/subcluster',
          ],
        },
      })).toEqual([
        {
          fileType: 'obsLocations.anndata.zarr',
          url: 'http://localhost:8000/anndata.zarr',
          options: {
            path: 'obsm/locations',
          },
          coordinationValues: {
            obsType: 'cell',
            featureType: 'gene',
          },
        },
        {
          fileType: 'obsSegmentations.anndata.zarr',
          url: 'http://localhost:8000/anndata.zarr',
          options: {
            polygonsPath: 'obsm/segmentations',
            centroidsPath: 'obsm/locations',
          },
          coordinationValues: {
            obsType: 'cell',
            featureType: 'gene',
          },
        },
        {
          fileType: 'obsEmbedding.anndata.zarr',
          url: 'http://localhost:8000/anndata.zarr',
          options: {
            path: 'obsm/tsne',
          },
          coordinationValues: {
            obsType: 'cell',
            featureType: 'gene',
            embeddingType: 't-SNE',
          },
        },
        {
          fileType: 'obsEmbedding.anndata.zarr',
          url: 'http://localhost:8000/anndata.zarr',
          options: {
            path: 'obsm/pca',
            dims: [2, 3],
          },
          coordinationValues: {
            obsType: 'cell',
            featureType: 'gene',
            embeddingType: 'PCA',
          },
        },
        {
          fileType: 'obsLabels.anndata.zarr',
          url: 'http://localhost:8000/anndata.zarr',
          options: {
            path: 'obs/cluster',
          },
          coordinationValues: {
            obsType: 'cell',
            featureType: 'gene',
            obsLabelsType: 'cluster',
          },
        },
        {
          fileType: 'obsLabels.anndata.zarr',
          url: 'http://localhost:8000/anndata.zarr',
          options: {
            path: 'obs/subcluster',
          },
          coordinationValues: {
            obsType: 'cell',
            featureType: 'gene',
            obsLabelsType: 'subcluster',
          },
        },
      ]);
    });
  });
  // cell sets
  describe('expandAnndataCellSetsZarr', () => {
    it('expands both flat and hierarchical cell sets', () => {
      expect(expandAnndataCellSetsZarr({
        fileType: 'anndata-cell-sets.zarr',
        url: 'http://localhost:8000/anndata.zarr',
        options: [
          {
            groupName: 'Leiden clustering',
            setName: 'obs/leiden',
          },
          {
            groupName: 'Predicted cell types',
            setName: 'obs/pred_types',
            scoreName: 'obs/pred_scores',
          },
          {
            groupName: 'Cell type annotations',
            setName: ['obs/l1', 'obs/l2', 'obs/l3'],
          },
        ],
      })).toEqual([
        {
          fileType: 'obsSets.anndata.zarr',
          url: 'http://localhost:8000/anndata.zarr',
          options: [
            {
              name: 'Leiden clustering',
              path: 'obs/leiden',
            },
            {
              name: 'Predicted cell types',
              path: 'obs/pred_types',
              scorePath: 'obs/pred_scores',
            },
            {
              name: 'Cell type annotations',
              path: ['obs/l1', 'obs/l2', 'obs/l3'],
            },
          ],
          coordinationValues: {
            obsType: 'cell',
            featureType: 'gene',
          },
        },
      ]);
    });
    // expression-matrix
    describe('expandAnndataExpressionMatrixZarr', () => {
      it('expands when there are no options', () => {
        expect(expandAnndataExpressionMatrixZarr({
          fileType: 'anndata-expression-matrix.zarr',
          url: 'http://localhost:8000/anndata.zarr',
          options: {
            matrix: 'X',
          },
        })).toEqual([
          {
            fileType: 'obsFeatureMatrix.anndata.zarr',
            url: 'http://localhost:8000/anndata.zarr',
            options: {
              path: 'X',
            },
            coordinationValues: {
              obsType: 'cell',
              featureType: 'gene',
            },
          },
        ]);
      });
      it('expands when there are lots of options', () => {
        expect(expandAnndataExpressionMatrixZarr({
          fileType: 'anndata-expression-matrix.zarr',
          url: 'http://localhost:8000/anndata.zarr',
          options: {
            matrix: 'obsm/hvg_subset',
            geneAlias: 'var/gene_symbol',
            geneFilter: 'var/in_hvg_subset',
            matrixGeneFilter: 'var/highly_variable',
          },
        })).toEqual([
          {
            fileType: 'featureLabels.anndata.zarr',
            url: 'http://localhost:8000/anndata.zarr',
            options: {
              path: 'var/gene_symbol',
            },
            coordinationValues: {
              obsType: 'cell',
              featureType: 'gene',
              featureLabelsType: 'geneAlias',
            },
          },
          {
            fileType: 'obsFeatureMatrix.anndata.zarr',
            url: 'http://localhost:8000/anndata.zarr',
            options: {
              path: 'X',
              featureFilterPath: 'var/in_hvg_subset',
              initialFeatureFilterPath: 'var/highly_variable',
            },
            coordinationValues: {
              obsType: 'cell',
              featureType: 'gene',
            },
          },
        ]);
      });
    });
  });
  // cells
  describe('expandAnndataZarr', () => {
    it('expands to empty array when there are no options', () => {
      expect(expandAnndataZarr({
        fileType: 'anndata.zarr',
        url: 'http://localhost:8000/anndata.zarr',
      })).toEqual([]);
    });
    it('expands when there is an obsEmbedding object', () => {
      expect(expandAnndataZarr({
        fileType: 'anndata.zarr',
        url: 'http://localhost:8000/anndata.zarr',
        options: {
          obsLabels: {
            path: 'obs/spot_name',
          },
          featureLabels: {
            path: 'var/gene_symbol',
          },
          obsEmbedding: {
            path: 'obsm/pca',
            dims: [2, 4],
          },
        },
        coordinationValues: {
          obsType: 'spot',
          featureType: 'transcript',
          obsLabelsType: 'spotName',
          featureLabelsType: 'geneSymbol',
          embeddingType: 'PCA',
        },
      })).toEqual([
        {
          fileType: 'obsLabels.anndata.zarr',
          url: 'http://localhost:8000/anndata.zarr',
          options: {
            path: 'obs/spot_name',
          },
          coordinationValues: {
            obsType: 'spot',
            featureType: 'transcript',
            obsLabelsType: 'spotName',
            featureLabelsType: 'geneSymbol',
            embeddingType: 'PCA',
          },
        },
        {
          fileType: 'featureLabels.anndata.zarr',
          url: 'http://localhost:8000/anndata.zarr',
          options: {
            path: 'var/gene_symbol',
          },
          coordinationValues: {
            obsType: 'spot',
            featureType: 'transcript',
            obsLabelsType: 'spotName',
            featureLabelsType: 'geneSymbol',
            embeddingType: 'PCA',
          },
        },
        {
          fileType: 'obsEmbedding.anndata.zarr',
          url: 'http://localhost:8000/anndata.zarr',
          options: {
            path: 'obsm/pca',
            dims: [2, 4],
          },
          coordinationValues: {
            obsType: 'spot',
            featureType: 'transcript',
            embeddingType: 'PCA',
          },
        },
      ]);
    });
    it('expands when there is an obsEmbedding array of objects', () => {
      expect(expandAnndataZarr({
        fileType: 'anndata.zarr',
        url: 'http://localhost:8000/anndata.zarr',
        options: {
          obsLocations: {
            path: 'obsm/xy',
          },
          obsEmbedding: [
            {
              path: 'obsm/pca',
              dims: [2, 4],
              embeddingType: 'PCA',
            },
            {
              path: 'obsm/umap',
              embeddingType: 'UMAP',
            },
          ],
        },
      })).toEqual([
        {
          fileType: 'obsLocations.anndata.zarr',
          url: 'http://localhost:8000/anndata.zarr',
          options: {
            path: 'obsm/xy',
          },
          coordinationValues: {
            obsType: 'cell',
            featureType: 'gene',
          },
        },
        {
          fileType: 'obsEmbedding.anndata.zarr',
          url: 'http://localhost:8000/anndata.zarr',
          options: {
            path: 'obsm/pca',
            dims: [2, 4],
          },
          coordinationValues: {
            obsType: 'cell',
            featureType: 'gene',
            embeddingType: 'PCA',
          },
        },
        {
          fileType: 'obsEmbedding.anndata.zarr',
          url: 'http://localhost:8000/anndata.zarr',
          options: {
            path: 'obsm/umap',
          },
          coordinationValues: {
            obsType: 'cell',
            featureType: 'gene',
            embeddingType: 'UMAP',
          },
        },
      ]);
    });
  });
});
