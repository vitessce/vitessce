/* eslint-disable camelcase */
import { describe, it, expect } from 'vitest';
import {
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

import {
  repeatValueAsDictVector,
  isTypedArray,
  arrayClassToVectorClass,
  zarrColumnToDictVector,
  zarrColumnToPlainVector,
  plainVectorToDictVector,
  concatenateTables,
} from './typedarray-utils.js';

describe('arrow utils', () => {
  it('can create a dictionary-encoded vector from a string', () => {
    const vector = repeatValueAsDictVector('foo', 5).dictVector;

    expect(vector.type.typeId).toEqual(-1); // Dictionary
    expect(vector.type.dictionary.typeId).toEqual(5); // Utf8
    expect(vector.type.indices.typeId).toEqual(2); // Uint8
    expect(vector.length).toEqual(5);
    expect(vector.get(0)).toEqual('foo');
  });

  it('can create a dictionary-encoded vector from a float', () => {
    const vector = repeatValueAsDictVector(3.14, 5).dictVector;

    expect(vector.type.typeId).toEqual(-1); // Dictionary
    expect(vector.type.dictionary.typeId).toEqual(3); // Float32
    expect(vector.type.indices.typeId).toEqual(2); // Uint8
    expect(vector.length).toEqual(5);
    expect(vector.get(0)).toBeCloseTo(3.14);
  });

  it('can detect typed arrays', () => {
    expect(isTypedArray(new Int32Array(5))).toEqual(true);
    expect(isTypedArray([1, 2, 3])).toEqual(false);
  });

  it('can map TypedArray classes to Arrow vector classes', () => {
    expect(arrayClassToVectorClass(new Int32Array(5))).toEqual(arrowInt32);
    expect(arrayClassToVectorClass(new Float32Array(5))).toEqual(arrowFloat32);
    expect(arrayClassToVectorClass(new Float64Array(5))).toEqual(arrowFloat64);
    expect(arrayClassToVectorClass(["abc", "def"])).toEqual(arrowUtf8);
    expect(arrayClassToVectorClass([1, 2, 3])).toEqual(arrowInt32);
    expect(arrayClassToVectorClass([1.1, 2.2, 3])).toEqual(arrowFloat32);
    // Bad examples
    expect(() => arrayClassToVectorClass(["abc", 123]).toThrow()); // Mixed types
    expect(() => arrayClassToVectorClass([{}, []])).toThrow(); // Unsupported types
  });

  it('can convert a Zarr pre-dictionary-encoded column to an Arrow Dictionary vector', () => {
    const codes = new Uint8Array([0, 1, 2, 1, 0]);
    const categories = ["foo", "bar", "baz"];
    const result = zarrColumnToDictVector(codes, categories);
    const { dictVector, codesVector, categoriesVector } = result;
    expect(dictVector.type.typeId).toEqual(-1); // Dictionary
    expect(dictVector.type.dictionary.typeId).toEqual(5); // Utf8
    expect(dictVector.type.indices.typeId).toEqual(2); // Uint8
    expect(dictVector.length).toEqual(5);
    expect(dictVector.get(0)).toEqual("foo");
    expect(dictVector.get(1)).toEqual("bar");
    expect(dictVector.get(2)).toEqual("baz");
    expect(dictVector.get(3)).toEqual("bar");
    expect(dictVector.get(4)).toEqual("foo");

    expect(codesVector.type.typeId).toEqual(2); // Uint8
    expect(codesVector.length).toEqual(5);
    expect(codesVector.get(0)).toEqual(0);
    expect(codesVector.get(1)).toEqual(1);
    expect(codesVector.get(2)).toEqual(2);
    expect(codesVector.get(3)).toEqual(1);
    expect(codesVector.get(4)).toEqual(0);

    expect(categoriesVector.type.typeId).toEqual(5); // Utf8
    expect(categoriesVector.get(0)).toEqual("foo");
    expect(categoriesVector.get(1)).toEqual("bar");
    expect(categoriesVector.get(2)).toEqual("baz");
  });

  it('can convert a Zarr pre-dictionary-encoded column to an Arrow Dictionary vector and back', () => {
    const codes = new Uint8Array([0, 1, 2, 1, 0]);
    const categories = ["foo", "bar", "baz"];
    const result = zarrColumnToDictVector(codes, categories);
    const { codesVector, categoriesVector } = result;

    const dictVector2 = plainVectorToDictVector(codesVector, categoriesVector);

    expect(dictVector2.type.typeId).toEqual(-1); // Dictionary
    expect(dictVector2.type.dictionary.typeId).toEqual(5); // Utf8
    expect(dictVector2.type.indices.typeId).toEqual(2); // Uint8
    expect(dictVector2.length).toEqual(5);
    expect(dictVector2.get(0)).toEqual("foo");
    expect(dictVector2.get(1)).toEqual("bar");
    expect(dictVector2.get(2)).toEqual("baz");
    expect(dictVector2.get(3)).toEqual("bar");
    expect(dictVector2.get(4)).toEqual("foo");
  });

});
