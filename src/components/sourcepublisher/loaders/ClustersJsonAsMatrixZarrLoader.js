/* eslint-disable */
import { NestedArray } from 'zarr';
import { extent } from 'd3-array';
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
                const shape = [attrs.rows.length, attrs.cols.length];
                // Normalize values by converting to one-byte integers.
                const flatMatrix = matrix.flat();
                const [min, max] = extent(flatMatrix);
                const normalize = d => Math.floor(((d - min) / (max - min)) * 255);
                const normalizedFlatMatrix = flatMatrix.map(normalize);
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