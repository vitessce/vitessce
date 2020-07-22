/* eslint-disable */
import { NestedArray } from 'zarr';
import { extent } from 'd3-array';
import range from 'lodash/range';
import clustersSchema from '../../../schemas/clusters.schema.json';
import JsonLoader from "./JsonLoader";

export default class ClustersJsonAsMatrixZarrLoader extends JsonLoader {

    constructor(params) {
        super(params);

        this.schema = clustersSchema;
    }
    
    load() {
        const jsonPromise = super.load();

        return new Promise((resolve) => {
            jsonPromise.then((data) => {
                const { rows, cols, matrix } = data;
                const attrs = {
                    rows: cols,
                    cols: rows,
                };
                console.log(matrix);
                const shape = [attrs.rows.length, attrs.cols.length];
                // Normalize values by converting to one-byte integers.
                // Normalize for each gene (column) independently.
                const normalizedMatrix = matrix.map(col => {
                    const [min, max] = extent(col);
                    const normalize = d => Math.floor(((d - min) / (max - min)) * 255);
                    return col.map(normalize);
                });
                // Transpose the normalized matrix.
                const tNormalizedMatrix = range(shape[0]).map(i => range(shape[1]).map(j => normalizedMatrix[j][i]));
                // Flatten the transposed matrix.
                const normalizedFlatMatrix = tNormalizedMatrix.flat();
                const typedNormalizedFlatMatrix = Uint8Array.from(normalizedFlatMatrix);
                const arr = new NestedArray(typedNormalizedFlatMatrix, shape);
                const arrWrapper = {
                    get: (...args) => Promise.resolve(arr.get(...args)),
                    getRaw: (...args) => Promise.resolve({ data: typedNormalizedFlatMatrix })
                };
                resolve([attrs, arrWrapper]);
            });
        });
    }
}