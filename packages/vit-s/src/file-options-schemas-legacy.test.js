import {
  expandExpressionMatrixZarr,
  expandRasterOmeZarr,
  expandGenesJson,
  expandCellsJson,
  expandCellSetsJson,
  expandMoleculesJson,
  expandAnndataCellsZarr,
  expandAnndataCellSetsZarr,
  expandAnndataExpressionMatrixZarr,
  expandClustersJson,
} from './joint-file-types-legacy';

describe('src/app/file-options-schemas-legacy.js', () => {
  describe('Options validation for joint file type expansion functions', () => {
    it('cells.json with extra options fails validation', () => {
      expect(() => expandCellsJson({
        fileType: 'cells.json',
        url: 'http://localhost:8000/cells.json',
        options: {
          badKey: 'test',
          embeddingTypes: ['UMAP', 't-SNE'],
          obsLabelsTypes: ['cluster', 'subcluster'],
        },
      })).toThrow();
    });
    it('molecules.json with any options fails validation', () => {
      expect(() => expandMoleculesJson({
        fileType: 'molecules.json',
        url: 'http://localhost:8000/molecules.json',
        options: {},
      })).toThrow();
    });
    it('expression-matrix.zarr with any options fails validation', () => {
      expect(() => expandExpressionMatrixZarr({
        fileType: 'expression-matrix.zarr',
        url: 'http://localhost:8000/expression-matrix.zarr',
        options: {},
      })).toThrow();
    });
    it('raster.ome-zarr with any options fails validation', () => {
      expect(() => expandRasterOmeZarr({
        fileType: 'raster.ome-zarr',
        url: 'http://localhost:8000/raster.ome-zarr',
        options: {},
      })).toThrow();
    });
    it('cell-sets.json with any options fails validation', () => {
      expect(() => expandCellSetsJson({
        fileType: 'cell-sets.json',
        url: 'http://localhost:8000/cell-sets.json',
        options: {},
      })).toThrow();
    });
    it('clusters.json with any options fails validation', () => {
      expect(() => expandClustersJson({
        fileType: 'clusters.json',
        url: 'http://localhost:8000/clusters.json',
        options: {},
      })).toThrow();
    });
    it('genes.json with any options fails validation', () => {
      expect(() => expandGenesJson({
        fileType: 'genes.json',
        url: 'http://localhost:8000/genes.json',
        options: {},
      })).toThrow();
    });
    it('anndata-cells.zarr with extra options fails validation', () => {
      expect(() => expandAnndataCellsZarr({
        fileType: 'anndata-cells.zarr',
        url: 'http://localhost:8000/anndata-cells.zarr',
        options: {
          poly: 'obsm/poly',
          xy: 'obsm/xy',
          bad: 'bad',
        },
      })).toThrow();
    });
    it('anndata-cells.zarr with invalid options fails validation', () => {
      expect(() => expandAnndataCellsZarr({
        fileType: 'anndata-cells.zarr',
        url: 'http://localhost:8000/anndata-cells.zarr',
        options: {
          poly: 'obsm/poly',
          xy: 'obsm/xy',
          mappings: {
            UMAP: ['bad'],
          },
        },
      })).toThrow();
    });
    it('anndata-cell-sets.zarr with invalid options fails validation', () => {
      expect(() => expandAnndataCellSetsZarr({
        fileType: 'anndata-cell-sets.zarr',
        url: 'http://localhost:8000/anndata-cell-sets.zarr',
        options: {},
      })).toThrow();
    });
    it('anndata-cell-sets.zarr with extra options fails validation', () => {
      expect(() => expandAnndataCellSetsZarr({
        fileType: 'anndata-cell-sets.zarr',
        url: 'http://localhost:8000/anndata-cell-sets.zarr',
        options: [
          {
            groupName: 'Cell Type Annotations',
            setName: 'obs/cell_type',
            scoreName: 'obs/score',
            bad: 'bad',
          },
        ],
      })).toThrow();
    });
    it('anndata-expression-matrix.zarr with invalid options fails validation', () => {
      expect(() => expandAnndataExpressionMatrixZarr({
        fileType: 'anndata-expression-matrix.zarr',
        url: 'http://localhost:8000/anndata-expression-matrix.zarr',
        options: {
          matrix: 'good',
          geneAlias: 1,
        },
      })).toThrow();
    });
    it('anndata-expression-matrix.zarr with extra options fails validation', () => {
      expect(() => expandAnndataExpressionMatrixZarr({
        fileType: 'anndata-expression-matrix.zarr',
        url: 'http://localhost:8000/anndata-expression-matrix.zarr',
        options: {
          matrix: 'good',
          geneAlias: 'good',
          geneFilter: 'good',
          matrixGeneFilter: 'good',
          bad: 'bad',
        },
      })).toThrow();
    });
  });
});
