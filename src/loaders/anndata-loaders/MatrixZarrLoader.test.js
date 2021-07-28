import expect from 'expect';
import MatrixZarrLoader from './MatrixZarrLoader';
import { AnnDataSource } from '../data-sources';

const createMatrixLoader = (config) => {
  const source = new AnnDataSource(config);
  return new MatrixZarrLoader(source, config);
};

describe('loaders/MatrixZarrLoader', () => {
  it('loadFilteredGeneNames returns gene names', async () => {
    const loader = createMatrixLoader({
      url: 'http://127.0.0.1:8080/anndata/anndata-dense.zarr', options: { matrix: 'X' },
    });
    const names = await loader.loadFilteredGeneNames();
    expect(names).toEqual(Array.from({ length: 15 }).map((_, i) => `gene_${i}`));
  });

  it('loadGeneSelection matches across storage methods', async () => {
    const selection = { selection: ['gene_1', 'gene_5'] };
    const loaderCsr = createMatrixLoader({
      url: 'http://127.0.0.1:8080/anndata/anndata-csr.zarr', options: { matrix: 'X' },
    });
    const csrSelection = await loaderCsr.loadGeneSelection(selection);
    const loaderDense = createMatrixLoader({
      url: 'http://127.0.0.1:8080/anndata/anndata-dense.zarr', options: { matrix: 'X' },
    });
    const denseSelection = await loaderDense.loadGeneSelection(selection);
    const loaderCsc = createMatrixLoader({
      url: 'http://127.0.0.1:8080/anndata/anndata-csc.zarr', options: { matrix: 'X' },
    });
    const cscSelection = await loaderCsc.loadGeneSelection(selection);
    expect(cscSelection).toEqual(denseSelection);
    expect(csrSelection).toEqual(denseSelection);
  });

  it('loadCellXGene matches across storage methods', async () => {
    const loaderCsr = createMatrixLoader({
      url: 'http://127.0.0.1:8080/anndata/anndata-csr.zarr', options: { matrix: 'X' },
    });
    const csrMatrix = await loaderCsr.loadCellXGene();
    const loaderDense = createMatrixLoader({
      url: 'http://127.0.0.1:8080/anndata/anndata-dense.zarr', options: { matrix: 'X' },
    });
    const denseMatrix = await loaderDense.loadCellXGene();
    const loaderCsc = createMatrixLoader({
      url: 'http://127.0.0.1:8080/anndata/anndata-csc.zarr', options: { matrix: 'X' },
    });
    const cscMatrix = await loaderCsc.loadCellXGene();
    expect(cscMatrix).toEqual(denseMatrix);
    expect(csrMatrix).toEqual(denseMatrix);
  });
});
