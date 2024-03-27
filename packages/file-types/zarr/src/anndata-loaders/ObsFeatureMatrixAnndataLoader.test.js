/* eslint-disable func-names, camelcase */
import { describe, it, expect } from 'vitest';
import { createStoreFromMapContents } from '@vitessce/zarr-utils';
import ObsFeatureMatrixAnndataLoader from './ObsFeatureMatrixAnndataLoader.js';
import AnnDataSource from '../AnnDataSource.js';
import MuDataSource from '../MuDataSource.js';
import anndata_0_7_CscFixture from '../json-fixtures/anndata-0.7/anndata-csc.json';
import anndata_0_7_CsrFixture from '../json-fixtures/anndata-0.7/anndata-csr.json';
import anndata_0_7_DenseFixture from '../json-fixtures/anndata-0.7/anndata-dense.json';
import anndata_0_8_CscFixture from '../json-fixtures/anndata-0.8/anndata-csc.json';
import anndata_0_8_CsrFixture from '../json-fixtures/anndata-0.8/anndata-csr.adata.json';
import anndata_0_8_DenseFixture from '../json-fixtures/anndata-0.8/anndata-dense.json';
import anndata_0_9_CscFixture from '../json-fixtures/anndata-0.9/anndata-csc.json';
import anndata_0_9_CsrFixture from '../json-fixtures/anndata-0.9/anndata-csr.adata.json';
import anndata_0_9_DenseFixture from '../json-fixtures/anndata-0.9/anndata-dense.json';
import anndata_0_10_CscFixture from '../json-fixtures/anndata-0.10/anndata-csc.json';
import anndata_0_10_CsrFixture from '../json-fixtures/anndata-0.10/anndata-csr.adata.json';
import anndata_0_10_DenseFixture from '../json-fixtures/anndata-0.10/anndata-dense.json';
import mudata_0_2_CscFixture from '../json-fixtures/mudata-0.2/mudata-csc.json';
import mudata_0_2_CsrFixture from '../json-fixtures/mudata-0.2/mudata-csr.json';
import mudata_0_2_DenseFixture from '../json-fixtures/mudata-0.2/mudata-dense.json';

const toArray = typedArr => Array.from(typedArr).map(Number);

function createAnndataLoader(url, mapContents, path = 'X') {
  const store = createStoreFromMapContents(mapContents);
  const config = {
    url,
    fileType: 'obsFeatureMatrix.anndata.zarr',
    options: { path },
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
  Object.entries({ 0.7: [anndata_0_7_DenseFixture, anndata_0_7_CsrFixture, anndata_0_7_CscFixture], 0.8: [anndata_0_8_DenseFixture, anndata_0_8_CsrFixture, anndata_0_8_CscFixture], 0.9: [anndata_0_9_DenseFixture, anndata_0_9_CsrFixture, anndata_0_9_CscFixture], '0.10': [anndata_0_10_DenseFixture, anndata_0_10_CsrFixture, anndata_0_10_CscFixture] }).forEach(([version, fixtures]) => {
    describe(`AnnData v${version}`, () => {
      const [denseFixture, csrFixture, cscFixture] = fixtures;
      const loaderCsr = createAnndataLoader(
        `@fixtures/zarr/anndata-${version}/anndata-csr${version !== '0.7' ? '.adata' : ''}.zarr`,
        csrFixture,
      );
      const loaderDense = createAnndataLoader(
        `@fixtures/zarr/anndata-${version}/anndata-dense.zarr`,
        denseFixture,
      );
      const loaderCsc = createAnndataLoader(
        `@fixtures/zarr/anndata-${version}/anndata-csc.zarr`,
        cscFixture,
      );
      it('loadFilteredGeneNames returns gene names', async () => {
        const names = await loaderDense.loadFilteredGeneNames();
        expect(names).toEqual(Array.from({ length: 15 }).map((_, i) => `gene_${i}`));
      });

      it('loadGeneSelection matches across storage methods', async () => {
        const selection = { selection: ['gene_1', 'gene_5'] };
        const csrSelection = await loaderCsr.loadGeneSelection(selection);
        const denseSelection = await loaderDense.loadGeneSelection(selection);
        const cscSelection = await loaderCsc.loadGeneSelection(selection);
        expect(cscSelection).toEqual(denseSelection);
        expect(csrSelection).toEqual(denseSelection);
      });

      it('loadCellXGene matches across storage methods', async () => {
        const csrMatrix = await loaderCsr.loadCellXGene();
        const denseMatrix = await loaderDense.loadCellXGene();
        const cscMatrix = await loaderCsc.loadCellXGene();
        expect(cscMatrix).toEqual(denseMatrix);
        expect(csrMatrix).toEqual(denseMatrix);
      });
      it('loadCellXGene matches across dtypes', async () => {
        const csrMatrix = await loaderCsr.loadCellXGene();
        const denseMatrix = await loaderDense.loadCellXGene();
        const cscMatrix = await loaderCsc.loadCellXGene();
        const getDataFromDtype = async (dtype) => {
          const loaderCsrDtype = createAnndataLoader(
            `@fixtures/zarr/anndata-${version}/anndata-csr${version !== '0.7' ? '.adata' : ''}.zarr`,
            csrFixture,
            `layers/${dtype}`,
          );
          const loaderDenseDtype = createAnndataLoader(
            `@fixtures/zarr/anndata-${version}/anndata-dense.zarr`,
            denseFixture,
            `layers/${dtype}`,
          );
          const loaderCscDtype = createAnndataLoader(
            `@fixtures/zarr/anndata-${version}/anndata-csc.zarr`,
            cscFixture,
            `layers/${dtype}`,
          );
          const csrMatrixDtype = await loaderCsrDtype.loadCellXGene();
          const denseMatrixDtype = await loaderDenseDtype.loadCellXGene();
          const cscMatrixDtype = await loaderCscDtype.loadCellXGene();
          return {
            csrMatrix: csrMatrixDtype,
            denseMatrix: denseMatrixDtype,
            cscMatrix: cscMatrixDtype,
          };
        };
        const dataInt32 = await getDataFromDtype('int32');
        const dataInt64 = await getDataFromDtype('int64');


        expect(toArray(cscMatrix)).toEqual(toArray(dataInt32.cscMatrix));
        expect(toArray(csrMatrix)).toEqual(toArray(dataInt32.csrMatrix));
        expect(toArray(denseMatrix)).toEqual(toArray(dataInt32.denseMatrix));
        expect(toArray(cscMatrix)).toEqual(toArray(dataInt64.cscMatrix));
        expect(toArray(csrMatrix)).toEqual(toArray(dataInt64.csrMatrix));
        expect(toArray(denseMatrix)).toEqual(toArray(dataInt64.denseMatrix));
      });

      it('loadCellXGeneSelection matches across dtypes', async () => {
        const selection = { selection: ['gene_1', 'gene_5'] };
        const csrMatrix = await loaderCsr.loadGeneSelection(selection);
        const denseMatrix = await loaderDense.loadGeneSelection(selection);
        const cscMatrix = await loaderCsc.loadGeneSelection(selection);
        const getDataFromDtype = async (dtype) => {
          const loaderCsrDtype = createAnndataLoader(
            `@fixtures/zarr/anndata-${version}/anndata-csr${version !== '0.7' ? '.adata' : ''}.zarr`,
            csrFixture,
            `layers/${dtype}`,
          );
          const loaderDenseDtype = createAnndataLoader(
            `@fixtures/zarr/anndata-${version}/anndata-dense.zarr`,
            denseFixture,
            `layers/${dtype}`,
          );
          const loaderCscDtype = createAnndataLoader(
            `@fixtures/zarr/anndata-${version}/anndata-csc.zarr`,
            cscFixture,
            `layers/${dtype}`,
          );
          const csrMatrixDtype = await loaderCsrDtype.loadGeneSelection(selection);
          const denseMatrixDtype = await loaderDenseDtype.loadGeneSelection(selection);
          const cscMatrixDtype = await loaderCscDtype.loadGeneSelection(selection);
          return {
            csrMatrix: csrMatrixDtype,
            denseMatrix: denseMatrixDtype,
            cscMatrix: cscMatrixDtype,
          };
        };
        const dataInt32 = await getDataFromDtype('int32');
        const dataInt64 = await getDataFromDtype('int64');


        expect(toArray(cscMatrix)).toEqual(toArray(dataInt32.cscMatrix));
        expect(toArray(csrMatrix)).toEqual(toArray(dataInt32.csrMatrix));
        expect(toArray(denseMatrix)).toEqual(toArray(dataInt32.denseMatrix));
        expect(toArray(cscMatrix)).toEqual(toArray(dataInt64.cscMatrix));
        expect(toArray(csrMatrix)).toEqual(toArray(dataInt64.csrMatrix));
        expect(toArray(denseMatrix)).toEqual(toArray(dataInt64.denseMatrix));
      });
    });
  });

  describe('MuData v0.2', () => {
    it('loadFilteredGeneNames returns gene names', async () => {
      const loader = createMudataLoader(
        '@fixtures/zarr/mudata-0.2/mudata-dense.zarr',
        mudata_0_2_DenseFixture,
      );
      const names = await loader.loadFilteredGeneNames();
      expect(names).toEqual(Array.from({ length: 15 }).map((_, i) => `gene_${i}`));
    });

    it('loadGeneSelection matches across storage methods', async () => {
      const selection = { selection: ['gene_1', 'gene_5'] };
      const loaderCsr = createMudataLoader(
        '@fixtures/zarr/mudata-0.2/mudata-csr.zarr',
        mudata_0_2_CsrFixture,
      );
      const csrSelection = await loaderCsr.loadGeneSelection(selection);
      const loaderDense = createMudataLoader(
        '@fixtures/zarr/mudata-0.2/mudata-dense.zarr',
        mudata_0_2_DenseFixture,
      );
      const denseSelection = await loaderDense.loadGeneSelection(selection);
      const loaderCsc = createMudataLoader(
        '@fixtures/zarr/mudata-0.2/mudata-csc.zarr',
        mudata_0_2_CscFixture,
      );
      const cscSelection = await loaderCsc.loadGeneSelection(selection);
      expect(cscSelection).toEqual(denseSelection);
      expect(csrSelection).toEqual(denseSelection);
    });

    it('loadCellXGene matches across storage methods', async () => {
      const loaderCsr = createMudataLoader(
        '@fixtures/zarr/mudata-0.2/mudata-csr.zarr',
        mudata_0_2_CsrFixture,
      );
      const csrMatrix = await loaderCsr.loadCellXGene();
      const loaderDense = createMudataLoader(
        '@fixtures/zarr/mudata-0.2/mudata-dense.zarr',
        mudata_0_2_DenseFixture,
      );
      const denseMatrix = await loaderDense.loadCellXGene();
      const loaderCsc = createMudataLoader(
        '@fixtures/zarr/mudata-0.2/mudata-csc.zarr',
        mudata_0_2_CscFixture,
      );
      const cscMatrix = await loaderCsc.loadCellXGene();
      expect(cscMatrix).toEqual(denseMatrix);
      expect(csrMatrix).toEqual(denseMatrix);
    });
  });
});
