/* eslint-disable no-plusplus */
import { log } from '@vitessce/globals';

export type VolumeDtype = 'Uint8' | 'Int8' | 'Uint16' | 'Int16' | 'Uint32' | 'Int32' | 'Float32';

export type VolumeArray = Uint8Array | Int8Array | Uint16Array | Int16Array
  | Uint32Array | Int32Array | Float32Array | Float64Array;

const ARRAY_TYPES = {
  Uint8: Uint8Array,
  Int8: Int8Array,
  Uint16: Uint16Array,
  Int16: Int16Array,
  Uint32: Uint32Array,
  Int32: Int32Array,
  Float32: Float32Array,
};

/**
 * A single-channel volume, described independently of its file format.
 */
export interface Volume {
  name: string;
  channelName: string;
  width: number;
  height: number;
  depth: number;
  numT: number;
  /**
   * 3 rows (LPS x, y, z in millimeters) by 4 columns (i, j, k, origin).
   * Maps a voxel index to the patient-space position of the voxel center.
   */
  affine: number[][];
  /** Typed array type of the raw slices, or 'Float64'. */
  rawDtype: VolumeDtype | 'Float64';
  /** Smallest and largest raw values the volume can contain. */
  rawRange: [number, number];
  /** Modality LUT: displayed value = raw * slope + intercept. */
  slope: number;
  intercept: number;
  /** Default window in displayed (rescaled) units. */
  window: [number, number];
  /** Load one slice in array order (row-major, x fastest). */
  loadRawSlice: (z: number, t: number) => Promise<VolumeArray>;
}

/**
 * Choose the typed array that holds rescaled values without loss.
 * Values that stay integral and fit in 16 bits (such as CT in Hounsfield units)
 * use Int16, so they cost no more memory than the raw data.
 */
export function getOutputDtype(
  rawDtype: Volume['rawDtype'],
  rawRange: [number, number],
  slope: number,
  intercept: number,
): VolumeDtype {
  if (slope === 1 && intercept === 0 && rawDtype !== 'Float64') {
    return rawDtype;
  }
  const isIntegral = rawDtype !== 'Float32' && rawDtype !== 'Float64'
    && Number.isInteger(slope) && Number.isInteger(intercept);
  const ends = rawRange.map(v => v * slope + intercept);
  if (isIntegral && Math.min(...ends) >= -32768 && Math.max(...ends) <= 32767) {
    return 'Int16';
  }
  return 'Float32';
}

/**
 * 2nd to 98th percentile of the rescaled values, estimated from a sample.
 * Similar to the default window used by Niivue when cal_min and cal_max are unset.
 */
export function getRobustRange(
  values: VolumeArray, slope: number, intercept: number,
): [number, number] {
  const step = Math.max(1, Math.floor(values.length / 100_000));
  const sample: number[] = [];
  for (let i = 0; i < values.length; i += step) {
    if (!Number.isNaN(values[i])) sample.push(values[i] * slope + intercept);
  }
  sample.sort((a, b) => a - b);
  return [
    sample[Math.floor(sample.length * 0.02)],
    sample[Math.floor(sample.length * 0.98)],
  ];
}

/**
 * Copy a raw slice into display order, applying the modality LUT and axis flips.
 * Returns the input unchanged when there is nothing to do.
 */
export function toDisplaySlice(
  raw: VolumeArray,
  {
    width, height, slope, intercept, dtype, isFlippedX, isFlippedY,
  }: {
    width: number; height: number; slope: number; intercept: number;
    dtype: VolumeDtype; isFlippedX: boolean; isFlippedY: boolean;
  },
): VolumeArray {
  const ArrayType = ARRAY_TYPES[dtype];
  if (raw instanceof ArrayType && slope === 1 && intercept === 0 && !isFlippedX && !isFlippedY) {
    return raw;
  }
  const out = new ArrayType(width * height);
  for (let y = 0; y < height; y++) {
    const srcRow = (isFlippedY ? height - 1 - y : y) * width;
    const dstRow = y * width;
    for (let x = 0; x < width; x++) {
      out[dstRow + x] = raw[srcRow + (isFlippedX ? width - 1 - x : x)] * slope + intercept;
    }
  }
  return out;
}

/**
 * Display space is patient space (LPS, millimeters) with z negated:
 * x increases toward patient left, y toward posterior, z toward inferior.
 * With deck.gl's y-down view, this gives the radiological convention for
 * axial slices (patient right on screen left, anterior at the top),
 * and puts superior at the top of coronal and sagittal slices.
 */
const DISPLAY_SIGNS = [1, 1, -1];

// Directions more than ~2.5 degrees off a display axis count as oblique.
const OBLIQUE_TOLERANCE = 1e-3;

/**
 * Snap each array axis to the display axis it points along, so that
 * the image can be drawn with a scale-and-translate model matrix.
 * Axes pointing in the negative direction are flipped (the pixel data
 * must be flipped to match), so that every scale is positive.
 * Rotation is dropped, which only matters for oblique acquisitions.
 */
export function getDisplayGeometry(affine: number[][], shape: [number, number, number]) {
  const axes = [0, 1, 2].map((i) => {
    const direction = [0, 1, 2].map(w => affine[w][i] * DISPLAY_SIGNS[w]);
    const spacing = Math.hypot(...direction);
    const magnitudes = direction.map(Math.abs);
    const displayAxis = magnitudes.indexOf(Math.max(...magnitudes));
    return {
      direction,
      spacing,
      displayAxis,
      isFlipped: direction[displayAxis] < 0,
      isOblique: magnitudes[displayAxis] < spacing * (1 - OBLIQUE_TOLERANCE),
    };
  });
  if (new Set(axes.map(a => a.displayAxis)).size !== 3) {
    throw new Error('Image axes are not linearly independent.');
  }
  // Display-space center of the voxel that becomes index 0 after flipping.
  const firstVoxelCenter = [0, 1, 2].map(w => axes.reduce(
    (sum, a, i) => sum + (a.isFlipped ? a.direction[w] * (shape[i] - 1) : 0),
    affine[w][3] * DISPLAY_SIGNS[w],
  ));
  return {
    scale: axes.map(a => a.spacing),
    // Viv draws voxel i over [i, i + 1], so shift by half a voxel to center it.
    translation: axes.map(a => firstVoxelCenter[a.displayAxis] - a.spacing / 2),
    flips: axes.map(a => a.isFlipped),
    isOblique: axes.some(a => a.isOblique),
  };
}

/**
 * OME-NGFF metadata that ImageWrapper understands,
 * so that radiology volumes need no special handling in views.
 * Spatial views assume micrometers (for example, in the scale bar),
 * so millimeters are converted.
 */
export function toNgffMetadata(
  volume: Volume,
  geometry: ReturnType<typeof getDisplayGeometry>,
) {
  const [sx, sy, sz] = geometry.scale.map(v => v * 1000);
  // The z translation is dropped: 2D views draw the selected slice at z = 0,
  // and scanner table positions (often meters) would put the image
  // past the camera's far plane.
  // ponytail: 3D views lose z alignment between series; restore it when overlays need it.
  const [tx, ty] = geometry.translation.map(v => v * 1000);
  const tz = 0;
  return {
    multiscales: [{
      name: volume.name,
      axes: [
        { name: 't', type: 'time' },
        { name: 'c', type: 'channel' },
        { name: 'z', type: 'space', unit: 'micrometer' },
        { name: 'y', type: 'space', unit: 'micrometer' },
        { name: 'x', type: 'space', unit: 'micrometer' },
      ],
      datasets: [{
        path: '0',
        coordinateTransformations: [
          { type: 'scale', scale: [1, 1, sz, sy, sx] },
          { type: 'translation', translation: [0, 0, tz, ty, tx] },
        ],
      }],
    }],
    omero: {
      name: volume.name,
      channels: [{
        label: volume.channelName,
        color: 'FFFFFF',
        window: { start: volume.window[0], end: volume.window[1] },
      }],
      rdefs: {
        defaultT: 0,
        defaultZ: Math.floor(volume.depth / 2),
        model: 'greyscale',
      },
    },
  };
}

/**
 * A single-resolution Viv PixelSource over a volume, loading slices on demand.
 * Spatial views draw single-resolution images with Viv's ImageLayer (2D)
 * or VolumeLayer (3D), which both call getRaster only.
 */
export function createSliceSource(
  volume: Volume,
  geometry: ReturnType<typeof getDisplayGeometry>,
  dtype: VolumeDtype,
) {
  const {
    width, height, depth, numT, slope, intercept,
  } = volume;
  const [isFlippedX, isFlippedY, isFlippedZ] = geometry.flips;
  // ponytail: unbounded cache, at most one full volume per image. Add an LRU if memory matters.
  const cache = new Map<number, Promise<VolumeArray>>();

  function getSlice(z: number, t: number) {
    const key = t * depth + z;
    let slice = cache.get(key);
    if (!slice) {
      slice = volume.loadRawSlice(isFlippedZ ? depth - 1 - z : z, t)
        .then(raw => toDisplaySlice(raw, {
          width, height, slope, intercept, dtype, isFlippedX, isFlippedY,
        }));
      // Allow a failed slice to be requested again.
      slice.catch(() => cache.delete(key));
      cache.set(key, slice);
    }
    return slice;
  }

  async function getRaster({ selection }: { selection: { z?: number; t?: number } }) {
    const slice = await getSlice(selection.z ?? 0, selection.t ?? 0);
    // Return a copy: callers may modify rasters in place
    // (Viv's getChannelStats reorders values to find quantiles).
    return { data: slice.slice(), width, height };
  }

  return {
    labels: ['t', 'c', 'z', 'y', 'x'],
    shape: [numT, 1, depth, height, width],
    dtype,
    tileSize: 2 ** Math.ceil(Math.log2(Math.max(width, height))),
    getRaster,
    // Only reached by multiscale layers; the single tile covers the whole slice.
    getTile: getRaster,
    onTileError: (err: Error) => log.error(err),
  };
}
