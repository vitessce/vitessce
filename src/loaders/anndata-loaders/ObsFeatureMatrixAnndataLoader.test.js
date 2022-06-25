import expect from 'expect';
import ObsFeatureMatrixAnndataLoader from './ObsFeatureMatrixAnndataLoader';
import { AnnDataSource } from '../data-sources';

const createMatrixLoader = (url) => {
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

describe('loaders/ObsFeatureMatrixAnndataLoader', () => {
  it('loadFilteredGeneNames returns gene names', async () => {
    const loader = createMatrixLoader(
      'http://127.0.0.1:8080/anndata/anndata-dense.zarr',
    );
    const names = await loader.loadFilteredGeneNames();
    expect(names).toEqual(Array.from({ length: 15 }).map((_, i) => `gene_${i}`));
  });

  it('loadGeneSelection matches across storage methods', async () => {
    const selection = { selection: ['gene_1', 'gene_5'] };
    const loaderCsr = createMatrixLoader(
      'http://127.0.0.1:8080/anndata/anndata-csr.zarr',
    );
    const csrSelection = await loaderCsr.loadGeneSelection(selection);
    const loaderDense = createMatrixLoader(
      'http://127.0.0.1:8080/anndata/anndata-dense.zarr',
    );
    const denseSelection = await loaderDense.loadGeneSelection(selection);
    const loaderCsc = createMatrixLoader(
      'http://127.0.0.1:8080/anndata/anndata-csc.zarr',
    );
    const cscSelection = await loaderCsc.loadGeneSelection(selection);
    expect(cscSelection).toEqual(denseSelection);
    expect(csrSelection).toEqual(denseSelection);
  });

  it('loadCellXGene matches across storage methods', async () => {
    const loaderCsr = createMatrixLoader(
      'http://127.0.0.1:8080/anndata/anndata-csr.zarr',
    );
    const csrMatrix = await loaderCsr.loadCellXGene();
    const loaderDense = createMatrixLoader(
      'http://127.0.0.1:8080/anndata/anndata-dense.zarr',
    );
    const denseMatrix = await loaderDense.loadCellXGene();
    const loaderCsc = createMatrixLoader(
      'http://127.0.0.1:8080/anndata/anndata-csc.zarr',
    );
    const cscMatrix = await loaderCsc.loadCellXGene();
    expect(cscMatrix).toEqual(denseMatrix);
    expect(csrMatrix).toEqual(denseMatrix);
  });
});
