// eslint-disable-next-line no-undef
export const maybeDowncastInt64 = (data) => {
  try {
    return convertBigInt64ArrayToInt32Array(data);
  } catch (error) {
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
