/* eslint-disable func-names */
import { describe, it, expect } from 'vitest';
import { createStoreFromMapContents } from '@vitessce/zarr-utils';
import ObsFeatureMatrixAnndataLoader from './ObsFeatureMatrixAnndataLoader.js';
import AnnDataSource from '../AnnDataSource.js';
import MuDataSource from '../MuDataSource.js';
import { default as anndata_0_7_CscFixture } from '../json-fixtures/anndata-0.7/anndata-csc.json';
import { default as anndata_0_7_CsrFixture } from '../json-fixtures/anndata-0.7/anndata-csr.json';
import { default as anndata_0_7_DenseFixture } from '../json-fixtures/anndata-0.7/anndata-dense.json';
import { default as anndata_0_8_CscFixture } from '../json-fixtures/anndata-0.8/anndata-csc.json';
import { default as anndata_0_8_CsrFixture } from '../json-fixtures/anndata-0.8/anndata-csr.adata.json';
import { default as anndata_0_8_DenseFixture } from '../json-fixtures/anndata-0.8/anndata-dense.json';
import { default as mudata_0_2_CscFixture } from '../json-fixtures/mudata-0.2/mudata-csc.json';
import { default as mudata_0_2_CsrFixture } from '../json-fixtures/mudata-0.2/mudata-csr.json';
import { default as mudata_0_2_DenseFixture } from '../json-fixtures/mudata-0.2/mudata-dense.json';


function createAnndataLoader(url, mapContents) {
  const store = createStoreFromMapContents(mapContents);
  const config = {
    url,
    fileType: 'obsFeatureMatrix.anndata.zarr',
    options: {
      path: 'X',
    },
  };
  const source = new AnnDataSource({ ...config, store });
  return new ObsFeatureMatrixAnndataLoader(source, config);
}

const createMudataLoader = (url, mapContents) => {
  const store = createStoreFromMapContents(mapContents);
  const config = {
    url,
    fileType: 'obsFeatureMatrix.mudata.zarr',
    options: {
      path: 'mod/rna/X',
    },
  };
  const source = new MuDataSource({ ...config, store });
  return new ObsFeatureMatrixAnndataLoader(source, config);
};

describe('loaders/ObsFeatureMatrixAnndataLoader', () => {
  describe('AnnData v0.7', () => {
    it('loadFilteredGeneNames returns gene names', async () => {
      const loader = createAnndataLoader('@fixtures/zarr/anndata-0.7/anndata-dense.zarr', anndata_0_7_DenseFixture);
      const names = await loader.loadFilteredGeneNames();
      expect(names).toEqual(Array.from({ length: 15 }).map((_, i) => `gene_${i}`));
    });

    it('loadGeneSelection matches across storage methods', async () => {
      const selection = { selection: ['gene_1', 'gene_5'] };
      const loaderCsr = createAnndataLoader('@fixtures/zarr/anndata-0.7/anndata-csr.zarr', anndata_0_7_CsrFixture);
      const csrSelection = await loaderCsr.loadGeneSelection(selection);
      const loaderDense = createAnndataLoader('@fixtures/zarr/anndata-0.7/anndata-dense.zarr', anndata_0_7_DenseFixture);
      const denseSelection = await loaderDense.loadGeneSelection(selection);
      const loaderCsc = createAnndataLoader('@fixtures/zarr/anndata-0.7/anndata-csc.zarr', anndata_0_7_CscFixture);
      const cscSelection = await loaderCsc.loadGeneSelection(selection);
      expect(cscSelection).toEqual(denseSelection);
      expect(csrSelection).toEqual(denseSelection);
    });

    it('loadCellXGene matches across storage methods', async () => {
      const loaderCsr = createAnndataLoader('@fixtures/zarr/anndata-0.7/anndata-csr.zarr', anndata_0_7_CsrFixture);
      const csrMatrix = await loaderCsr.loadCellXGene();
      const loaderDense = createAnndataLoader('@fixtures/zarr/anndata-0.7/anndata-dense.zarr', anndata_0_7_DenseFixture);
      const denseMatrix = await loaderDense.loadCellXGene();
      const loaderCsc = createAnndataLoader('@fixtures/zarr/anndata-0.7/anndata-csc.zarr', anndata_0_7_CscFixture);
      const cscMatrix = await loaderCsc.loadCellXGene();
      expect(cscMatrix).toEqual(denseMatrix);
      expect(csrMatrix).toEqual(denseMatrix);
    });
  });

  describe('AnnData v0.8', () => {
    it('loadFilteredGeneNames returns gene names', async () => {
      const loader = createAnndataLoader('@fixtures/zarr/anndata-0.8/anndata-dense.zarr', anndata_0_8_DenseFixture);
      const names = await loader.loadFilteredGeneNames();
      expect(names).toEqual(Array.from({ length: 15 }).map((_, i) => `gene_${i}`));
    });

    it('loadGeneSelection matches across storage methods', async () => {
      const selection = { selection: ['gene_1', 'gene_5'] };
      const loaderCsr = createAnndataLoader('@fixtures/zarr/anndata-0.8/anndata-csr.adata.zarr', anndata_0_8_CsrFixture);
      const csrSelection = await loaderCsr.loadGeneSelection(selection);
      const loaderDense = createAnndataLoader('@fixtures/zarr/anndata-0.8/anndata-dense.zarr', anndata_0_8_DenseFixture);
      const denseSelection = await loaderDense.loadGeneSelection(selection);
      const loaderCsc = createAnndataLoader('@fixtures/zarr/anndata-0.8/anndata-csc.zarr', anndata_0_8_CscFixture);
      const cscSelection = await loaderCsc.loadGeneSelection(selection);
      expect(cscSelection).toEqual(denseSelection);
      expect(csrSelection).toEqual(denseSelection);
    });

    it('loadCellXGene matches across storage methods', async () => {
      const loaderCsr = createAnndataLoader('@fixtures/zarr/anndata-0.8/anndata-csr.adata.zarr', anndata_0_8_CsrFixture);
      const csrMatrix = await loaderCsr.loadCellXGene();
      const loaderDense = createAnndataLoader('@fixtures/zarr/anndata-0.8/anndata-dense.zarr', anndata_0_8_DenseFixture);
      const denseMatrix = await loaderDense.loadCellXGene();
      const loaderCsc = createAnndataLoader('@fixtures/zarr/anndata-0.8/anndata-csc.zarr', anndata_0_8_CscFixture);
      const cscMatrix = await loaderCsc.loadCellXGene();
      expect(cscMatrix).toEqual(denseMatrix);
      expect(csrMatrix).toEqual(denseMatrix);
    });
  });

  describe('MuData v0.2', () => {
    it('loadFilteredGeneNames returns gene names', async () => {
      const loader = createMudataLoader('@fixtures/zarr/mudata-0.2/mudata-dense.zarr', mudata_0_2_DenseFixture);
      const names = await loader.loadFilteredGeneNames();
      expect(names).toEqual(Array.from({ length: 15 }).map((_, i) => `gene_${i}`));
    });

    it('loadGeneSelection matches across storage methods', async () => {
      const selection = { selection: ['gene_1', 'gene_5'] };
      const loaderCsr = createMudataLoader('@fixtures/zarr/mudata-0.2/mudata-csr.zarr', mudata_0_2_CsrFixture);
      const csrSelection = await loaderCsr.loadGeneSelection(selection);
      const loaderDense = createMudataLoader('@fixtures/zarr/mudata-0.2/mudata-dense.zarr', mudata_0_2_DenseFixture);
      const denseSelection = await loaderDense.loadGeneSelection(selection);
      const loaderCsc = createMudataLoader('@fixtures/zarr/mudata-0.2/mudata-csc.zarr', mudata_0_2_CscFixture);
      const cscSelection = await loaderCsc.loadGeneSelection(selection);
      expect(cscSelection).toEqual(denseSelection);
      expect(csrSelection).toEqual(denseSelection);
    });

    it('loadCellXGene matches across storage methods', async () => {
      const loaderCsr = createMudataLoader('@fixtures/zarr/mudata-0.2/mudata-csr.zarr', mudata_0_2_CsrFixture);
      const csrMatrix = await loaderCsr.loadCellXGene();
      const loaderDense = createMudataLoader('@fixtures/zarr/mudata-0.2/mudata-dense.zarr', mudata_0_2_DenseFixture);
      const denseMatrix = await loaderDense.loadCellXGene();
      const loaderCsc = createMudataLoader('@fixtures/zarr/mudata-0.2/mudata-csc.zarr', mudata_0_2_CscFixture);
      const cscMatrix = await loaderCsc.loadCellXGene();
      expect(cscMatrix).toEqual(denseMatrix);
      expect(csrMatrix).toEqual(denseMatrix);
    });
  });
});
