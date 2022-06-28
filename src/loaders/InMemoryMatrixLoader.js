/* eslint-disable */
import { extent } from "d3-array";
import range from "lodash/range";
import { DATA_TEXTURE_SIZE } from "../layers/heatmap-constants";
import JsonLoader from "./JsonLoader";
import LoaderResult from "./LoaderResult";

export default class InMemoryMatrixLoader extends JsonLoader {
  async load() {
    const numRows = Math.ceil(DATA_TEXTURE_SIZE * 2.5)
    const numCols = Math.ceil(DATA_TEXTURE_SIZE * 1.5)
    const data = {
      rows: Array.from({ length: numRows }, (i, j) => `gene_${j}`),
      cols: Array.from({ length: numCols }, (i, j) => `cell_${j}`),
      matrix: Array.from({ length: numRows }, (i, j) =>
        Array.from(
          { length: numCols },
          (l, k) =>
            ((Math.floor(k / DATA_TEXTURE_SIZE) * (Math.ceil(numRows / DATA_TEXTURE_SIZE))) +
              Math.floor(j / DATA_TEXTURE_SIZE)) / ((Math.ceil(numRows / DATA_TEXTURE_SIZE) * Math.ceil(numCols / DATA_TEXTURE_SIZE)) - 1)
        )
      ),
    };
    console.log(data.matrix) // eslint-disable-line
    const { rows, cols, matrix } = data;
    const attrs = {
      rows: cols,
      cols: rows,
    };
    const shape = [attrs.rows.length, attrs.cols.length];
    // Normalize values by converting to one-byte integers.
    // Normalize for each gene (column) independently.
    const normalizedMatrix = matrix.map((col) => {
      const [min, max] = [0, 1];
      const normalize = (d) => Math.floor(d * 255);
      return col.map(normalize);
    });
    // Transpose the normalized matrix.
    const tNormalizedMatrix = range(shape[0]).map((i) =>
      range(shape[1]).map((j) => normalizedMatrix[j][i])
    );
    // Flatten the transposed matrix.
    const normalizedFlatMatrix = tNormalizedMatrix.flat();
    // Need to wrap the NestedArray to mock the HTTPStore-based array
    // which returns promises.
    const arr = { data: Uint8Array.from(normalizedFlatMatrix) };
    return Promise.resolve(new LoaderResult([attrs, arr], null));
  }
}
