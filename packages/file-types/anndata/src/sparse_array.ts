import { Readable } from '@zarrita/storage';
import * as zarr from 'zarrita';

class IndexingError {
    public message: string
    constructor(message: string) {
        this.message = message
    }
}

type UnsignedIntegerT = "uint8" | "uint16" | "uint32" | "uint64";

interface SparseArray {
    indices: zarr.Array<UnsignedIntegerT>,
    indptr: zarr.Array<UnsignedIntegerT>,
    data: zarr.Array<zarr.NumberDataType>
    format: "csr" | "csc"
}

class SparseArray implements SparseArray {
    constructor(indices: zarr.Array<UnsignedIntegerT, Readable>, indptr: zarr.Array<UnsignedIntegerT, Readable>, data: zarr.Array<zarr.NumberDataType, Readable>) {
        this.indices = indices
        this.indptr = indptr
        this.data = data
    }

    async get<Sel extends (null | typeof zarr.slice | number)[]>(sel: Sel) {
        if (sel.length != 2) {
            throw new IndexingError("For sparse array, selection must be of length 2");
        }
    }
}

export class CSRArray extends SparseArray {
    format: "csr" | "csc" = "csr";
}

export class CSCArray extends SparseArray {
    format: "csr" | "csc" = "csc";
}