import { log } from '@vitessce/globals';
import {
  type Volume, type VolumeArray, type VolumeDtype, ARRAY_TYPES, getRobustRange,
} from './volume.js';

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
  /** For color images: 0 when samples are interleaved (RGBRGB...), 1 when in planes. */
  planarConfiguration: number;
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
  /**
   * Whether this is a frame of a multi-frame image without per-frame positions,
   * such as an ultrasound cine loop. These frames are time points of one slice.
   */
  isTimePoint?: boolean;
}

/**
 * Reads the attributes of a DICOM data set, from DICOM JSON or a Part 10 file.
 * Tags are 8 uppercase hex digits, such as '0008103E'.
 */
export interface DicomAttributes {
  string: (tag: string) => string | undefined;
  /** Values of a decimal or integer string (DS or IS), or numbers in DICOM JSON. */
  numbers: (tag: string) => number[] | undefined;
  /** Value of an unsigned short (US). */
  uint16: (tag: string) => number | undefined;
  /** Items of a sequence. */
  items: (tag: string) => DicomAttributes[] | undefined;
}

export function readImage({ string, numbers, uint16 }: DicomAttributes): DicomImage {
  return {
    modality: string('00080060'),
    seriesDescription: string('0008103E'),
    sliceThickness: numbers('00180050')?.[0],
    position: numbers('00200032') ?? [],
    orientation: numbers('00200037') ?? [],
    samplesPerPixel: uint16('00280002') ?? 1,
    photometricInterpretation: string('00280004') ?? 'MONOCHROME2',
    planarConfiguration: uint16('00280006') ?? 0,
    numberOfFrames: numbers('00280008')?.[0] ?? 1,
    rows: uint16('00280010') ?? 0,
    columns: uint16('00280011') ?? 0,
    // Projection radiographs have ImagerPixelSpacing instead of PixelSpacing.
    pixelSpacing: numbers('00280030') ?? numbers('00181164') ?? [],
    bitsAllocated: uint16('00280100') ?? 16,
    bitsStored: uint16('00280101') ?? 16,
    pixelRepresentation: uint16('00280103') ?? 0,
    windowCenter: numbers('00281050')?.[0],
    windowWidth: numbers('00281051')?.[0],
    intercept: numbers('00281052')?.[0] ?? 0,
    slope: numbers('00281053')?.[0] ?? 1,
  };
}

// Functional group sequences of multi-frame images (DICOM PS3.3 C.7.6.16).
const PER_FRAME_GROUPS = '52009230';
const SHARED_GROUPS = '52009229';

/**
 * Split a multi-frame image into one image per frame, with the geometry and
 * rescaling of each frame from its functional groups (falling back to the
 * attributes of the whole image). Frames without per-frame functional groups
 * are time points.
 */
export function readFrames<T extends DicomImage>(attributes: DicomAttributes, image: T) {
  if (image.numberOfFrames === 1) {
    return [{ ...image, frameIndex: 0 }];
  }
  const perFrame = attributes.items(PER_FRAME_GROUPS);
  if (!perFrame) {
    return Array.from({ length: image.numberOfFrames }, (_, frameIndex) => ({
      ...image, numberOfFrames: 1, frameIndex, isTimePoint: true,
    }));
  }
  const shared = attributes.items(SHARED_GROUPS)?.[0];
  return Array.from({ length: image.numberOfFrames }, (_, frameIndex) => {
    // A per-frame functional group takes precedence over the shared one.
    const values = (sequenceTag: string, tag: string) => {
      const group = perFrame[frameIndex]?.items(sequenceTag) ?? shared?.items(sequenceTag);
      return group?.[0]?.numbers(tag);
    };
    return {
      ...image,
      numberOfFrames: 1,
      frameIndex,
      position: values('00209113', '00200032') ?? image.position,
      orientation: values('00209116', '00200037') ?? image.orientation,
      pixelSpacing: values('00289110', '00280030') ?? image.pixelSpacing,
      sliceThickness: values('00289110', '00180050')?.[0] ?? image.sliceThickness,
      intercept: values('00289145', '00281052')?.[0] ?? image.intercept,
      slope: values('00289145', '00281053')?.[0] ?? image.slope,
      windowCenter: values('00289132', '00281050')?.[0] ?? image.windowCenter,
      windowWidth: values('00289132', '00281051')?.[0] ?? image.windowWidth,
    };
  });
}

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

function hasGeometry(image: DicomImage) {
  return image.position.length === 3 && image.orientation.length === 6;
}

// Photometric interpretations that are decoded to RGB. JPEG 2000 decoders convert
// YBR_ICT and YBR_RCT, and the YBR_FULL family is converted after decoding.
const COLOR_INTERPRETATIONS = ['RGB', 'YBR_FULL', 'YBR_FULL_422', 'YBR_ICT', 'YBR_RCT'];

function validate(images: DicomImage[]) {
  if (images.length === 0) {
    throw new Error('The DICOM series contains no images.');
  }
  const [first] = images;
  const { samplesPerPixel, photometricInterpretation, bitsAllocated } = first;
  const isGrayscale = samplesPerPixel === 1
    && ['MONOCHROME1', 'MONOCHROME2'].includes(photometricInterpretation);
  const isColor = samplesPerPixel === 3
    && COLOR_INTERPRETATIONS.includes(photometricInterpretation);
  if (!isGrayscale && !isColor) {
    throw new Error(`DICOM images with PhotometricInterpretation ${photometricInterpretation} and SamplesPerPixel ${samplesPerPixel} are not supported.`);
  }
  if (![8, 16, 32].includes(bitsAllocated)
    || (photometricInterpretation.startsWith('YBR_FULL') && bitsAllocated !== 8)) {
    throw new Error(`DICOM ${photometricInterpretation} images with BitsAllocated ${bitsAllocated} are not supported.`);
  }
  if (images.length > 1 && !images.every(image => hasGeometry(image) || image.isTimePoint)) {
    throw new Error('DICOM images must have ImagePositionPatient and ImageOrientationPatient.');
  }
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
      image.rows, image.columns, image.samplesPerPixel, image.bitsAllocated,
      image.pixelRepresentation,
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
  const isTimeSeries = images.length > 1 && images.every(image => image.isTimePoint);
  // A single image (or a cine loop), such as a radiograph, may have no position in the patient.
  const stack = (images.length === 1 || isTimeSeries) && !hasGeometry(images[0])
    ? images.map(image => ({ ...image, position: [0, 0, 0], orientation: [1, 0, 0, 0, 1, 0] }))
    : getMainStack(images);
  const [first] = stack;
  const rowDirection = first.orientation.slice(0, 3);
  const columnDirection = first.orientation.slice(3, 6);
  const normal = cross(rowDirection, columnDirection);

  // Order slices along the normal; instance numbers are not reliable.
  // Time points keep their frame order.
  const sorted = isTimeSeries
    ? stack
    : [...stack].sort((a, b) => dot(a.position, normal) - dot(b.position, normal));
  const gaps = isTimeSeries ? [] : sorted.slice(1).map((image, i) => (
    dot(image.position, normal) - dot(sorted[i].position, normal)
  ));
  const depth = isTimeSeries ? 1 : sorted.length;
  if (gaps.some(gap => gap < 1e-3)) {
    throw new Error('The DICOM series has more than one image at the same position. Is it a multi-echo or multi-phase series?');
  }
  const sliceSpacing = gaps.length > 0 ? median(gaps) : (first.sliceThickness || 1);
  if (gaps.some(gap => Math.abs(gap - sliceSpacing) > sliceSpacing * 0.01)) {
    log.warn('The DICOM series has uneven slice spacing. Slices are displayed evenly spaced.');
  }

  // Some radiographs have a PixelSpacing of 0 when it is unknown.
  const [rowSpacing, columnSpacing] = first.pixelSpacing.length === 2
    && first.pixelSpacing.every(v => v > 0)
    ? first.pixelSpacing
    : [1, 1];
  const affine = [0, 1, 2].map(w => [
    rowDirection[w] * columnSpacing,
    columnDirection[w] * rowSpacing,
    normal[w] * sliceSpacing,
    sorted[0].position[w],
  ]);

  const isSigned = first.pixelRepresentation === 1;
  const storedDtype = `${isSigned ? 'Int' : 'Uint'}${first.bitsAllocated}` as VolumeDtype;
  const ArrayType = ARRAY_TYPES[storedDtype];
  const maxStored = 2 ** first.bitsStored;
  const rawRange: [number, number] = isSigned
    ? [-maxStored / 2, maxStored / 2 - 1]
    : [0, maxStored - 1];

  // Some series (often PET) use a different rescale per slice.
  // Those slices are rescaled here instead, into Float32.
  const hasUniformRescale = sorted.every(
    image => image.slope === first.slope && image.intercept === first.intercept,
  );
  async function loadRawSlice(z: number, t: number): Promise<VolumeArray> {
    const image = sorted[isTimeSeries ? t : z];
    const raw = new ArrayType(
      await loadPixels(image),
      0,
      first.rows * first.columns * first.samplesPerPixel,
    );
    if (hasUniformRescale) {
      return raw;
    }
    return Float32Array.from(raw, v => v * image.slope + image.intercept);
  }
  let slope = hasUniformRescale ? first.slope : 1;
  let intercept = hasUniformRescale ? first.intercept : 0;

  // Color values are shown as stored, and need no window.
  const isRgb = first.samplesPerPixel === 3;
  let window: [number, number];
  if (isRgb) {
    window = rawRange;
  } else if (first.windowCenter !== undefined && first.windowWidth) {
    window = [
      first.windowCenter - first.windowWidth / 2,
      first.windowCenter + first.windowWidth / 2,
    ];
  } else {
    const middle = await loadRawSlice(Math.floor(depth / 2), 0);
    window = getRobustRange(middle, slope, intercept);
  }
  if (first.photometricInterpretation === 'MONOCHROME1') {
    // The smallest values are white. Invert the values, keeping their range.
    const [min, max] = rawRange.map(v => v * slope + intercept);
    slope = -slope;
    intercept = min + max - intercept;
    window = [min + max - window[1], min + max - window[0]];
  }

  const name = first.seriesDescription || first.modality || 'DICOM series';
  return {
    name,
    channelName: first.modality || name,
    isRgb,
    width: first.columns,
    height: first.rows,
    depth,
    numT: isTimeSeries ? sorted.length : 1,
    affine,
    rawDtype: hasUniformRescale ? storedDtype : 'Float32',
    rawRange,
    slope,
    intercept,
    window,
    loadRawSlice,
  };
}
