import { Readable } from '@zarrita/storage';
import * as zarr from 'zarrita';
import { AxisSelection, FullSelection, Slice } from './types';
import { CONSTRUCTORS } from './utils'

class IndexingError {
    public message: string
    constructor(message: string) {
        this.message = message
    }
}

function isSlice(s: any): s is Slice {
    return (s as Slice)?.stop !== undefined || (s as Slice)?.start !== undefined
}


// TODO: Make this and other data types more restricitve but how?
class SparseArray<D extends zarr.NumberDataType> {

    constructor(
        public readonly indices: zarr.Array<zarr.NumberDataType, Readable>,
        public readonly indptr: zarr.Array<zarr.NumberDataType, Readable>,
        public readonly data: zarr.Array<D, Readable>,
        public readonly shape: number[],
        public readonly format: "csc" | "csr"
    ) { }


    async get(selection: (null | Slice | number)[]): Promise<zarr.Chunk<D>>
    async get(selection: number[]): Promise<zarr.Scalar<D>>
    async get(selection: FullSelection) {
        if (selection.length != 2) {
            throw new IndexingError("For sparse array, selection must be of length 2");
        }
        const minorAxisSelection = selection[this.minorAxis]
        const majorAxisSelection = selection[this.majorAxis]
        const arr = await this.getContiguous(majorAxisSelection)
        const finalSelection = new Array(arr.shape.length).fill(minorAxisSelection);
        if (arr.shape.length > 1) {
            finalSelection[this.majorAxis] = null
        }
        const res = await zarr.get(arr, finalSelection);
        if (res?.shape && res.shape[0] === 1 && res.shape.length === 1) {
            return res.data[0]
        }
        return res
    }

    public get majorAxis(): number {
        return ["csr", "csc"].indexOf(this.format)
    }

    public get minorAxis(): number {
        return ["csc", "csr"].indexOf(this.format)
    }

    async getContiguous(s: AxisSelection): Promise<zarr.Array<D, Readable>> {
        // Resolve (major-axis) selection of indptr
        let sliceStart = 0;
        let sliceEnd = this.shape[this.majorAxis] + 1;
        if (isSlice(s)) {
            if (s.start) {
                sliceStart = s.start;
            }
            if (s.stop) {
                sliceEnd = s.stop + 1;
            }
        } else if (typeof s == "number") {
            sliceStart = s;
            sliceEnd = s + 2;
        }
        const majorAxisSize = sliceEnd - sliceStart - 1;
        const return2D = majorAxisSize > 1 || this.majorAxis // return 2D for column selection, even if the selection is 1D
        const shape: number[] = new Array(return2D ? 2 : 1).fill(this.shape[this.minorAxis]);
        if (return2D) {
            shape[this.majorAxis] = majorAxisSize
        }

        // Get start and stop of the data/indices based on major-axis selection
        const { data: indptr } = await zarr.get(this.indptr, [zarr.slice(sliceStart, sliceEnd)])
        const start = indptr[0];
        const stop = indptr[-1] || null;

        // Create data to be returned
        const isColumnAllZeros = start === stop;
        const dense = new (CONSTRUCTORS[this.data.dtype])(shape.reduce((a, b) => a * b, 1)).fill(0);
        const arr = await zarr.create(new Map(), {
            shape,
            chunk_shape: shape,
            data_type: this.data.dtype,
        });

        // Return empty or fill
        if (isColumnAllZeros) {
            return arr;
        }

        // Get data/indices and create dense return object
        const { data: indices } = await zarr.get(this.indices, [
            zarr.slice(start, stop),
        ]);
        let { data } = await zarr.get(this.data, [
            zarr.slice(start, stop),
        ]);
        const stride = new Array(return2D ? 2 : 1).fill(1);
        if (return2D) {
            stride[this.majorAxis] = shape[this.minorAxis]
            stride[this.minorAxis] = 1
        }
        const chunk = {
            data: this.densify(indices, indptr, data, dense, shape),
            shape,
            stride,
        } as zarr.Chunk<D>;
        await zarr.set(arr, null, chunk);
        return arr;
    }

    densify(indices: zarr.TypedArray<zarr.NumberDataType>, indptr: zarr.TypedArray<zarr.NumberDataType>, data: zarr.TypedArray<zarr.NumberDataType>, dense: zarr.TypedArray<zarr.NumberDataType>, shape: number[]) {
        let minorAxisLength = shape[0];
        if (shape.length > 1) {
            minorAxisLength = shape[this.minorAxis]
        }
        for (let majorIdx = 0; majorIdx < indptr.length; majorIdx += 1) {
            const indptrStart = indptr[majorIdx];
            const indptrStop = indptr[majorIdx + 1];
            for (let indicesOrDataIndex = indptrStart; indicesOrDataIndex < indptrStop; indicesOrDataIndex += 1) {
                const minorIdx = indices[indicesOrDataIndex];
                dense[(majorIdx * minorAxisLength) + minorIdx] = data[indicesOrDataIndex];
            }
        }
        return dense
    }

}

export default SparseArray;