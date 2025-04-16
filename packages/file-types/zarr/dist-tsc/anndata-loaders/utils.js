export class IncorrectDataTypeError extends Error {
    constructor(message) {
        super(message);
        this.name = 'IncorrectDataTypeError';
    }
}
export function convertBigInt64ArrayToInt32Array(arr) {
    if (!(arr instanceof BigInt64Array)) { // eslint-disable-line no-undef
        throw new IncorrectDataTypeError('Expected a BigInt64Array');
    }
    const out = new Int32Array(arr.length);
    // Create a view of the BigInt64Array buffer as a Int32Array (2x elements of out)
    const view = new Int32Array(arr.buffer);
    for (let i = 0; i < arr.length; i++) {
        /**
                         * Get the lower 32 bits of each 64-bit value.
                         *
                         * Since each 64-bit value takes up 2 slots in the Int32Array view, we
                         * multiply the index by 2 to get the correct position (assuming
                         * little-endian).  Note that we are ignoring the upper bits because
                         * data will never actually need 64 bits of integer precision.
                         * If this comes up someone can open an issue.
                         */
        out[i] = view[i * 2];
    }
    return out;
}
// eslint-disable-next-line no-undef
export const maybeDowncastInt64 = (data) => {
    try {
        return convertBigInt64ArrayToInt32Array(data);
    }
    catch (error) {
        if (error instanceof IncorrectDataTypeError) {
            return data;
        }
        throw error;
    }
};
export const concatenateColumnVectors = (arr) => {
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
