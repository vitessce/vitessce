import { log } from '@vitessce/globals';

/**
 * Converts BigInt64Array or Float64Array to Float32Array if needed.
 * TODO: remove this and support BigInts/Float64s in downstream code.
 * @param {Array<number>} input The typed array to convert.
 * @returns {any} The converted or original Float32Array.
 */
export function toFloat32Array(input) {
  if (input instanceof Float32Array) {
    return input; // Already a Float32Array
  }

  // eslint-disable-next-line no-undef
  if (input instanceof BigInt64Array) {
    const floats = new Float32Array(input.length);
    for (let i = 0; i < input.length; i++) {
      floats[i] = Number(input[i]); // May lose precision
    }
    return floats;
  }

  if (input instanceof Float64Array) {
    return new Float32Array(input); // Converts with reduced precision
  }

  if (input instanceof Array) {
    return new Float32Array(input);
  }

  log.warn('toFloat32Array expected Float32Array, Float64Array, BigInt64Array, or Array input');
  return new Float32Array(input);
}

/**
 * Downcasts BigInt64Array to Int32Array if needed.
 * @param {Array<any>} input The array to potentially convert.
 * @returns {any} The downcasted Int32Array or original input.
 */
export function downcastIfBigIntArray(input) {
  // eslint-disable-next-line no-undef
  if (input instanceof BigInt64Array) {
    const downcasted = new Int32Array(input.length);
    for (let i = 0; i < input.length; i++) {
      downcasted[i] = Number(input[i]); // May lose precision
    }
    return downcasted;
  }
  return input;
}
