/* eslint-disable func-names */
import { describe, it, expect } from 'vitest';
import ObsFeatureMatrixAnndataLoader from './ObsFeatureMatrixAnndataLoader.js';
import AnnDataSource from '../AnnDataSource.js';
import MuDataSource from '../MuDataSource.js';


const createAnndataLoader = (url) => {
  const config = {
    url,
    fileType: 'obsFeatureMatrix.anndata.zarr',
    options: {
      path: 'X',
    },
  };
  const source = new AnnDataSource(config);
  return new ObsFeatureMatrixAnndataLoader(source, config);
};

const createMudataLoader = (url) => {
  const config = {
    url,
    fileType: 'obsFeatureMatrix.mudata.zarr',
    options: {
      path: 'mod/rna/X',
    },
  };
  const source = new MuDataSource(config);
  return new ObsFeatureMatrixAnndataLoader(source, config);
};

describe('loaders/ObsFeatureMatrixAnndataLoader', () => {
  describe('AnnData v0.7', () => {
    it('loadFilteredGeneNames returns gene names', async () => {
      const loader = createAnndataLoader('http://localhost:51204/@fixtures/zarr/anndata-0.7/anndata-dense.zarr');
      const names = await loader.loadFilteredGeneNames();
      expect(names).toEqual(Array.from({ length: 15 }).map((_, i) => `gene_${i}`));
    });

    it('loadGeneSelection matches across storage methods', async () => {
      const selection = { selection: ['gene_1', 'gene_5'] };
      const loaderCsr = createAnndataLoader('http://localhost:51204/@fixtures/zarr/anndata-0.7/anndata-csr.zarr');
      const csrSelection = await loaderCsr.loadGeneSelection(selection);
      const loaderDense = createAnndataLoader('http://localhost:51204/@fixtures/zarr/anndata-0.7/anndata-dense.zarr');
      const denseSelection = await loaderDense.loadGeneSelection(selection);
      const loaderCsc = createAnndataLoader('http://localhost:51204/@fixtures/zarr/anndata-0.7/anndata-csc.zarr');
      const cscSelection = await loaderCsc.loadGeneSelection(selection);
      expect(cscSelection).toEqual(denseSelection);
      expect(csrSelection).toEqual(denseSelection);
    });

    it('loadCellXGene matches across storage methods', async () => {
      const loaderCsr = createAnndataLoader('http://localhost:51204/@fixtures/zarr/anndata-0.7/anndata-csr.zarr');
      const csrMatrix = await loaderCsr.loadCellXGene();
      const loaderDense = createAnndataLoader('http://localhost:51204/@fixtures/zarr/anndata-0.7/anndata-dense.zarr');
      const denseMatrix = await loaderDense.loadCellXGene();
      const loaderCsc = createAnndataLoader('http://localhost:51204/@fixtures/zarr/anndata-0.7/anndata-csc.zarr');
      const cscMatrix = await loaderCsc.loadCellXGene();
      expect(cscMatrix).toEqual(denseMatrix);
      expect(csrMatrix).toEqual(denseMatrix);
    });
  });

  describe('AnnData v0.8', () => {
    it('loadFilteredGeneNames returns gene names', async () => {
      const loader = createAnndataLoader('http://localhost:51204/@fixtures/zarr/anndata-0.8/anndata-dense.zarr');
      const names = await loader.loadFilteredGeneNames();
      expect(names).toEqual(Array.from({ length: 15 }).map((_, i) => `gene_${i}`));
    });

    it('loadGeneSelection matches across storage methods', async () => {
      const selection = { selection: ['gene_1', 'gene_5'] };
      const loaderCsr = createAnndataLoader('http://localhost:51204/@fixtures/zarr/anndata-0.8/anndata-csr.adata.zarr');
      const csrSelection = await loaderCsr.loadGeneSelection(selection);
      const loaderDense = createAnndataLoader('http://localhost:51204/@fixtures/zarr/anndata-0.8/anndata-dense.zarr');
      const denseSelection = await loaderDense.loadGeneSelection(selection);
      const loaderCsc = createAnndataLoader('http://localhost:51204/@fixtures/zarr/anndata-0.8/anndata-csc.zarr');
      const cscSelection = await loaderCsc.loadGeneSelection(selection);
      expect(cscSelection).toEqual(denseSelection);
      expect(csrSelection).toEqual(denseSelection);
    });

    it('loadCellXGene matches across storage methods', async () => {
      const loaderCsr = createAnndataLoader('http://localhost:51204/@fixtures/zarr/anndata-0.8/anndata-csr.adata.zarr');
      const csrMatrix = await loaderCsr.loadCellXGene();
      const loaderDense = createAnndataLoader('http://localhost:51204/@fixtures/zarr/anndata-0.8/anndata-dense.zarr');
      const denseMatrix = await loaderDense.loadCellXGene();
      const loaderCsc = createAnndataLoader('http://localhost:51204/@fixtures/zarr/anndata-0.8/anndata-csc.zarr');
      const cscMatrix = await loaderCsc.loadCellXGene();
      expect(cscMatrix).toEqual(denseMatrix);
      expect(csrMatrix).toEqual(denseMatrix);
    });
  });

  describe('MuData v0.2', () => {
    it('loadFilteredGeneNames returns gene names', async () => {
      const loader = createMudataLoader('http://localhost:51204/@fixtures/zarr/mudata-0.2/mudata-dense.zarr');
      const names = await loader.loadFilteredGeneNames();
      expect(names).toEqual(Array.from({ length: 15 }).map((_, i) => `gene_${i}`));
    });

    it('loadGeneSelection matches across storage methods', async () => {
      const selection = { selection: ['gene_1', 'gene_5'] };
      const loaderCsr = createMudataLoader('http://localhost:51204/@fixtures/zarr/mudata-0.2/mudata-csr.zarr');
      const csrSelection = await loaderCsr.loadGeneSelection(selection);
      const loaderDense = createMudataLoader('http://localhost:51204/@fixtures/zarr/mudata-0.2/mudata-dense.zarr');
      const denseSelection = await loaderDense.loadGeneSelection(selection);
      const loaderCsc = createMudataLoader('http://localhost:51204/@fixtures/zarr/mudata-0.2/mudata-csc.zarr');
      const cscSelection = await loaderCsc.loadGeneSelection(selection);
      expect(cscSelection).toEqual(denseSelection);
      expect(csrSelection).toEqual(denseSelection);
    });

    it('loadCellXGene matches across storage methods', async () => {
      const loaderCsr = createMudataLoader('http://localhost:51204/@fixtures/zarr/mudata-0.2/mudata-csr.zarr');
      const csrMatrix = await loaderCsr.loadCellXGene();
      const loaderDense = createMudataLoader('http://localhost:51204/@fixtures/zarr/mudata-0.2/mudata-dense.zarr');
      const denseMatrix = await loaderDense.loadCellXGene();
      const loaderCsc = createMudataLoader('http://localhost:51204/@fixtures/zarr/mudata-0.2/mudata-csc.zarr');
      const cscMatrix = await loaderCsc.loadCellXGene();
      expect(cscMatrix).toEqual(denseMatrix);
      expect(csrMatrix).toEqual(denseMatrix);
    });
  });
});
