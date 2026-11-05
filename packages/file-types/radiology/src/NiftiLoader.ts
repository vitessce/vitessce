/* eslint-disable no-plusplus */
import {
  isCompressed, decompressAsync, isNIFTI, readHeader, readImage,
} from 'nifti-reader-js';
import { VolumeLoader } from './VolumeLoader.js';
import { type Volume, type VolumeArray, getRobustRange } from './volume.js';

// Scalar NIfTI datatype codes. RGB and complex data are not supported.
const NIFTI_DTYPES = {
  2: ['Uint8', Uint8Array],
  4: ['Int16', Int16Array],
  8: ['Int32', Int32Array],
  16: ['Float32', Float32Array],
  64: ['Float64', Float64Array],
  256: ['Int8', Int8Array],
  512: ['Uint16', Uint16Array],
  768: ['Uint32', Uint32Array],
} as const;

function getRange(values: VolumeArray): [number, number] {
  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < values.length; i++) {
    // Comparisons with NaN are false, so NaN values are skipped.
    if (values[i] < min) min = values[i];
    if (values[i] > max) max = values[i];
  }
  return [min, max];
}

export class NiftiLoader extends VolumeLoader {
  async loadVolume(): Promise<Volume> {
    const { url, requestInit } = this;
    if (!url) {
      throw new Error('The image.nifti file type requires a url.');
    }
    const res = await fetch(url, requestInit);
    if (!res.ok) {
      throw new Error(`NIfTI file failed to load: ${res.status} from ${res.url}`);
    }
    let buffer = await res.arrayBuffer();
    if (isCompressed(buffer)) {
      buffer = await decompressAsync(buffer);
    }
    if (!isNIFTI(buffer)) {
      throw new Error(`${url} is not a NIfTI-1 or NIfTI-2 file.`);
    }
    const header = readHeader(buffer);
    if (!header.littleEndian) {
      throw new Error('Big-endian NIfTI files are not supported.');
    }
    const dtypeInfo = NIFTI_DTYPES[header.datatypeCode as keyof typeof NIFTI_DTYPES];
    if (!dtypeInfo) {
      throw new Error(`NIfTI datatype ${header.datatypeCode} is not supported. Only scalar data can be displayed.`);
    }
    const [rawDtype, ArrayType] = dtypeInfo;

    // dims[0] is the number of dimensions; entries past it are meaningless.
    const [width, height, depth, numT] = [1, 2, 3, 4]
      .map(i => (i <= header.dims[0] && header.dims[i] > 0 ? header.dims[i] : 1));
    const values = new ArrayType(readImage(header, buffer), 0, width * height * depth * numT);

    // A slope of zero means the values are not scaled.
    const slope = header.scl_slope || 1;
    const intercept = header.scl_slope && Number.isFinite(header.scl_inter) ? header.scl_inter : 0;
    const name = url.split(/[?#]/)[0].split('/').pop()?.replace(/\.nii(\.gz)?$/, '') || 'Image';
    const sliceLength = width * height;

    return {
      name,
      channelName: name,
      width,
      height,
      depth,
      numT,
      // NIfTI affines map to RAS. Negate the x and y rows to get LPS.
      affine: header.affine.slice(0, 3).map((row, w) => (w < 2 ? row.map(v => -v) : row)),
      rawDtype,
      rawRange: getRange(values),
      slope,
      intercept,
      window: header.cal_max > header.cal_min
        ? [header.cal_min, header.cal_max]
        : getRobustRange(values, slope, intercept),
      loadRawSlice: async (z, t) => {
        const start = (t * depth + z) * sliceLength;
        return values.subarray(start, start + sliceLength);
      },
    };
  }
}
