/* eslint-disable no-underscore-dangle */
import { openArray, slice } from 'zarr';
import { extent } from 'd3-array';
import BaseAnnDataLoader from './BaseAnnDataLoader';

const normalize = (arr) => {
  const [min, max] = extent(arr);
  const ratio = 255 / (max - min);
  const data = new Uint8Array(
    arr.map(i => Math.floor((i - min) * ratio)),
  );
  return { data };
};

const concatenateGenes = (arr) => {
  const numGenes = arr.length;
  const numCells = arr[0].length;
  const view = new DataView(new ArrayBuffer(numGenes * numCells));
  for (let i = 0; i < numGenes; i += 1) {
    for (let j = 0; j < numCells; j += 1) {
      view.setUint8(j * numGenes + i, arr[i][j]);
    }
  }
  return new Uint8Array(view.buffer);
};

/**
 * Loader for converting zarr into the a cell x gene matrix for use in Genes/Heatmap components.
 */
export default class MatrixZarrLoader extends BaseAnnDataLoader {
  /**
   * Class method for opening the sparse matrix arrays in zarr.
   * @returns {Array} A list of promises pointing to the indptr, indices, and data of the matrix.
   */
  async _openSparseArrays() {
    const {
      options: { matrix },
      store,
    } = this;
    if (this.sparseArrays) {
      return this.sparseArrays;
    }
    this.sparseArrays = Promise.all(
      ['indptr', 'indices', 'data'].map(name => openArray({ store, path: `${matrix}/${name}`, mode: 'r' })),
    );
    return this.sparseArrays;
  }

  /**
   * Class method for loading a filtered subset of the genes list
   * @param {Array} filterZarr A location in the zarr store to fetch a boolean array from.
   * @returns {Array} A list of filtered genes.
   */
  async _getFilteredGenes(filterZarr) {
    const filter = await this.getFlatArrDecompressed(filterZarr);
    const geneNames = await this.loadGeneNames();
    const genes = geneNames.filter((_, i) => filter[i]);
    return genes;
  }

  /**
   * Class method for loading row oriented (CSR) sparse data from zarr.
   * @returns {Object} A { data: Float32Array } contianing the CellXGene matrix.
   */
  async _loadCSRSparseCellXGene() {
    if (this._sparseMatrix) {
      return this._sparseMatrix;
    }
    this._sparseMatrix = this._openSparseArrays().then(async (sparseArrays) => {
      const { options: { matrix } } = this;
      const { shape } = await this.getJson(`${matrix}/.zattrs`);
      const [rows, cols, cellXGene] = await Promise.all(sparseArrays.map(async (arr) => {
        const { data } = await arr.getRaw(null);
        return data;
      }));
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
      const { shape } = await this.getJson(`${matrix}/.zattrs`);
      const [cols, rows, cellXGene] = await Promise.all(sparseArrays.map(async (arr) => {
        const { data } = await arr.getRaw(null);
        return data;
      }));
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
    const { store } = this;
    if (this.cellXGene) {
      return this.cellXGene;
    }
    const {
      options: { matrix, heatmapFilter },
    } = this;
    const zattrs = await this.getJson(`${matrix}/.zattrs`);
    const encodingType = zattrs['encoding-type'];
    if (encodingType === 'csr_matrix') {
      // If there is a heatmapFilter, we should load the cellXGene matrix and then filter it.
      if (heatmapFilter) {
        this.cellXGene = this._loadCSRSparseCellXGene().then(async (cellXGene) => {
          const filteredGenes = await this._getFilteredGenes(heatmapFilter);
          const numGenes = filteredGenes.length;
          const cellNames = await this.loadCellNames();
          const geneNames = await this.loadGeneNames();
          const numCells = cellNames.length;
          const cellXGeneMatrixFiltered = new Float32Array(numCells * numGenes).fill(0);
          for (let i = 0; i < numGenes; i += 1) {
            const index = geneNames.indexOf(filteredGenes[i]);
            for (let j = 0; j < numCells; j += 1) {
              cellXGeneMatrixFiltered[j * numGenes + i] = cellXGene[j * geneNames.length + index];
            }
          }
          return normalize(cellXGeneMatrixFiltered);
        });
        return this.cellXGene;
      }
      this.cellXGene = this._loadCSRSparseCellXGene().then(data => normalize(data));
      return this.cellXGene;
    }
    // No heatmap filter and CSC matrix means we are loading the whole matrix.
    if (encodingType === 'csc_matrix' && !heatmapFilter) {
      this.cellXGene = this._loadCSCSparseCellXGene().then(data => normalize(data));
      return this.cellXGene;
    }
    // Non-sparse matrices should cache their zarray.
    if (!this.arr && encodingType !== 'csc_matrix') {
      this.arr = openArray({ store, path: matrix, mode: 'r' });
    }
    if (heatmapFilter) {
      const genes = await this._getFilteredGenes(heatmapFilter);
      this.cellXGene = this.loadGeneSelection(genes)
        .then(({ data }) => ({ data: concatenateGenes(data) }));
    } else {
      this.cellXGene = this.arr.then(z => z.getRaw(null)
        .then(({ data }) => normalize(data)));
    }
    return this.cellXGene;
  }

  /**
   * Class method for loading the genes list from AnnData.var.
   * @returns {Promise} A promise for the zarr array contianing the gene names.
   */
  async loadGeneNames() {
    if (this.geneNames) {
      return this.geneNames;
    }
    const { geneFilter: geneFilterZarr } = this.options;
    let geneFilter;
    if (geneFilterZarr) {
      geneFilter = await this.getFlatArrDecompressed(geneFilterZarr);
    }
    const { _index } = await this.getJson('var/.zattrs');
    if (this.geneNames) {
      return this.geneNames;
    }
    this.geneNames = this.getFlatTextArr(`var/${_index}`).then(data => data.filter(
      (_, j) => !geneFilter || geneFilter[j],
    ));
    return this.geneNames;
  }

  /**
   * Class method for loading a gene selection.
   * @param {Array} selection A list of gene names whose data should be fetched.
   * @returns {Object} { data } containing an array of gene expression data.
   */
  async loadGeneSelection(selection) {
    const {
      options: { matrix },
      store,
    } = this;
    const geneNames = await this.loadGeneNames();
    const indices = selection.map(gene => geneNames.indexOf(gene));
    const zattrs = await this.getJson(`${matrix}/.zattrs`);
    const encodingType = zattrs['encoding-type'];
    let genes;
    if (encodingType === 'csc_matrix') {
      const [indptrArr, indexArr, cellXGeneArr] = await this._openSparseArrays();
      const cellNames = await this.loadCellNames();
      const { data: cols } = await indptrArr.getRaw(null);
      // If there is not change in the column indexer, then the data is all zeros
      genes = await Promise.all(indices.map(async (index) => {
        const startRowIndex = cols[index];
        const endRowIndex = cols[index + 1];
        const isColumnAllZeros = startRowIndex === endRowIndex;
        const geneData = new Uint8Array(cellNames.length).fill(0);
        if (isColumnAllZeros) {
          return geneData;
        }
        const { data: rowIndices } = await indexArr.get([slice(startRowIndex, endRowIndex)]);
        const { data: cellXGeneData } = await cellXGeneArr.get([slice(startRowIndex, endRowIndex)]);
        for (let rowIndex = 0; rowIndex < rowIndices.length; rowIndex += 1) {
          geneData[rowIndices[rowIndex]] = cellXGeneData[rowIndex];
        }
        return geneData;
      }));
    } else if (encodingType === 'csr_matrix') {
      const cellXGene = await this._loadCSRSparseCellXGene();
      const cellNames = await this.loadCellNames();
      genes = indices.map((index) => {
        const geneData = new Float32Array(cellNames.length).fill(0);
        for (let i = 0; i < cellNames.length; i += 1) {
          geneData[i] = cellXGene[i * geneNames.length + index];
        }
        return geneData;
      });
    } else {
      if (!this.arr) {
        this.arr = openArray({ store, path: matrix, mode: 'r' });
      }
      genes = await Promise.all(
        indices.map(index => this.arr.then(z => z.get([null, index])).then(({ data }) => data)),
      );
    }
    return { data: genes.map(i => normalize(i).data), url: null };
  }

  /**
   * Class method for loading only attributes i.e rows and columns
   * @param {Array} selection A list of gene names whose data should be fetched.
   * @returns {Object} { data: { rows, cols }, url } containing row and col labels for the matrix.
   */
  loadAttrs() {
    return Promise
      .all([this.loadCellNames(), this.loadGeneNames()])
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
    return Promise
      .all([this.loadAttrs(), this.loadCellXGene()])
      .then(async (d) => {
        const [{ data: attrs }, cellXGene] = d;
        const {
          options: { heatmapFilter: heatmapFilterZarr },
        } = this;
        if (heatmapFilterZarr) {
          const heatmapFilter = await this.getFlatArrDecompressed(heatmapFilterZarr);
          attrs.cols = attrs.cols.filter((_, i) => heatmapFilter[i]);
        }
        return {
          data: [
            attrs, cellXGene,
          ],
          url: null,
        };
      });
  }
}
