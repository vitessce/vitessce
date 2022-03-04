/* eslint-disable no-underscore-dangle */
import { openArray, slice } from 'zarr';
import { extent } from 'd3-array';
import LoaderResult from '../LoaderResult';
import AbstractTwoStepLoader from '../AbstractTwoStepLoader';

const normalize = (arr) => {
  const [min, max] = extent(arr);
  const ratio = 255 / (max - min);
  const data = new Uint8Array(
    arr.map(i => Math.floor((i - min) * ratio)),
  );
  return { data };
};

const concatenateColumnVectors = (arr) => {
  const numCols = arr.length;
  const numRows = arr[0].length;
  const { BYTES_PER_ELEMENT } = arr[0];
  const view = new DataView(new ArrayBuffer(numCols * numRows * BYTES_PER_ELEMENT));
  const TypedArray = arr[0].constructor;
  const dtype = TypedArray.name.replace('Array', '');
  for (let i = 0; i < numCols; i += 1) {
    for (let j = 0; j < numRows; j += 1) {
      view[`set${dtype}`](BYTES_PER_ELEMENT * (j * numCols + i), arr[i][j], true);
    }
  }
  return new TypedArray(view.buffer);
};

/**
 * Loader for converting zarr into the a cell x gene matrix for use in Genes/Heatmap components.
 */
export default class MatrixZarrLoader extends AbstractTwoStepLoader {
  /**
   * Class method for loading the genes list from AnnData.var,
   * filtered if a there is a `geneFilterZarr` present in the view config.
   * @returns {Promise} A promise for the zarr array contianing the gene names.
   */
  async loadFilteredGeneNames() {
    if (this.filteredGeneNames) {
      return this.filteredGeneNames;
    }
    const { geneFilter: geneFilterZarr } = this.options;
    const getFilterFn = async () => {
      if (!geneFilterZarr) return data => data;
      const geneFilter = await this.dataSource.getFlatArrDecompressed(geneFilterZarr);
      return data => data.filter((_, j) => geneFilter[j]);
    };

    this.filteredGeneNames = Promise
      .all([this.dataSource.loadVarIndex(), getFilterFn()])
      .then(([data, filter]) => filter(data));
    return this.filteredGeneNames;
  }

  /**
   * Class method for loading a filtered subset of the genes list
   * @param {String} filterZarr A location in the zarr store to fetch a boolean array from.
   * @returns {Array} A list of filtered genes.
   */
  async _getFilteredGenes(filterZarr) {
    const filter = await this.dataSource.getFlatArrDecompressed(filterZarr);
    const geneNames = await this.loadFilteredGeneNames();
    const genes = geneNames.filter((_, i) => filter[i]);
    return genes;
  }

  /**
   * Class method for getting the integer indices of a selection of genes within a list.
   * @param {Array} selection A list of gene names.
   * @returns {Array} A list of integer indices.
   */
  async _getGeneIndices(selection) {
    const geneNames = await this.loadFilteredGeneNames();
    return selection.map(gene => geneNames.indexOf(gene));
  }

  /**
   * Class method for getting the number of cells i.e entries in `obs`.
   * @returns {Number} The number of cells.
   */
  async _getNumCells() {
    const cells = await this.dataSource.loadObsIndex();
    return cells.length;
  }

  /**
   * Class method for getting the number of genes i.e entries in `var`,
   * potentially filtered by `genesFilter`.
   * @returns {Number} The number of genes.
   */
  async _getNumGenes() {
    const genes = await this.loadFilteredGeneNames();
    return genes.length;
  }

  /**
   * Class method for opening the sparse matrix arrays in zarr.
   * @returns {Array} A list of promises pointing to the indptr, indices, and data of the matrix.
   */
  async _openSparseArrays() {
    const { options: { matrix } } = this;
    const { store } = this.dataSource;
    if (this.sparseArrays) {
      return this.sparseArrays;
    }
    this.sparseArrays = Promise.all(
      ['indptr', 'indices', 'data'].map(name => openArray({ store, path: `${matrix}/${name}`, mode: 'r' })),
    );
    return this.sparseArrays;
  }

  /**
   * Class method for loading a gene selection from a CSC matrix.
   * @param {Array} selection A list of gene names whose data should be fetched.
   * @returns {Promise} A Promise.all array of promises containing Uint8Arrays, one per selection.
   */
  async _loadCSCGeneSelection(selection) {
    const indices = await this._getGeneIndices(selection);
    const [indptrArr, indexArr, cellXGeneArr] = await this._openSparseArrays();
    const numCells = await this._getNumCells();
    const { data: cols } = await indptrArr.getRaw(null);
    // If there is not change in the column indexer, then the data is all zeros
    return Promise.all(
      indices.map(async (index) => {
        const startRowIndex = cols[index];
        const endRowIndex = cols[index + 1];
        const isColumnAllZeros = startRowIndex === endRowIndex;
        const geneData = new Float32Array(numCells).fill(0);
        if (isColumnAllZeros) {
          return geneData;
        }
        const { data: rowIndices } = await indexArr.get([
          slice(startRowIndex, endRowIndex),
        ]);
        const { data: cellXGeneData } = await cellXGeneArr.get([
          slice(startRowIndex, endRowIndex),
        ]);
        for (let rowIndex = 0; rowIndex < rowIndices.length; rowIndex += 1) {
          geneData[rowIndices[rowIndex]] = cellXGeneData[rowIndex];
        }
        return geneData;
      }),
    );
  }

  /**
   * Class method for loading a gene selection from a CSR matrix.
   * @param {Array} selection A list of gene names whose data should be fetched.
   * @returns {Promise} A Promise.all array of promises containing Uint8Arrays, one per selection.
   */
  async _loadCSRGeneSelection(selection) {
    const indices = await this._getGeneIndices(selection);
    const numGenes = await this._getNumGenes();
    const numCells = await this._getNumCells();
    const cellXGene = await this._loadCSRSparseCellXGene();
    return indices.map((index) => {
      const geneData = new Float32Array(numCells).fill(0);
      for (let i = 0; i < numCells; i += 1) {
        geneData[i] = cellXGene[i * numGenes + index];
      }
      return geneData;
    });
  }

  /**
   * Class method for loading row oriented (CSR) sparse data from zarr.
   *
   * @returns {Object} A { data: Float32Array } contianing the CellXGene matrix.
   */
  async _loadCSRSparseCellXGene() {
    if (this._sparseMatrix) {
      return this._sparseMatrix;
    }
    this._sparseMatrix = this._openSparseArrays().then(async (sparseArrays) => {
      const { options: { matrix } } = this;
      const { shape } = await this.dataSource.getJson(`${matrix}/.zattrs`);
      const [rows, cols, cellXGene] = await Promise.all(
        sparseArrays.map(async (arr) => {
          const { data } = await arr.getRaw(null);
          return data;
        }),
      );
      const cellXGeneMatrix = new Float32Array(shape[0] * shape[1]).fill(0);
      let row = 0;
      rows.forEach((_, index) => {
        const rowStart = rows[index];
        const rowEnd = rows[index + 1];
        for (let i = rowStart; i < rowEnd; i += 1) {
          const val = cellXGene[i];
          const col = cols[i];
          cellXGeneMatrix[row * shape[1] + col] = val;
        }
        row += 1;
      });
      return cellXGeneMatrix;
    });
    return this._sparseMatrix;
  }

  /**
   * Class method for loading column oriented (CSC) sparse data from zarr.
   * @returns {Object} A { data: Float32Array } contianing the CellXGene matrix.
   */
  async _loadCSCSparseCellXGene() {
    if (this._sparseMatrix) {
      return this._sparseMatrix;
    }
    this._sparseMatrix = this._openSparseArrays().then(async (sparseArrays) => {
      const { options: { matrix } } = this;
      const { shape } = await this.dataSource.getJson(`${matrix}/.zattrs`);
      const [cols, rows, cellXGene] = await Promise.all(
        sparseArrays.map(async (arr) => {
          const { data } = await arr.getRaw(null);
          return data;
        }),
      );
      const cellXGeneMatrix = new Float32Array(shape[0] * shape[1]).fill(0);
      let col = 0;
      cols.forEach((_, index) => {
        const colStart = cols[index];
        const colEnd = cols[index + 1];
        for (let i = colStart; i < colEnd; i += 1) {
          const val = cellXGene[i];
          const row = rows[i];
          cellXGeneMatrix[row * shape[1] + col] = val;
        }
        col += 1;
      });
      return cellXGeneMatrix;
    });
    return this._sparseMatrix;
  }

  /**
   * Class method for loading the cell x gene matrix.
   * @returns {Promise} A promise for the zarr array contianing the cell x gene data.
   */
  async loadCellXGene() {
    const { store } = this.dataSource;
    if (this.cellXGene) {
      return this.cellXGene;
    }
    const { options: { matrix, matrixGeneFilter } } = this;
    if (!this._matrixZattrs) {
      this._matrixZattrs = await this.dataSource.getJson(`${matrix}/.zattrs`);
    }
    const encodingType = this._matrixZattrs['encoding-type'];
    if (!matrixGeneFilter) {
      if (encodingType === 'csr_matrix') {
        this.cellXGene = this._loadCSRSparseCellXGene().then(data => normalize(data));
      } else if (encodingType === 'csc_matrix') {
        this.cellXGene = this._loadCSCSparseCellXGene().then(data => normalize(data));
      } else {
        if (!this.arr) {
          this.arr = openArray({ store, path: matrix, mode: 'r' });
        }
        this.cellXGene = this.arr.then(z => z.getRaw(null).then(({ data }) => normalize(data)));
      }
    } else if (encodingType === 'csr_matrix') {
      this.cellXGene = this._loadCSRSparseCellXGene().then(
        async (cellXGene) => {
          const filteredGenes = await this._getFilteredGenes(matrixGeneFilter);
          const numGenesFiltered = filteredGenes.length;
          const geneNames = await this.loadFilteredGeneNames();
          const numGenes = geneNames.length;
          const numCells = await this._getNumCells();
          const cellXGeneMatrixFiltered = new Float32Array(
            numCells * numGenesFiltered,
          ).fill(0);
          for (let i = 0; i < numGenesFiltered; i += 1) {
            const index = geneNames.indexOf(filteredGenes[i]);
            for (let j = 0; j < numCells; j += 1) {
              cellXGeneMatrixFiltered[j * numGenesFiltered + i] = cellXGene[j * numGenes + index];
            }
          }
          return normalize(cellXGeneMatrixFiltered);
        },
      );
    } else {
      const genes = await this._getFilteredGenes(matrixGeneFilter);
      this.cellXGene = this.loadGeneSelection({ selection: genes, shouldNormalize: false })
        .then(({ data }) => (normalize(concatenateColumnVectors(data))));
    }
    return this.cellXGene;
  }

  /**
   * Class method for loading a gene selection.
   * @param {Object} args
   * @param {Array} args.selection A list of gene names whose data should be fetched.
   * @param {Boolean} args.shouldNormalize A list of gene names whose data should be fetched.
   * @returns {Object} { data } containing an array of gene expression data.
   */
  async loadGeneSelection({ selection, shouldNormalize = true }) {
    const { options: { matrix } } = this;
    const { store } = this.dataSource;
    if (!this._matrixZattrs) {
      this._matrixZattrs = await this.dataSource.getJson(`${matrix}/.zattrs`);
    }
    const encodingType = this._matrixZattrs['encoding-type'];
    let genes;
    if (encodingType === 'csc_matrix') {
      genes = await this._loadCSCGeneSelection(selection);
    } else if (encodingType === 'csr_matrix') {
      genes = await this._loadCSRGeneSelection(selection);
    } else {
      if (!this.arr) {
        this.arr = openArray({ store, path: matrix, mode: 'r' });
      }
      const indices = await this._getGeneIndices(selection);
      // We can index directly into a normal dense array zarr store via `get`.
      genes = await Promise.all(
        indices.map(index => this.arr.then(z => z.get([null, index])).then(({ data }) => data)),
      );
    }
    return { data: genes.map(i => (shouldNormalize ? normalize(i).data : i)), url: null };
  }

  /**
   * Class method for loading only attributes i.e rows and columns
   * @param {Array} selection A list of gene names whose data should be fetched.
   * @returns {Object} { data: { rows, cols }, url } containing row and col labels for the matrix.
   */
  loadAttrs() {
    return Promise.all([this.dataSource.loadObsIndex(), this.loadFilteredGeneNames()])
      .then((d) => {
        const [cellNames, geneNames] = d;
        const attrs = { rows: cellNames, cols: geneNames };
        return {
          data: attrs,
          url: null,
        };
      });
  }

  load() {
    return Promise.all([this.loadAttrs(), this.loadCellXGene()]).then(
      async (d) => {
        const [{ data: attrs }, cellXGene] = d;
        const {
          options: { matrixGeneFilter: matrixGeneFilterZarr },
        } = this;
        // In order to return the correct gene list with the heatmap data,
        // we need to filter the columns of attrs so it matches the cellXGene data.
        if (matrixGeneFilterZarr) {
          const matrixGeneFilter = await this.dataSource.getFlatArrDecompressed(
            matrixGeneFilterZarr,
          );
          attrs.cols = attrs.cols.filter((_, i) => matrixGeneFilter[i]);
        }
        return Promise.resolve(new LoaderResult([attrs, cellXGene], null));
      },
    );
  }
}
