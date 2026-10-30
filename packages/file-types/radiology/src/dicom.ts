/* eslint-disable no-plusplus */
import { log } from '@vitessce/globals';
import { type Volume, type VolumeArray, getRobustRange } from './volume.js';

/**
 * The attributes of a single-frame DICOM image needed to build a volume,
 * independent of how they were read (DICOMweb JSON or a Part 10 file).
 */
export interface DicomImage {
  rows: number;
  columns: number;
  bitsAllocated: number;
  bitsStored: number;
  pixelRepresentation: number;
  samplesPerPixel: number;
  photometricInterpretation: string;
  numberOfFrames: number;
  /** ImagePositionPatient: LPS position of the first voxel center, in millimeters. */
  position: number[];
  /** ImageOrientationPatient: row direction cosines, then column direction cosines. */
  orientation: number[];
  /** PixelSpacing: spacing between rows, then between columns, in millimeters. */
  pixelSpacing: number[];
  sliceThickness?: number;
  slope: number;
  intercept: number;
  windowCenter?: number;
  windowWidth?: number;
  seriesDescription?: string;
  modality?: string;
}

const ARRAY_TYPES = {
  8: [Uint8Array, Int8Array],
  16: [Uint16Array, Int16Array],
  32: [Uint32Array, Int32Array],
} as const;

const DTYPES = {
  8: ['Uint8', 'Int8'],
  16: ['Uint16', 'Int16'],
  32: ['Uint32', 'Int32'],
} as const;

function cross(a: number[], b: number[]) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

function dot(a: number[], b: number[]) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function validate(images: DicomImage[]) {
  if (images.length === 0) {
    throw new Error('The DICOM series contains no images.');
  }
  const [first] = images;
  if (first.samplesPerPixel !== 1) {
    throw new Error('Only grayscale DICOM images (SamplesPerPixel = 1) are supported.');
  }
  if (first.photometricInterpretation !== 'MONOCHROME2') {
    throw new Error(`DICOM PhotometricInterpretation ${first.photometricInterpretation} is not supported. Only MONOCHROME2 is supported.`);
  }
  if (!(first.bitsAllocated in ARRAY_TYPES)) {
    throw new Error(`DICOM BitsAllocated ${first.bitsAllocated} is not supported.`);
  }
  images.forEach((image) => {
    if (image.numberOfFrames > 1) {
      throw new Error('Multi-frame DICOM images are not supported.');
    }
    if (image.position?.length !== 3 || image.orientation?.length !== 6) {
      throw new Error('DICOM images must have ImagePositionPatient and ImageOrientationPatient.');
    }
  });
}

/**
 * Keep the largest group of images that can be stacked: same dimensions,
 * pixel format, and orientation. Series often include a few other images,
 * such as localizers.
 */
function getMainStack<T extends DicomImage>(images: T[]) {
  const groups = new Map<string, T[]>();
  images.forEach((image) => {
    const key = [
      image.rows, image.columns, image.bitsAllocated, image.pixelRepresentation,
      ...image.orientation.map(v => v.toFixed(3)),
    ].join();
    groups.set(key, [...(groups.get(key) ?? []), image]);
  });
  const stack = [...groups.values()].reduce((a, b) => (b.length > a.length ? b : a));
  if (stack.length < images.length) {
    log.warn(`Skipped ${images.length - stack.length} DICOM images that do not match the rest of the series, such as localizers.`);
  }
  return stack;
}

/**
 * Sort the images of a series into a volume.
 * @param images The images of one series, in any order.
 * @param loadPixels Load the raw (uncompressed, little-endian) pixel data of an image.
 */
export async function toVolume<T extends DicomImage>(
  images: T[],
  loadPixels: (image: T) => Promise<ArrayBuffer>,
): Promise<Volume> {
  validate(images);
  const stack = getMainStack(images);
  const [first] = stack;
  const rowDirection = first.orientation.slice(0, 3);
  const columnDirection = first.orientation.slice(3, 6);
  const normal = cross(rowDirection, columnDirection);

  // Order slices along the normal; instance numbers are not reliable.
  const sorted = [...stack].sort((a, b) => dot(a.position, normal) - dot(b.position, normal));
  const gaps = sorted.slice(1).map((image, i) => (
    dot(image.position, normal) - dot(sorted[i].position, normal)
  ));
  if (gaps.some(gap => gap < 1e-3)) {
    throw new Error('The DICOM series has more than one image at the same position. Is it a multi-echo or multi-phase series?');
  }
  const sliceSpacing = gaps.length > 0 ? median(gaps) : (first.sliceThickness || 1);
  if (gaps.some(gap => Math.abs(gap - sliceSpacing) > sliceSpacing * 0.01)) {
    log.warn('The DICOM series has uneven slice spacing. Slices are displayed evenly spaced.');
  }

  const [rowSpacing, columnSpacing] = first.pixelSpacing?.length === 2
    ? first.pixelSpacing
    : [1, 1];
  const affine = [0, 1, 2].map(w => [
    rowDirection[w] * columnSpacing,
    columnDirection[w] * rowSpacing,
    normal[w] * sliceSpacing,
    sorted[0].position[w],
  ]);

  const isSigned = first.pixelRepresentation === 1 ? 1 : 0;
  const bits = first.bitsAllocated as keyof typeof ARRAY_TYPES;
  const ArrayType = ARRAY_TYPES[bits][isSigned];
  const maxStored = 2 ** first.bitsStored;
  const rawRange: [number, number] = isSigned
    ? [-maxStored / 2, maxStored / 2 - 1]
    : [0, maxStored - 1];

  // Some series (often PET) use a different rescale per slice.
  // Those slices are rescaled here instead, into Float32.
  const hasUniformRescale = sorted.every(
    image => image.slope === first.slope && image.intercept === first.intercept,
  );
  async function loadRawSlice(z: number): Promise<VolumeArray> {
    const image = sorted[z];
    const raw = new ArrayType(await loadPixels(image), 0, first.rows * first.columns);
    if (hasUniformRescale) {
      return raw;
    }
    return Float32Array.from(raw, v => v * image.slope + image.intercept);
  }
  const slope = hasUniformRescale ? first.slope : 1;
  const intercept = hasUniformRescale ? first.intercept : 0;

  let window: [number, number];
  if (first.windowCenter !== undefined && first.windowWidth) {
    window = [
      first.windowCenter - first.windowWidth / 2,
      first.windowCenter + first.windowWidth / 2,
    ];
  } else {
    const middle = await loadRawSlice(Math.floor(sorted.length / 2));
    window = getRobustRange(middle, slope, intercept);
  }

  const name = first.seriesDescription || first.modality || 'DICOM series';
  return {
    name,
    channelName: first.modality || name,
    width: first.columns,
    height: first.rows,
    depth: sorted.length,
    numT: 1,
    affine,
    rawDtype: hasUniformRescale ? DTYPES[bits][isSigned] : 'Float32',
    rawRange,
    slope,
    intercept,
    window,
    loadRawSlice,
  };
}
