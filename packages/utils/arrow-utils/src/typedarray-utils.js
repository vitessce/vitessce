import {
  makeVector,
  vectorFromArray,
  Table,
  Dictionary as arrowDictionary,
  Utf8 as arrowUtf8,
  Uint8 as arrowUint8,
  Uint16 as arrowUint16,
  Uint32 as arrowUint32,
  Int8 as arrowInt8,
  Int16 as arrowInt16,
  Int32 as arrowInt32,
  Float16 as arrowFloat16,
  Float32 as arrowFloat32,
  Float64 as arrowFloat64,
} from 'apache-arrow';

export function isTypedArray(arr) {
  return arr instanceof Uint8Array
    || arr instanceof Uint16Array
    || arr instanceof Uint32Array
    || arr instanceof Int8Array
    || arr instanceof Int16Array
    || arr instanceof Int32Array
    // Float16Array is not yet supported in all browsers
    // || arr instanceof Float16Array
    || arr instanceof Float32Array
    || arr instanceof Float64Array;
}

export function arrayClassToVectorClass(arr) {
  // Unsigned ints
  if(arr instanceof Uint8Array) {
    return arrowUint8;
  }
  if(arr instanceof Uint16Array) {
    return arrowUint16;
  }
  if(arr instanceof Uint32Array) {
    return arrowUint32;
  }
  // Ints
  if(arr instanceof Int8Array) {
    return arrowInt8;
  }
  if(arr instanceof Int16Array) {
    return arrowInt16;
  }
  if(arr instanceof Int32Array) {
    return arrowInt32;
  }
  // Floats
  /*
  // Float16Array is not yet supported in all browsers
  // Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float16Array
  if(arr instanceof Float16Array) {
    return arrowFloat16;
  }
  */
  if(arr instanceof Float32Array) {
    return arrowFloat32;
  }
  if(arr instanceof Float64Array) {
    return arrowFloat64;
  }
  // TODO: bool array type? is there an arrow bool vector class?

  // Not a typed array
  if(Array.isArray(arr)) {
    const allStrings = arr.every((val) => typeof val === 'string');
    if(allStrings) {
      return arrowUtf8;
    }
    const allInts = arr.every((val) => Number.isInteger(val));
    if(allInts) {
      return arrowInt32;
    }
    const allFloats = arr.every((val) => typeof val === 'number');
    if(allFloats) {
      return arrowFloat32;
    }
    throw new Error('Unsupported array type: not string, integer, or float (or mixed)');
  }
}

export function zarrColumnToDictVector(codes, categories) {
  const CategoriesClass = arrayClassToVectorClass(categories);
  const numCategories = categories.length;
  const CodesClass = numCategories <= 255 ? arrowUint8 : (numCategories <= 65535 ? arrowUint16 : arrowUint32);
  const categoriesVector = vectorFromArray(categories, new CategoriesClass());
  return {
    dictVector: vectorFromArray({
      data: codes, // Should we assert that codes are all integers? Or a typed array of integers?
      dictionary: categoriesVector,
      type: new arrowDictionary(new CategoriesClass(), new CodesClass())
    }),
    codesVector: isTypedArray(codes)
      ? makeVector(codes)
      : vectorFromArray(codes, new CodesClass()),
    categoriesVector,
  };
}

export function repeatValueAsDictVector(val, numRows) {
  let ValClass;
  if(typeof val === 'string') {
    ValClass = arrowUtf8;
  } else if(Number.isInteger(val)) {
    ValClass = arrowInt32;
  } else if(typeof val === 'number') {
    ValClass = arrowFloat32;
  } else {
    throw new Error('Unsupported value type: not string, integer, or float');
  }
  // There is only one unique value in the codes array.
  const data = new Uint8Array(numRows);
  data.fill(0);
  return zarrColumnToDictVector(data, [val]);
}

export function zarrColumnToPlainVector(codes) {
  // Not dictionary-encoded.
  const CodesClass = arrayClassToVectorClass(codes);
  return isTypedArray(codes)
    ? makeVector(codes)
    : vectorFromArray(codes, new CodesClass())
}

// When querying the database, we will receive an arrow vector containing codes.
// We should have the categories already from zarrColumnToDictVector being called earlier.
export function plainVectorToDictVector(codesVector, categoriesVector) {
  const CodesClass = codesVector.type.constructor;
  const CategoriesClass = categoriesVector.type.constructor;
  return vectorFromArray({
    data: codesVector,
    dictionary: categoriesVector,
    type: new arrowDictionary(new CategoriesClass(), new CodesClass())
  });
}

/**
 * 
 * @param {Table[]} tables Array of tables
 * @returns {Table}
 */
export function concatenateTables(tables) {
  return tables
    .reduce((acc, table) => acc.concat(table), tables[0]);
}