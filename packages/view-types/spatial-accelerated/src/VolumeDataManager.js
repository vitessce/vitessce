/* eslint-disable no-bitwise */
/* eslint-disable no-underscore-dangle */
/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
import {
  Data3DTexture,
  RedFormat,
  RedIntegerFormat,
  UnsignedByteType,
  UnsignedIntType,
  LinearFilter,
  NearestFilter,
} from 'three';
import { log, atLeastLogLevel, LogLevel } from '@vitessce/globals';
import {
  planVolumeLevels,
  decodedBytesPerBrick,
  createVolumeBrickSource,
  createZarrRegionReader,
  getBytesPerElement,
} from './volume-zarr.js';
import {
  getTiffLevelArrays,
  createTiffRegionReader,
  getTiffSampleRange,
} from './volume-tiff.js';

// NOTES:
// 2048 x 2048 x 32 = 4096 bricks, around 134 MB
// 2048 x 2048 x 64 = 8192 bricks, around 268 MB
// 2048 x 2048 x 128 = 16384 bricks, around 537 MB **
// 2048 x 2048 x 256 = 32768 bricks, around 1.074 GB
// 2048 x 2048 x 512 = 65536 bricks, around 2.148 GB
// 2048 x 2048 x 1024 = 131072 bricks, around 4.295 GB

// Default chunk sizes
// const CHUNK_SIZE = 32;
// const CHUNK_TOTAL_SIZE = 32768; // 32*32*32 = 32768
const BRICK_SIZE = 32;
const BRICK_CACHE_SIZE_X = 64;
const BRICK_CACHE_SIZE_Y = 64;
const BRICK_CACHE_SIZE_Z = 4;
const TOTAL_NUM_BRICKS = BRICK_CACHE_SIZE_X * BRICK_CACHE_SIZE_Y * BRICK_CACHE_SIZE_Z;

const BRICK_CACHE_SIZE_VOXELS_X = BRICK_CACHE_SIZE_X * BRICK_SIZE;
const BRICK_CACHE_SIZE_VOXELS_Y = BRICK_CACHE_SIZE_Y * BRICK_SIZE;
const BRICK_CACHE_SIZE_VOXELS_Z = BRICK_CACHE_SIZE_Z * BRICK_SIZE;

const PAGE_TABLE_ADDRESS_SIZE = 'uint32';
const BRICK_CACHE_ADDRESS_SIZE = 'uint16';

const MAX_RESOLUTION_LEVELS = 10; // [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
const MAX_CHANNELS = 7; // [0, 1, 2, 3, 4, 5, 6]
const MAX_DECODED_BYTES_PER_BRICK = 32 * (2 ** 20); // starting value, not measured
// Bricks fetched at once. Each keeps at most 32 source planes in flight, and each
// is within MAX_DECODED_BYTES_PER_BRICK, so peak decoding stays bounded.
const BRICK_FETCH_CONCURRENCY = 6;

// const manualChannelSelection = 0;

// Add a constant for initialization status
export const INIT_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETE: 'complete',
  FAILED: 'failed',
};

function logWithColor(message) {
  if (atLeastLogLevel(LogLevel.DEBUG)) {
    console.warn(`%cDM: ${message}`, 'background: blue; color: white; padding: 2px; border-radius: 3px;');
  }
}


/* Begin extracted functions */
/**
 * The source resolution levels of an image, and how to read them, by image type.
 * @param {object} imageWrapper ImageWrapper of an OME-Zarr or OME-TIFF image.
 * @returns {{ labels: string[], arrays: object[], datasets: object[],
 *   createRegionReader: function }} arrays have shape and chunks per level;
 * datasets are the NGFF multiscale datasets (empty for OME-TIFF).
 */
export function _getVolumeSources(imageWrapper) {
  const type = imageWrapper?.getType();
  if (type === 'ome-tiff') {
    // viv's TiffPixelSource per level; bricks are read tile by tile.
    const { data } = imageWrapper.vivLoader;
    const pixelSources = Array.isArray(data) ? data : [data];
    return {
      labels: pixelSources[0].labels,
      arrays: getTiffLevelArrays(pixelSources),
      datasets: [],
      createRegionReader: createTiffRegionReader,
    };
  }
  if (type === 'ome-zarr') {
    const { multiscales } = imageWrapper.vivLoader.metadata;
    if (!multiscales) {
      throw new Error('Expected multiscales metadata in group.attrs');
    }
    // Physical sizes come from the model matrix, not from vivData meta.
    const vivData = imageWrapper.getData();
    if (!Array.isArray(vivData) || vivData.length < 1) {
      throw new Error('Not a multiresolution loader');
    }
    return {
      labels: vivData[0].labels,
      // TODO: add a better getter to ImageWrapper to avoid accessing the private _data field here?
      arrays: vivData.map(resolutionData => resolutionData._data),
      datasets: multiscales[0].datasets,
      createRegionReader: createZarrRegionReader,
    };
  }
  throw new Error('Invalid imageWrapper or not an OME-Zarr or OME-TIFF image');
}

/**
 * Level-0 voxel spacing, ZYX. Combines the column-major model matrix (dataset and
 * multiscale transforms, plus any from the file options) with the non-standard
 * root-level coordinateTransformations that the converter datasets (kingsnake,
 * f8ii, melanoma) use for their physical spacing and that the model matrix ignores.
 * @param {number[]} modelMatrix From ImageWrapper.getModelMatrix().
 * @param {object} ngffMetadata The root .zattrs.
 * @returns {[number, number, number]}
 */
export function _getVoxelSpacing(modelMatrix, ngffMetadata) {
  const spacing = [8, 4, 0].map(i => Math.hypot(
    modelMatrix[i], modelMatrix[i + 1], modelMatrix[i + 2],
  ) || 1);
  const rootScale = ngffMetadata?.coordinateTransformations
    ?.find(t => t.type === 'scale')?.scale;
  if (rootScale?.length >= 3) {
    rootScale.slice(-3).forEach((value, axis) => {
      if (Number.isFinite(value) && value > 0) spacing[axis] *= value;
    });
  }
  return spacing;
}

/**
 * Range of the finite values of a brick, as a uint8 storage range fallback.
 * @param {TypedArray} data
 * @returns {[number, number]} [min, max], with max > min.
 */
export function _getDataRange(data) {
  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < data.length; i++) {
    const v = data[i];
    if (v < min) min = v;
    if (v > max) max = v;
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [0, 1];
  return max > min ? [min, max] : [min, min + 1];
}

/**
 * Map values to uint8: clamp to [min, max], then scale to 0-255.
 * NaN maps to 0.
 * @param {TypedArray} data
 * @param {number} min
 * @param {number} max
 * @returns {Uint8Array}
 */
export function _toUint8(data, min, max) {
  const out = new Uint8Array(data.length);
  const range = (max - min) || 1;
  for (let i = 0; i < data.length; i++) {
    const clamped = Math.max(min, Math.min(max, data[i]));
    // Same operation order as before for uint16, so max maps to exactly 255.
    out[i] = ((clamped - min) * 255 / range) | 0; // NaN | 0 is 0
  }
  return out;
}

/**
 * Value range mapped to 0-255 when converting uint16 bricks to uint8.
 * Prefers the OMERO display window (start/end) over the full data range
 * (min/max), which is often the whole dtype range, e.g. 0-65535 in IDR files.
 * @param {object} omero The omero metadata of the image.
 * @param {number} channel The Zarr channel index.
 * @returns {[number, number]}
 */
export function _getChannelWindow(omero, channel) {
  const window = omero?.channels?.[channel]?.window;
  const start = window?.start ?? window?.min ?? 0;
  const end = window?.end ?? window?.max ?? 65535;
  return end > start ? [start, end] : [0, 65535];
}

export function _resolutionStatsToShapes(multiResolutionStats) {
  return multiResolutionStats.map((stats) => {
    const { dims } = stats;
    const shape = [
      // Other spatial-accelerated code assumes TCZYX dimension order
      dims.t, // TODO: standardize lowercase/uppercase dim names at store-level
      dims.c, // TODO: handle case when dimension(s) are missing
      dims.z,
      dims.y,
      dims.x,
    ];
    return shape;
  });
}
export function _resolutionStatsToBrickLayout(multiResolutionStats) {
  return multiResolutionStats.map((stats) => {
    const shape = [
      stats.depth, // z
      stats.height, // y
      stats.width, // x
    ];
    // TODO: abstract chunkSize to always be 32x32x32 at store-level
    // const chunkSize = array0.chunks || [BRICK_SIZE, BRICK_SIZE, BRICK_SIZE];
    return [
      Math.ceil((shape[0] || 1) / BRICK_SIZE),
      Math.ceil((shape[1] || 1) / BRICK_SIZE),
      Math.ceil((shape[2] || 1) / BRICK_SIZE),
    ];
  });
}

/**
 *
 * @param {[number, number, number][]} zarrStoreBrickLayout
 * @param {number} channelsZarrMappingsLength
 */
export function _initMRMCPT(zarrStoreBrickLayout, channelsZarrMappingsLength) {
  log.debug('_initMRMCPT', zarrStoreBrickLayout, channelsZarrMappingsLength);
  // Page table
  const PT = {
    channelOffsets: [
      [0, 0, 1],
      [0, 1, 0],
      [0, 1, 1],
      [1, 0, 0],
      [1, 0, 1],
      [1, 1, 0],
      [1, 1, 1],
    ],
    anchors: [],
    offsets: [],
    xExtent: 0, // includes the offset inclusive
    yExtent: 0, // includes the offset inclusive
    zExtent: 0, // includes the offset inclusive
    z0Extent: 0, // l0 z extent
    zTotal: 0, // original z extent plus the l0 z extent times the channel count
  };

  // Calculate PT extents first
  PT.xExtent = 1;
  PT.yExtent = 1;
  PT.zExtent = 1;
  const l0z = zarrStoreBrickLayout[0][0]; // Get z extent from highest resolution
  PT.z0Extent = l0z;

  // log.debug('PT', PT);

  // log.debug('PT anchors', PT.anchors);

  // log.debug('PT anchors with 0', PT.anchors);

  PT.lowestDataRes = zarrStoreBrickLayout.length - 1;
  // log.debug('lowestDataRes', PT.lowestDataRes);

  // Sum up the extents from all resolution levels excluding the l0.
  // Channel copies of a level sit at 0 or at the anchor on each axis, so each
  // anchor must be at least the level's own extent; otherwise copies overlap
  // and _ptToZarr decodes the wrong channel. Halving pyramids ending in a single
  // brick already satisfy this; logical levels (e.g. XY-only pyramids) may not.
  for (let i = zarrStoreBrickLayout.length - 1; i > 0; i--) {
    const [zBricks, yBricks, xBricks] = zarrStoreBrickLayout[i];
    const anchor = [
      Math.max(PT.xExtent, xBricks),
      Math.max(PT.yExtent, yBricks),
      Math.max(PT.zExtent, zBricks),
    ];
    PT.anchors.push(anchor);
    PT.xExtent = anchor[0] + xBricks;
    PT.yExtent = anchor[1] + yBricks;
    PT.zExtent = anchor[2] + zBricks;
  }

  PT.anchors.push([0, 0, PT.zExtent]);
  PT.anchors.reverse();
  // Level 0 channels are stacked along z from x = y = 0; the table must fit them.
  PT.xExtent = Math.max(PT.xExtent, zarrStoreBrickLayout[0][2]);
  PT.yExtent = Math.max(PT.yExtent, zarrStoreBrickLayout[0][1]);

  // log.debug('PT anchors', PT.anchors);

  // Calculate total Z extent including channel offsets
  // PT.zTotal = PT.zExtent + (this.zarrStore.channelCount * l0z);
  PT.zTotal = PT.zExtent + channelsZarrMappingsLength * l0z;
  // log.debug('number of PT channels', channelsZarrMappingsLength);

  // log.debug('Page Table Extents:', {
  //   x: PT.xExtent,
  //   y: PT.yExtent,
  //   z: PT.zExtent,
  //   z0: PT.z0Extent,
  //   zTotal: PT.zTotal,
  // });

  // Initialize the BrickCache as a 3D texture (uint8)
  const brickCacheData = new Uint8Array(
    BRICK_CACHE_SIZE_VOXELS_X
      * BRICK_CACHE_SIZE_VOXELS_Y
      * BRICK_CACHE_SIZE_VOXELS_Z,
  );
  brickCacheData.fill(0);

  // Initialize the PageTable data using calculated extents
  const pageTableData = new Uint32Array(
    PT.xExtent * PT.yExtent * PT.zTotal,
  );
  pageTableData.fill(0);

  const bcTHREE = new Data3DTexture(
    brickCacheData,
    BRICK_CACHE_SIZE_VOXELS_X,
    BRICK_CACHE_SIZE_VOXELS_Y,
    BRICK_CACHE_SIZE_VOXELS_Z,
  );
  bcTHREE.format = RedFormat;
  bcTHREE.type = UnsignedByteType;
  bcTHREE.internalFormat = 'R8';
  // bcTHREE.minFilter = NearestFilter;
  // bcTHREE.magFilter = NearestFilter;
  bcTHREE.minFilter = LinearFilter;
  bcTHREE.magFilter = LinearFilter;
  bcTHREE.generateMipmaps = false;
  bcTHREE.needsUpdate = true;

  const ptTHREE = new Data3DTexture(
    pageTableData,
    PT.xExtent,
    PT.yExtent,
    PT.zTotal,
  );
  ptTHREE.format = RedIntegerFormat;
  ptTHREE.type = UnsignedIntType;
  ptTHREE.internalFormat = 'R32UI';
  ptTHREE.minFilter = NearestFilter;
  ptTHREE.magFilter = NearestFilter;
  ptTHREE.generateMipmaps = false;
  ptTHREE.needsUpdate = true;

  log.debug('_initMRMCPT', PT, ptTHREE, bcTHREE);

  return {
    PT,
    ptTHREE,
    bcTHREE,
  };
}


/* ------------------------------------------------------------- *
 * 3. Pack PT entry (flags | min | max | bcX | bcY | bcZ)        *
 * ------------------------------------------------------------- */
export function _packPT(min, max, bcX, bcY, bcZ) {
  // Scale down to 7-bit range (0-127) by dividing by 2
  const clamp7 = v => Math.max(0, Math.min(127, Math.floor(v / 2)));
  // log.debug('Scaled min/max:', clamp7(min), clamp7(max));
  return (
    (1 << 31) // bit‑31 = resident
    | (1 << 30) // bit‑30 = init‑done
    | (clamp7(min) << 23) // 7 bits
    | (clamp7(max) << 16) // 7 bits
    | ((bcX & 0x3F) << 10) // 6 bits
    | ((bcY & 0x3F) << 4) // 6 bits
    | (bcZ & 0x0F) // 4 bits
  ) >>> 0; // keep unsigned
}

// Pack PT entry indicating "not resident but init" with min/max preserved
// Note: this is not used anywhere?
/*
export function _packPTNotResident(min, max, bcX, bcY, bcZ) {
  // Scale down to 7-bit range (0-127) by dividing by 2
  const clamp7 = v => Math.max(0, Math.min(127, Math.floor(v / 2)));

  return (
    (0 << 31) // bit-31 = NOT resident
    | (1 << 30) // bit-30 = init-done
    | (clamp7(min) << 23) // 7 bits
    | (clamp7(max) << 16) // 7 bits
    | ((bcX & 0x3F) << 10) // 6 bits
    | ((bcY & 0x3F) << 4) // 6 bits
    | (bcZ & 0x0F) // 4 bits
  ) >>> 0; // keep unsigned
}
*/

/**
 * Page table coordinate of a brick; the inverse of _ptToZarr. Matches the
 * placement in the shader's getBrickLocation and setBrickRequest.
 * @param {number} channel Page table channel slot.
 * @param {number} resolution Logical resolution level.
 * @param {number} x Brick x index within the level.
 * @param {number} y Brick y index within the level.
 * @param {number} z Brick z index within the level.
 * @param {object} PT Page table info from _initMRMCPT.
 * @returns {{ x: number, y: number, z: number }}
 */
export function _zarrToPt(channel, resolution, x, y, z, PT) {
  if (resolution === 0) {
    // Level 0 channels are stacked along z after the coarser levels.
    return { x, y, z: PT.zExtent + PT.z0Extent * channel + z };
  }
  const anchor = PT.anchors[resolution];
  const mask = PT.channelOffsets[channel];
  return {
    x: anchor[0] * mask[0] + x,
    y: anchor[1] * mask[1] + y,
    z: anchor[2] * mask[2] + z,
  };
}

export function _ptToZarr(ptx, pty, ptz, ptInfo) {
  const { PT_zExtent, PT_z0Extent, PT_anchors } = ptInfo;
  let channel = -1;
  let resolution = -1;
  let x = -1;
  let y = -1;
  let z = -1;
  // log.debug('pt', ptx, pty, ptz);
  // log.debug('pt', ptx, pty, ptz);
  // log.debug('ptz', this.PT.z, this.PT.l0z);
  if (ptz >= PT_zExtent) {
    // log.debug('ptz >= this.PT.zExtent');
    resolution = 0;
    x = ptx;
    y = pty;
    z = (ptz - PT_zExtent) % PT_z0Extent;
    channel = Math.floor((ptz - PT_zExtent) / PT_z0Extent);
  } else {
    // log.debug('ptz < this.PT.zExtent');
    // log.debug('this.PT.anchors', this.PT.anchors);
    for (let i = 1; i < PT_anchors.length; i++) {
      if (ptx < PT_anchors[i][0] && pty < PT_anchors[i][1] && ptz < PT_anchors[i][2]) {
        // all PT coordinates are less than the anchor -> one res lower
        // log.debug('all PT coordinates are less than the anchor -> one res lower');
      } else {
        // log.debug('not all PT coordinates are less than the anchor ', this.PT.anchors[i]);
        resolution = i;
        const channelMask = [0, 0, 0];
        // log.debug('ptx', ptx);
        // log.debug('pty', pty);
        // log.debug('ptz', ptz);
        // log.debug('this.PT.anchors[i]', this.PT.anchors[i]);
        if (ptx >= PT_anchors[i][0]) { channelMask[0] = 1; }
        if (pty >= PT_anchors[i][1]) { channelMask[1] = 1; }
        if (ptz >= PT_anchors[i][2]) { channelMask[2] = 1; }
        const binaryChannel = (channelMask[0] << 2) | (channelMask[1] << 1) | channelMask[2];
        channel = Math.max(1, Math.min(7, binaryChannel)) - 1;
        // log.debug('channel', channel);
        const thisOffset = channelMask.map((v, j) => v * PT_anchors[i][j]);
        // log.debug('thisOffset', thisOffset);
        x = ptx - thisOffset[0];
        y = pty - thisOffset[1];
        z = ptz - thisOffset[2];
        // log.debug('x', x);
        // log.debug('y', y);
        // log.debug('z', z);
        break;
      }
    }
  }
  // log.debug(channel, resolution, x, y, z);

  return {
    channel,
    resolution,
    x,
    y,
    z,
  };
}

// sigmaNormalized: fraction of half-dimension that determines Gaussian spread
export const DEFAULT_SIGMA_NORMALIZED = 0.25;

export function _requestBufferToRequestObjects(buffer, k, optsForWeighting) {
  const counts = new Map();

  const { width, height, sigmaNormalized } = optsForWeighting;

  const useWeighting = (
    Number.isInteger(width) && Number.isInteger(height)
    && width > 0 && height > 0
    && typeof sigmaNormalized === 'number'
  );
  if (!useWeighting) {
    log.warn('_requestBufferToRequestObjects: proceeding without weighting');
  }

  // Number of pixels present in buffer
  const maxPixels = Math.floor(buffer.length / 4);

  for (let pix = 0; pix < maxPixels; pix += 1) {
    const i = pix * 4;
    const r = buffer[i];
    const g = buffer[i + 1];
    const b = buffer[i + 2];
    const a = buffer[i + 3];
    if ((r | g | b | a) === 0) {
      // eslint-disable-next-line no-continue
      continue;
    }
    const packed = ((r << 24) | (g << 16) | (b << 8) | a) >>> 0;

    let weight = 1.0;
    if (useWeighting) {
      const x = pix % width;
      const y = Math.floor(pix / width);
      const dx = x - (width / 2);
      const dy = y - (height / 2);
      // normalized distance relative to full width/height to be resolution-independent
      const nd = Math.sqrt((dx * dx) / (width * width) + (dy * dy) / (height * height));
      const norm = nd / sigmaNormalized;
      weight = Math.exp(-0.5 * norm * norm);
    }

    counts.set(packed, (counts.get(packed) || 0) + weight);
  }

  // Get the top K (potentially fewer than K) page table requests by weighted count.
  const sorted = Array.from(counts.entries()).toSorted((a, b) => b[1] - a[1]);
  const requests = sorted
    .slice(0, k)
    .map(([packed]) => ({
      x: (packed >> 22) & 0x3FF,
      y: (packed >> 12) & 0x3FF,
      z: packed & 0xFFF,
    }));

  return { requests, origRequestCount: counts.size };
}

/* End extracted functions */

export class VolumeDataManager {
  constructor(glParam) {
    logWithColor('CLASS INITIALIZING');
    // this.store = new zarrita.FetchStore(url); // TODO: use this.images instead

    log.debug('VolumeDataManager constructor', { glParam, glParamContext: glParam.getContext?.() });

    const gl = glParam.getContext?.() || glParam;
    const renderer = glParam;

    // this.images = images;
    // this.imageLayerScopes = imageLayerScopes;

    // Handle both WebGLRenderer and WebGL context
    if (gl.domElement && gl.getContext) {
      // This is likely a THREE.WebGLRenderer
      this.gl = gl.getContext();
    } else if (gl.isWebGLRenderer) {
      // Explicit THREE.WebGLRenderer check
      this.gl = gl.getContext();
    } else {
      // Assume it's already a WebGL context
      this.gl = gl;
    }

    // const maxFragmentUniformVectors = this.gl.getParameter(this.gl.MAX_FRAGMENT_UNIFORM_VECTORS);
    // log.debug('maxFragmentUniformVectors', maxFragmentUniformVectors);
    // 1024

    this.renderer = renderer;

    // Create a mock context if we couldn't get a real one
    if (!this.gl || typeof this.gl.getParameter !== 'function') {
      log.debug('Unable to get WebGL context, using mock context');
      this.gl = {
        getParameter: (param) => {
          // Return reasonable defaults
          const defaults = {
            MAX_TEXTURE_SIZE: 4096,
            MAX_3D_TEXTURE_SIZE: 256,
            MAX_RENDERBUFFER_SIZE: 4096,
            MAX_UNIFORM_BUFFER_BINDINGS: 16,
          };
          return defaults[param] || 0;
        },
        isContextLost: () => false,
        MAX_TEXTURE_SIZE: 'MAX_TEXTURE_SIZE',
        MAX_3D_TEXTURE_SIZE: 'MAX_3D_TEXTURE_SIZE',
        MAX_RENDERBUFFER_SIZE: 'MAX_RENDERBUFFER_SIZE',
        MAX_UNIFORM_BUFFER_BINDINGS: 'MAX_UNIFORM_BUFFER_BINDINGS',
      };
    }

    // Store references for context loss handling
    this._originalGlParam = glParam;
    this._isContextLost = false;
    this._contextRestoredCallbacks = [];

    // Add context loss event listeners if we have a real WebGL context
    if (this.gl && this.gl.canvas) {
      this.gl.canvas.addEventListener('webglcontextlost', this._handleContextLost.bind(this));
      this.gl.canvas.addEventListener('webglcontextrestored', this._handleContextRestored.bind(this));
    }

    log.debug('GL CONSTANTS');
    log.debug(this.gl);
    log.debug(this.gl.TEXTURE0);
    log.debug(this.gl.textures);
    log.debug('RENDERER');
    log.debug(this.renderer);

    this.deviceLimits = {
      maxTextureSize: this.gl.getParameter(this.gl.MAX_TEXTURE_SIZE),
      max3DTextureSize: this.gl.getParameter(this.gl.MAX_3D_TEXTURE_SIZE),
      maxRenderbufferSize: this.gl.getParameter(this.gl.MAX_RENDERBUFFER_SIZE),
      maxUniformBufferBindings: this.gl.getParameter(this.gl.MAX_UNIFORM_BUFFER_BINDINGS),
    };

    this.zarrStore = {
      resolutions: null, // 6 (the number of resolutions aka. pyramid levels in the file)
      chunkSize: [], // [32, 32, 32]
      shapes: [], // [[795, 1024, 1024], ..., [64, 64, 64], [32, 32, 32]]
      arrays: [], // [array0, array1, array2, array3, array4, array5]
      dtype: '', // 'uint8'
      physicalSizeTotal: [], // [795 x 0.0688, 1024 x 0.03417, 1024 x 0.03417]
      physicalSizeVoxel: [], // [0.0688, 0.03417, 0.03417]
      brickLayout: [], // [[25, 32, 32],[13, 16, 16], ..., [2,2,2],[1,1,1]]
      // store: '', // ref to this.store
      // group: '', // ref to this.group
      channelCount: 1, // MAX 7 TODO: get from zarr metadata
      scales: [], // downsample ratios, [x,y,z] per resolution level
      lowestDataRes: 0, // lowest resolution level with data
    };

    this.ptTHREE = null;
    this.bcTHREE = null;

    this.channels = {
      maxChannels: 7, // lower when dataset has fewer, dictates page table size
      zarrMappings: [], // stores the zarr channel index for every one of the up to 7 channels
      colorMappings: [], // stores the PT slot for every color
      downsampleMin: [], // stores the downsample min for every one of the up to 7 channels
      downsampleMax: [], // stores the downsample max for every one of the up to 7 channels
    };

    this.PT = {
      channelOffsets: [
        [0, 0, 1],
        [0, 1, 0],
        [0, 1, 1],
        [1, 0, 0],
        [1, 0, 1],
        [1, 1, 0],
        [1, 1, 1],
      ],
      anchors: [],
      offsets: [],
      xExtent: 0, // includes the offset inclusive
      yExtent: 0, // includes the offset inclusive
      zExtent: 0, // includes the offset inclusive
      z0Extent: 0, // l0 z extent
      zTotal: 0, // original z extent plus the l0 z extent times the channel count
    };

    // this.minimumMin = 255;
    // this.maximumMin = 0;
    // this.minimumMax = 255;
    // this.maximumMax = 0;

    // this.bricksAllocated = 0;
    this.bricksEverLoaded = new Set();

    // Properties for volume rendering
    // this.originalScale = [1, 1, 1]; // Original dimensions
    // this.physicalScale = [{ size: 1 }, { size: 1 }, { size: 2.1676 }]; // Physical size scaling
    // this.physicalScale = [{ size: 1 }, { size: 1 }, { size: 1 }]; // Physical size scaling
    // this.testArray = [];
    // this.ptArray = [];
    // this.ptManOffsets = [];

    // top k page table addresses
    // this.requestsStack = [];
    this.isBusy = false;

    // brick cache structure for internal calculations
    this.BCTimeStamps = new Array(TOTAL_NUM_BRICKS).fill(0);
    this.BCMinMax = new Array(TOTAL_NUM_BRICKS).fill([0, 0]);
    this.BCFull = false;
    this.BCUnusedIndex = 0;

    // brick cache to page table mapping
    this.bc2pt = new Array(TOTAL_NUM_BRICKS).fill(null);

    // Bricks of the coarsest level, per channel slot. They load first for every
    // channel and are never evicted, so each channel always has something to show.
    this.overviewBricks = new Map(); // slot -> brick cache indices

    // top k unused brick cache addresses
    this.LRUStack = [];
    // this.LRUReady = false;
    this.triggerUsage = true;
    this.triggerRequest = false;
    this.timeStamp = 0;
    this.k = 40;
    this.noNewRequests = false;
    this.manuallyStopped = false; // Flag to track if user manually stopped loading

    this.needsBailout = false; // Flag to indicate if we need to bail out of processing requests

    // Add initialization status
    this.initStatus = INIT_STATUS.NOT_STARTED;
    this.initError = null;

    // Store the last known configuration for context restoration
    this._lastChannelConfig = null;

    // Track loading progress
    this.currentRequestCount = 0; // Number of requests currently being processed
    this.totalBricksRequested = 0; // Total number of bricks requested in current batch

    logWithColor('VolumeDataManager constructor complete');
  }

  /**
   * Get loading progress information
   * @returns {Object} Loading progress with bricksLoaded, totalBricks, isLoading, and percentage
   */
  getLoadingProgress() {
    const bricksLoaded = this.bricksEverLoaded.size;
    const isLoading = !this.noNewRequests && this.currentRequestCount > 0;
    const percentage = this.totalBricksRequested > 0
      ? ((this.totalBricksRequested - this.currentRequestCount) / this.totalBricksRequested) * 100
      : 0;

    return {
      bricksLoaded,
      currentRequestCount: this.currentRequestCount,
      totalBricksRequested: this.totalBricksRequested,
      isLoading,
      percentage,
      noNewRequests: this.noNewRequests,
    };
  }

  /**
   * Manually stop loading and render at highest resolution
   */
  stopLoading() {
    log.debug('Manually stopping data loading');
    this.noNewRequests = true;
    this.manuallyStopped = true;
    this.needsBailout = true;
    // Reset progress counters to reflect stopped state
    this.currentRequestCount = 0;
    this.totalBricksRequested = 0;
  }

  /**
   * Manually restart loading
   */
  restartLoading() {
    log.debug('Manually restarting data loading');
    this.noNewRequests = false;
    this.manuallyStopped = false;
    this.needsBailout = false;
    this.triggerUsage = true;
    // Reset progress counters
    this.currentRequestCount = 0;
    this.totalBricksRequested = 0;
  }

  /**
   * Handle WebGL context loss
   */
  _handleContextLost(event) {
    logWithColor('CONTEXT LOST');
    log.warn('WebGL context lost, preventing default and setting flag');
    event.preventDefault();
    this._isContextLost = true;

    // Store current channel configuration for restoration
    if (this.channels && this.channels.zarrMappings) {
      this._lastChannelConfig = {
        zarrMappings: [...this.channels.zarrMappings],
        colorMappings: [...this.channels.colorMappings],
        downsampleMin: [...this.channels.downsampleMin],
        downsampleMax: [...this.channels.downsampleMax],
      };
    }
  }

  /**
   * Handle WebGL context restoration
   */
  _handleContextRestored(event) {
    logWithColor('CONTEXT RESTORED');
    log.warn('WebGL context restored, reinitializing textures');
    this._isContextLost = false;

    // Reinitialize WebGL context reference
    if (this._originalGlParam && this._originalGlParam.getContext) {
      this.gl = this._originalGlParam.getContext();
    }

    // Restore channel configuration if available
    if (this._lastChannelConfig) {
      this.channels.zarrMappings = [...this._lastChannelConfig.zarrMappings];
      this.channels.colorMappings = [...this._lastChannelConfig.colorMappings];
      this.channels.downsampleMin = [...this._lastChannelConfig.downsampleMin];
      this.channels.downsampleMax = [...this._lastChannelConfig.downsampleMax];
      log.debug('Restored channel configuration after context loss');
    }

    // Reinitialize textures if they were previously created
    if (this.PT && this.zarrStore && this.zarrStore.brickLayout) {
      try {
        this.initMRMCPT();
        log.debug('Successfully reinitialized MRMCPT after context restoration');
      } catch (error) {
        log.error('Failed to reinitialize MRMCPT after context restoration:', error);
      }
    }

    // Call any registered restoration callbacks
    this._contextRestoredCallbacks.forEach((callback) => {
      try {
        callback();
      } catch (error) {
        log.error('Error in context restored callback:', error);
      }
    });
  }

  /**
   * Check if WebGL context is lost
   */
  isContextLost() {
    if (this._isContextLost) return true;
    if (this.gl && typeof this.gl.isContextLost === 'function') {
      return this.gl.isContextLost();
    }
    return false;
  }

  /**
   * Register a callback to be called when context is restored
   */
  onContextRestored(callback) {
    if (typeof callback === 'function') {
      this._contextRestoredCallbacks.push(callback);
    }
  }

  initImages(images, imageLayerScopes) {
    logWithColor('INIT IMAGES');
    this.images = images;
    this.imageLayerScopes = imageLayerScopes;
  }

  /**
   * Initialize the VolumeDataManager with Zarr store details and device limits
   * This should be called ONCE at website initialization
   * TODO(mark): merge this with the constructor?
   * @param {object} config Channel coordination of the first image layer.
   * @param {object} loadingOptions Fixed for the loaded image, since they change the page table.
   * @param {'auto'|'none'|'sample'|'mean'|'max'} loadingOptions.zReduction
   * @returns {Promise<Object>} Object with Zarr store details and device limits
   */
  async init(config, loadingOptions = {}) {
    logWithColor('INIT()');
    // Prevent multiple initializations
    if (this.initStatus !== INIT_STATUS.NOT_STARTED) {
      log.debug('VolumeDataManager init() was called more than once!');

      if (this.initStatus === INIT_STATUS.COMPLETE) {
        // Return existing initialized data
        return {
          success: true,
          deviceLimits: this.deviceLimits,
          zarrStore: this.zarrStore,
          // physicalScale: this.physicalScale,
          physicalSizeTotal: this.zarrStore.physicalSizeTotal,
          physicalSizeVoxel: this.zarrStore.physicalSizeVoxel,
          error: null,
        };
      }

      if (this.initStatus === INIT_STATUS.FAILED) {
        return {
          success: false,
          error: this.initError || 'Unknown initialization error',
        };
      }

      // Still in progress, return a pending state
      return {
        success: false,
        pending: true,
        error: 'Initialization in progress',
      };
    }

    this.initStatus = INIT_STATUS.IN_PROGRESS;
    logWithColor('INIT() IN PROGRESS');
    try {
      // Query Zarr store details

      // Get all resolution levels
      const imageWrapper = this.images?.[this.imageLayerScopes?.[0]]?.image?.instance;

      // OME-Zarr or OME-TIFF levels, plus the matching region reader.
      const {
        labels, arrays, datasets, createRegionReader,
      } = _getVolumeSources(imageWrapper);

      // TODO(mark): Do not access vivLoader.metadata directly. Generalize to non-NGFF metadata.
      // For OME-TIFF this is the OME-XML metadata.
      this.ngffMetadata = imageWrapper.vivLoader.metadata;
      log.debug('ngffMetadata', this.ngffMetadata);

      // Try to load each resolution level in order
      /*
      const loadPromises = [];
      for (let i = 0; i < resolutions; i++) {
        loadPromises.push(this.tryLoadResolution(i, arrays));
      }

      const results = await Promise.all(loadPromises);

      log.debug('results', results);

      // Verify all resolutions were loaded successfully
      const failedResolutions = results.filter(r => !r.success);
      if (failedResolutions.length > 0) {
        throw new Error(`Failed to load ${failedResolutions.length} resolution levels: ${failedResolutions.map(r => r.level).join(', ')}`);
      }

      console.info(`Successfully loaded ${resolutions} resolution levels.`);
      */

      // console.info('shapes', shapes);
      // console.info('arrays', arrays);

      // Get the first array for metadata
      if (arrays.length > 0) {
        const array0 = arrays[0];
        // For OME-TIFF, the model matrix holds the OME-XML physical sizes.
        const spacing = _getVoxelSpacing(imageWrapper.getModelMatrix(), this.ngffMetadata);

        // Render levels are logical: a source array plus a Z reduction factor.
        // Bricks are 32^3 regions read independently of the source chunk shape.
        const levels = planVolumeLevels({
          arrays,
          labels,
          datasets,
          spacing,
          mode: loadingOptions.zReduction,
          maxLevels: MAX_RESOLUTION_LEVELS,
        });
        log.debug('volume levels [source, zFactor, zMode, shape ZYX]', levels.map(
          level => [level.source, level.zFactor, level.zMode, level.shape],
        ));

        // Skip fine levels whose bricks decode too much source data,
        // e.g. whole-plane chunks at full resolution.
        const bytesPerElement = getBytesPerElement(array0.dtype);
        const finestLevel = levels.findIndex(level => decodedBytesPerBrick(
          level, arrays[level.source], labels, bytesPerElement,
        ) <= MAX_DECODED_BYTES_PER_BRICK);

        const axisSize = axis => (labels.includes(axis) ? array0.shape[labels.indexOf(axis)] : 1);
        const shapes = levels.map(level => [axisSize('t'), axisSize('c'), ...level.shape]);

        // Update store information. Shapes, brick layout, and scales describe logical levels.
        this.zarrStore = {
          resolutions: levels.length,
          levels,
          chunkSize: array0.chunks,
          shapes, // TCZYX
          arrays,
          dtype: array0.dtype,
          physicalSizeTotal: levels[0].shape.map((size, axis) => size * spacing[axis]),
          physicalSizeVoxel: spacing,
          brickLayout: levels.map(level => level.shape.map(size => Math.ceil(size / BRICK_SIZE))),
          channelCount: shapes[0][1],
          // XYZ ratios relative to level-0 voxels, as the shader expects (extent / scale).
          scales: levels.map(level => [...level.ratio].reverse()),
          finestLevel: finestLevel === -1 ? levels.length - 1 : finestLevel,
        };
        this.brickSource = createVolumeBrickSource({
          arrays, levels, labels, createRegionReader,
        });

        // initializing channel mappings and slots as empty
        this.channels.colorMappings = new Array(Math.min(this.zarrStore.channelCount, 7)).fill(-1);
        this.channels.zarrMappings = new Array(Math.min(this.zarrStore.channelCount, 7)).fill(undefined);
        this.channels.downsampleMin = new Array(Math.min(this.zarrStore.channelCount, 7)).fill(undefined);
        this.channels.downsampleMax = new Array(Math.min(this.zarrStore.channelCount, 7)).fill(undefined);

        // log.debug('zarrMappings in init', this.channels.zarrMappings);
        // log.debug('downsampleMin in init', this.channels.downsampleMin);
        // log.debug('downsampleMax in init', this.channels.downsampleMax);

        // log.debug('zarrStore', this.zarrStore);

        // init channel mappings
        // log.debug('initializing channel mappings');
        log.debug('config', config);
        // for each key in config, add to channel mappings
        // OME-TIFF has no OMERO block. Its sample range, if the writer recorded one.
        this.sampleRange = arrays[0].pixelSource
          ? await getTiffSampleRange(arrays[0].pixelSource) : null;
        log.debug('omero', this.ngffMetadata?.omero, 'sampleRange', this.sampleRange);

        Object.keys(config).forEach((key, i) => {
          const configChannel = config[key].spatialTargetC;
          this.channels.zarrMappings[i] = configChannel;
          this.channels.colorMappings[i] = i;
          // Undefined until the overview brick loads, when there is no range in the metadata.
          [this.channels.downsampleMin[i], this.channels.downsampleMax[i]] = this
            ._getStorageRange(configChannel) ?? [];
        });
        log.debug('zarrMappings after init', this.channels.zarrMappings);
        log.debug('colorMappings after init', this.channels.colorMappings);
        log.debug('downsampleMin after init', this.channels.downsampleMin);
        log.debug('downsampleMax after init', this.channels.downsampleMax);

        // Initialize MRMCPT textures after we have all the necessary information
        this.initMRMCPT();
        // this.populateMRMCPT();
        // this.testTexture();
      }

      this.initStatus = INIT_STATUS.COMPLETE;
      logWithColor('INIT() COMPLETE');

      // log.debug(this.zarrStore);

      /*
      if (this.ngffMetadata.coordinateTransformations
          && this.ngffMetadata.coordinateTransformations[0]
          && this.ngffMetadata.coordinateTransformations[0].scale) {
        // log.debug('scale', this.ngffMetadata.coordinateTransformations[0].scale);
      }
      */

      // Return data that can be displayed in the HUD
      return {
        success: true,
        deviceLimits: this.deviceLimits,
        zarrStore: this.zarrStore,
        // physicalScale: this.physicalScale,
        physicalSizeTotal: this.zarrStore.physicalSizeTotal,
        physicalSizeVoxel: this.zarrStore.physicalSizeVoxel,
        error: null,
      };
    } catch (error) {
      logWithColor('INIT() FAILED');
      log.error('Error initializing VolumeDataManager:', error);
      this.initStatus = INIT_STATUS.FAILED;
      this.initError = error.message || 'Unknown error';

      return {
        success: false,
        error: this.initError,
      };
    }
  }

  /**
   * Value range of a channel mapped to 0-255 in the uint8 brick cache: the OMERO
   * window (OME-Zarr), or the sample range recorded in an OME-TIFF.
   * @param {number} zarrChannel
   * @returns {[number, number]|undefined} Undefined when the metadata has no range;
   * the channel's overview brick then provides it.
   */
  _getStorageRange(zarrChannel) {
    if (this.sampleRange) return this.sampleRange;
    if (this.ngffMetadata?.omero) return _getChannelWindow(this.ngffMetadata.omero, zarrChannel);
    return undefined;
  }

  /**
   * Initialize the BrickCache and PageTable
   * MRMCPT: multi-resolution multi-channel page table
   *
   * Depends on:
   *   - zarrStore.brickLayout
   *   - zarrMappings.length (zarrMappings: the zarr channel index for every one of the up to 7 channels)
   *   -
   */
  initMRMCPT() {
    logWithColor('initMRMCPT');

    // log.debug('initMRMCPT', this.zarrStore.shapes[0]);
    // log.debug('initMRMCPT', this.zarrStore.channelCount);
    // log.debug('initMRMCPT', this.channels.zarrMappings);
    // log.debug('initMRMCPT', this.channels.colorMappings);

    const { PT, ptTHREE, bcTHREE } = _initMRMCPT(
      this.zarrStore.brickLayout,
      this.channels.zarrMappings.length,
    );

    this.PT = PT;
    this.ptTHREE = ptTHREE;
    this.bcTHREE = bcTHREE;

    logWithColor('initMRMCPT() COMPLETE');
  }


  async initTexture() {
    if (this.isBusy) return;
    logWithColor('initTexture - loading the overview brick of each channel');
    this.isBusy = true;
    await this._loadOverviews();
    this.isBusy = false;
  }

  /**
   * Page table requests for all bricks of the coarsest level (one brick when it
   * is the overview level), for each mapped channel slot without them yet.
   */
  _overviewRequests() {
    const resolution = this.zarrStore.brickLayout.length - 1;
    const [zBricks, yBricks, xBricks] = this.zarrStore.brickLayout[resolution];
    return this.channels.zarrMappings.flatMap((zarrChannel, slot) => {
      if (zarrChannel === undefined || this.overviewBricks.has(slot)) return [];
      const requests = [];
      for (let z = 0; z < zBricks; z++) {
        for (let y = 0; y < yBricks; y++) {
          for (let x = 0; x < xBricks; x++) {
            requests.push(_zarrToPt(slot, resolution, x, y, z, this.PT));
          }
        }
      }
      return requests;
    });
  }

  /**
   * Load and pin the overview bricks of channels that do not have them yet.
   * @returns {Promise<boolean>} Whether any overview requests were made.
   */
  async _loadOverviews() {
    const requests = this._overviewRequests();
    if (requests.length === 0) return false;
    const ptInfo = { PT_zExtent: this.PT.zExtent, PT_z0Extent: this.PT.z0Extent, PT_anchors: this.PT.anchors };
    // Mark slots as attempted even if a read fails; the regular requests retry those bricks.
    requests.forEach(({ x, y, z }) => {
      const { channel } = _ptToZarr(x, y, z, ptInfo);
      if (!this.overviewBricks.has(channel)) this.overviewBricks.set(channel, []);
    });
    const uploaded = await this.handleBrickRequests(requests, { canBailOut: false });
    uploaded.forEach(({ ptCoord, bcIndex }) => {
      const { channel } = _ptToZarr(ptCoord.x, ptCoord.y, ptCoord.z, ptInfo);
      this.overviewBricks.get(channel)?.push(bcIndex);
    });
    return true;
  }

  updateChannels(channelProps) {
    logWithColor('updateChannels');
    log.debug('channelProps', channelProps);

    // log.error('TODO: init channel mappings first ');
    log.debug('this.channels.zarrMappings', this.channels.zarrMappings);
    log.debug('this.channels.colorMappings', this.channels.colorMappings);
    log.debug('this.channels.downsampleMin', this.channels.downsampleMin);
    log.debug('this.channels.downsampleMax', this.channels.downsampleMax);

    if (this.channels.zarrMappings.length === 0) {
      log.debug('channels not initialized yet');
      return;
    }

    // Early exit check: compare requested mappings with current mappings
    const requestedZarrChannels = Object.values(channelProps)
      .map(channelData => channelData.spatialTargetC)
      .filter(targetC => targetC !== undefined);

    const currentZarrChannels = this.channels.zarrMappings
      .filter(mapping => mapping !== undefined);

    // Create sorted arrays for comparison
    const requestedSorted = [...new Set(requestedZarrChannels)].sort((a, b) => a - b);
    const currentSorted = [...new Set(currentZarrChannels)].sort((a, b) => a - b);

    // Early exit if mappings haven't changed
    if (requestedSorted.length === currentSorted.length
        && requestedSorted.every((val, index) => val === currentSorted[index])) {
      log.debug('Channel mappings unchanged, skipping update');
      // return;
    }

    log.debug('Channel mappings changed:', {
      current: currentSorted,
      requested: requestedSorted,
    });

    // Instead of for...of loop, use Object.entries() with forEach
    Object.entries(channelProps).forEach(([uiChannelKey, channelData]) => {
      const targetZarrChannel = channelData.spatialTargetC;

      log.debug(`UI channel "${uiChannelKey}" wants zarr channel ${targetZarrChannel}`);

      // Check if this zarr channel is already mapped
      const existingSlotIndex = this.channels.zarrMappings.indexOf(targetZarrChannel);

      if (existingSlotIndex === -1) {
        // Need to allocate a new slot for this zarr channel
        const nextFreeSlot = this.channels.zarrMappings.findIndex(slot => slot === undefined);
        if (nextFreeSlot !== -1) {
          this.channels.zarrMappings[nextFreeSlot] = targetZarrChannel;
          log.debug('channelData', channelData);
          log.debug('this.ngffMetadata?.omero?.channels', this.ngffMetadata?.omero?.channels);
          log.debug('targetZarrChannel', targetZarrChannel);
          [this.channels.downsampleMin[nextFreeSlot], this.channels.downsampleMax[nextFreeSlot]] = this._getStorageRange(targetZarrChannel) ?? [];
          log.debug(`Mapped zarr channel ${targetZarrChannel} to slot ${nextFreeSlot}`);
          log.debug('channels', this.channels);
        } else {
          log.debug('No free slots found, looking for unused mapped channels');

          // Find zarr channels that are currently mapped but no longer requested
          const currentlyMapped = this.channels.zarrMappings.filter(mapping => mapping !== undefined);
          const stillRequested = requestedZarrChannels; // We calculated this earlier
          const unusedMappedChannels = currentlyMapped.filter(mappedChannel => !stillRequested.includes(mappedChannel));

          log.debug('Currently mapped:', currentlyMapped);
          log.debug('Still requested:', stillRequested);
          log.debug('Unused mapped channels:', unusedMappedChannels);

          if (unusedMappedChannels.length > 0) {
            // Find the first slot that maps to an unused zarr channel
            const slotToReuse = this.channels.zarrMappings.findIndex(mapping => unusedMappedChannels.includes(mapping));

            if (slotToReuse !== -1) {
              const oldZarrChannel = this.channels.zarrMappings[slotToReuse];
              // Purge first: it resets the slot's mapping and window.
              this._purgeChannel(slotToReuse);
              this.channels.zarrMappings[slotToReuse] = targetZarrChannel;
              [this.channels.downsampleMin[slotToReuse], this.channels.downsampleMax[slotToReuse]] = this._getStorageRange(targetZarrChannel) ?? [];
              log.debug(`Reused slot ${slotToReuse}: ${oldZarrChannel} -> ${targetZarrChannel}`);
            } else {
              log.error('Could not find slot to reuse - this should not happen');
            }
          } else {
            log.error('All slots are full and all mapped channels are still in use');
          }
        }
      } else {
        log.debug(`Zarr channel ${targetZarrChannel} already mapped to slot ${existingSlotIndex}`);
      }
    });

    const newColorMappings = Object.values(channelProps).map((ch) => {
      const slot = this.channels.zarrMappings.indexOf(ch.spatialTargetC);
      return slot !== -1 ? slot : -1;
    });

    while (newColorMappings.length < 7) {
      newColorMappings.push(-1);
    }

    log.debug('newColorMappings', newColorMappings);
    this.channels.colorMappings = newColorMappings;

    // Resume requests so that newly mapped channels load their overview bricks.
    if (this._overviewRequests().length > 0 && !this.manuallyStopped) {
      this.noNewRequests = false;
    }

    log.debug('updatedChannels', this.channels);

    // Store the updated configuration for context restoration
    this._lastChannelConfig = {
      zarrMappings: [...this.channels.zarrMappings],
      colorMappings: [...this.channels.colorMappings],
      downsampleMin: [...this.channels.downsampleMin],
      downsampleMax: [...this.channels.downsampleMax],
    };
  }

  /**
   * Try to load a resolution level
   * @param {number} resolutionIndex - The resolution level to load
   * @param {Array} arrays - Array to store the loaded arrays
   * @returns {Promise} Promise resolving when the resolution is loaded or rejected
   */
  /*
  async tryLoadResolution(resolutionIndex, arrays) {
    logWithColor('tryLoadResolution');
    log.debug(resolutionIndex, arrays);
    try {
      const array = await zarrita.open(this.group.resolve(String(resolutionIndex)));
      // Create new arrays to avoid modifying parameters directly
      const newArrays = [...arrays];
      newArrays[resolutionIndex] = array;
      // Update the original arrays
      Object.assign(arrays, newArrays);
      logWithColor('tryLoadResolution() COMPLETE');
      return { success: true, level: resolutionIndex };
    } catch (err) {
      log.error(`Failed to load resolution ${resolutionIndex}:`, err);
      return { success: false, level: resolutionIndex, error: err.message };
    }
  }
  */

  /**
   * Get physical dimensions
   * @returns {Array} Physical dimensions [X, Y, Z]
   */
  getPhysicalDimensionsXYZ() {
    log.debug('getPhysicalDimensionsXYZ');
    log.debug('this.zarrStore.physicalSizeTotal', this.zarrStore.physicalSizeTotal);
    const out = [this.zarrStore.physicalSizeTotal[2],
      this.zarrStore.physicalSizeTotal[1],
      this.zarrStore.physicalSizeTotal[0]];
    log.debug('out', out);
    return out;
  }

  /**
   * Get the maximum resolution
   * @returns {number} Maximum resolution
   */
  getMaxResolutionXYZ() {
    log.debug('getMaxResolutionXYZ');
    log.debug('this.zarrStore.shapes', this.zarrStore.shapes);
    const out = [this.zarrStore.shapes[0][4],
      this.zarrStore.shapes[0][3],
      this.zarrStore.shapes[0][2]];
    log.debug('out', out);
    return out;
  }

  getOriginalScaleXYZ() {
    logWithColor('getOriginalScaleXYZ');
    log.debug('this.zarrStore.physicalSizeVoxel', this.zarrStore.physicalSizeVoxel);
    const out = [this.zarrStore.physicalSizeVoxel[2],
      this.zarrStore.physicalSizeVoxel[1],
      this.zarrStore.physicalSizeVoxel[0]];
    log.debug('out', out);
    return out;
  }

  getNormalizedScaleXYZ() {
    log.debug('getNormalizedScaleXYZ');
    const out = [
      1.0,
      this.zarrStore.physicalSizeVoxel[1] / this.zarrStore.physicalSizeVoxel[2],
      this.zarrStore.physicalSizeVoxel[0] / this.zarrStore.physicalSizeVoxel[0],
    ];
    log.debug('out', out);
    return out;
  }

  getBoxDimensionsXYZ() {
    log.debug('getBoxDimensionsXYZ');
    log.debug('this.zarrStore.shapes', this.zarrStore.shapes);
    const out = [1,
      this.zarrStore.shapes[0][3] / this.zarrStore.shapes[0][4],
      this.zarrStore.shapes[0][2] / this.zarrStore.shapes[0][4],
    ];
    log.debug('out', out);
    return out;
  }

  /**
   * Load one logical 32^3 brick, for debugging. Coordinates are brick
   * indices in the logical level, not source Zarr chunk indices.
   * @param {number} t - Time point (default 0)
   * @param {number} c - Channel (default 0)
   * @param {number} z - Brick Z coordinate
   * @param {number} y - Brick Y coordinate
   * @param {number} x - Brick X coordinate
   * @param {number} resolution - Logical resolution level
   * @returns {Promise<TypedArray>} 32x32x32 brick data in the source dtype
   */
  async loadZarrChunk(t = 0, c = 0, z, y, x, resolution) {
    if (!this.brickSource) {
      throw new Error('Zarr store not initialized');
    }
    const { data } = await this.brickSource.readBrick({
      level: resolution, t, c, bx: x, by: y, bz: z,
    });
    return data;
  }

  /**
   * Process the buffer of brick requests from the shader, turning them into
   * actual Promises for Zarr chunks on the JS side.
   * @param {Uint8Array} buffer The bufRequest (of length width*height*4)
   * containing the brick requests from the shader.
   * @param {object} optsForWeighting
   * @param {number} optsForWeighting.width The width of the render target.
   * @param {number} optsForWeighting.height The height of the render target.
   * @param {number} optsForWeighting.sigmaNormalized The normalized sigma value
   * to use for weighting the brick requests based on their distance from
   * the center of the render target.
   */
  async processRequestData(buffer, optsForWeighting) {
    if (this.initStatus !== INIT_STATUS.COMPLETE) {
      log.debug('processRequestData: not yet initialized, skipping');
      return;
    }

    if (this.isBusy) {
      log.debug('processRequestData: already busy, skipping');
      return;
    }

    // Check if loading has been manually stopped
    if (this.noNewRequests) {
      log.debug('processRequestData: loading stopped by user, skipping');
      return;
    }

    // Check for context loss
    if (this.isContextLost()) {
      log.debug('processRequestData: WebGL context is lost, skipping');
      return;
    }

    this.isBusy = true;
    this.triggerRequest = false;

    // A channel without its overview loads that first, e.g. one added after init.
    if (await this._loadOverviews()) {
      this.triggerUsage = true;
      this.isBusy = false;
      return;
    }

    const { requests, origRequestCount } = _requestBufferToRequestObjects(buffer, this.k, optsForWeighting);

    if (requests.length === 0) {
      this.noNewRequests = true;
    }
    log.debug(`processRequestData: handling ${requests.length} requests of ${origRequestCount}`);
    await this.handleBrickRequests(requests);

    // We want processRequestData to alternate with processUsageData.
    this.triggerUsage = true;
    this.isBusy = false;
  }


  async processUsageData(buffer) {
    if (this.isBusy) {
      log.debug('processUsageData: already busy, skipping');
      this.needsBailout = true; // Set a flag to indicate we need to bail out of processing requests
      return;
    }

    // Check for context loss
    if (this.isContextLost()) {
      log.debug('processUsageData: WebGL context is lost, skipping');
      return;
    }

    this.isBusy = true;
    this.triggerUsage = false;

    const now = ++this.timeStamp;
    const usedBricks = new Set();

    // Process buffer to identify used bricks
    for (let i = 0; i < buffer.length; i += 4) {
      const x = buffer[i];
      const y = buffer[i + 1];
      const z = buffer[i + 2];

      // Skip empty entries
      if ((x | y | z) === 0) {
        // eslint-disable-next-line no-continue
        continue;
      }

      // Calculate brick index
      const bcIndex = z * BRICK_CACHE_SIZE_X * BRICK_CACHE_SIZE_Y + y * BRICK_CACHE_SIZE_X + x;

      // Only add valid indices
      if (bcIndex < this.BCTimeStamps.length) {
        usedBricks.add(bcIndex);
      }
    }
    // Update timestamps for all used bricks at once
    Array.from(usedBricks).forEach((bcIndex) => {
      this.BCTimeStamps[bcIndex] = now;
    });

    // Check if brick cache is full based on allocation index
    // this.BCFull = this.BCUnusedIndex >= this.BCTimeStamps.length;
    // If cache is full or we want to always maintain the LRU list
    // if (this.BCFull || this.BCUnusedIndex >= this.BCTimeStamps.length - this.k) { // Always update LRU list

    // do NOT overwrite BCFull; it is latched in _allocateBCSlots()
    if (this.BCFull) this._buildLRU(); // The brick cache is full, so update the list of least recently used bricks, as it will be needed for eviction during the next _allocateBCSlots

    // log.debug('this.BCTimeStamps', this.BCTimeStamps);
    // log.debug('this.timeStamp', this.timeStamp);

    // We want processRequestData to alternate with processUsageData.
    this.triggerRequest = true;
    this.isBusy = false;
  }

  // Helper method to update PT entries for evicted bricks
  _evictBrick(bcIndex) {
    const pt = this.bc2pt[bcIndex];
    if (!pt) return; // brick was never resident

    const [min, max] = this.BCMinMax[bcIndex] || [0, 0];
    const ptVal = (
      (0 << 31) // not-resident
        | (1 << 30) // init-done
        | (Math.min(127, min >> 1) << 23)
        | (Math.min(127, max >> 1) << 16)
    ) >>> 0;

    this._updatePTEntry(pt.x, pt.y, pt.z, ptVal); // ← PT coord!
    this.bc2pt[bcIndex] = null; // slot now free
  }

  _purgeChannel(ptChannelIndex) {
    log.debug('purging channel', ptChannelIndex);
    log.debug('corresponding zarr channel', this.channels.zarrMappings[ptChannelIndex]);

    if (!this.ptTHREE) {
      log.error('pagetable texture not initialized');
      return;
    }

    // Check for context loss before proceeding
    if (this.isContextLost()) {
      log.warn('WebGL context is lost, skipping channel purge');
      return;
    }

    // Unpin the slot's overview and forget its resident bricks, so that evicting
    // them later cannot clear page table entries of the next channel in this slot.
    this.overviewBricks.delete(ptChannelIndex);
    const ptInfo = { PT_zExtent: this.PT.zExtent, PT_z0Extent: this.PT.z0Extent, PT_anchors: this.PT.anchors };
    this.bc2pt.forEach((pt, bcIndex) => {
      if (pt && _ptToZarr(pt.x, pt.y, pt.z, ptInfo).channel === ptChannelIndex) {
        this.bc2pt[bcIndex] = null;
        this.BCTimeStamps[bcIndex] = 0;
      }
    });

    this.channels.downsampleMin[ptChannelIndex] = undefined;
    this.channels.downsampleMax[ptChannelIndex] = undefined;
    this.channels.zarrMappings[ptChannelIndex] = undefined;

    const { gl } = this;
    const texPT = this.renderer.properties.get(this.ptTHREE).__webglTexture;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_3D, texPT);

    // Each (slot, level) block is contiguous; _zarrToPt gives its origin (x, y, z),
    // including level 0, where channels are stacked along z. brickLayout is [z, y, x].
    for (let r = 0; r < this.zarrStore.resolutions; r++) {
      const origin = _zarrToPt(ptChannelIndex, r, 0, 0, 0, this.PT);
      const [zBricks, yBricks, xBricks] = this.zarrStore.brickLayout[r];
      gl.texSubImage3D(
        gl.TEXTURE_3D, 0,
        origin.x, origin.y, origin.z,
        xBricks, yBricks, zBricks,
        gl.RED_INTEGER, gl.UNSIGNED_INT,
        new Uint32Array(xBricks * yBricks * zBricks),
      );
    }
    gl.bindTexture(gl.TEXTURE_3D, null);
  }

  // Update a PT entry
  _updatePTEntry(ptX, ptY, ptZ, ptVal) {
    if (!this.ptTHREE) return;

    // Check for context loss before proceeding
    if (this.isContextLost()) {
      log.warn('WebGL context is lost, skipping PT entry update');
      return;
    }

    const { gl } = this;
    const texPT = this.renderer.properties.get(this.ptTHREE).__webglTexture;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_3D, texPT);
    gl.texSubImage3D(
      gl.TEXTURE_3D, 0,
      ptX, ptY, ptZ,
      1, 1, 1,
      gl.RED_INTEGER, gl.UNSIGNED_INT,
      new Uint32Array([ptVal]),
    );
    gl.bindTexture(gl.TEXTURE_3D, null);
  }

  /* ------------------------------------------------------------- *
 * 2. Allocate the next n free bricks in the brick cache         *
 * ------------------------------------------------------------- */
  /**
   *
   * @param {number} n The number of slots to allocate
   * @returns {{ bcIndex, x, y, z }[]} Array of brick cache coordinates for the allocated slots.
   */
  _allocateBCSlots(n) {
    let slots = [];
    const total = BRICK_CACHE_SIZE_X * BRICK_CACHE_SIZE_Y * BRICK_CACHE_SIZE_Z;

    if (!this.BCFull && this.BCUnusedIndex + n > total) {
      // The brick cache was not already full,
      // but allocating N more bricks will put us over the limit.
      this.BCFull = true;
      log.debug('BRICK CACHE FULL');
    }
    // Do the allocation.
    if (!this.BCFull) {
      for (let i = 0; i < n; ++i) {
        const bcIndex = (this.BCUnusedIndex + i) % total; // wrap for now
        const z = Math.floor(bcIndex / (BRICK_CACHE_SIZE_X * BRICK_CACHE_SIZE_Y));
        const rem = bcIndex - z * BRICK_CACHE_SIZE_X * BRICK_CACHE_SIZE_Y;
        const y = Math.floor(rem / BRICK_CACHE_SIZE_X);
        const x = rem % BRICK_CACHE_SIZE_X;

        slots.push({ bcIndex, x, y, z });
      }
      this.BCUnusedIndex += n;
    } else { // ---- BC already full ----
      // Before proceeding to choose old slots from the LRU stack,
      // we need to ensure that the LRU stack is at least as long as N
      // (since N is the number of new brick slots to allocate).
      if (this.LRUStack.length < n) this._buildLRU(); // top-up list
      // Use the LRU stack to evict the least-recently-used bricks
      // and return their coordinates for the new bricks to use.
      slots = this.LRUStack.splice(0, n).map((bcIndex) => {
        this._evictBrick(bcIndex);
        const z = Math.floor(bcIndex / (BRICK_CACHE_SIZE_X * BRICK_CACHE_SIZE_Y));
        const rem = bcIndex - z * BRICK_CACHE_SIZE_X * BRICK_CACHE_SIZE_Y;
        const y = Math.floor(rem / BRICK_CACHE_SIZE_X);
        const x = rem % BRICK_CACHE_SIZE_X;
        return { bcIndex, x, y, z };
      });
    }
    return slots;
  }

  /* ------------------------------------------------------------- *
 * 4. Fetch one brick, then upload it + its PT entry             *
 * ------------------------------------------------------------- */
  /**
   * Read and convert one brick. Safe to run concurrently.
   * @returns {Promise<{ chunk: Uint8Array, min: number, max: number, channel: number }|null>}
   * The brick, or null if it cannot be loaded.
   */
  async _fetchBrick(ptCoord) {
    log.debug('fetching brick', ptCoord);

    // Check for context loss before proceeding
    if (this.isContextLost()) {
      log.warn('WebGL context is lost, skipping brick upload');
      return null;
    }

    if (ptCoord.x >= this.PT.xExtent
      || ptCoord.y >= this.PT.yExtent
      || ptCoord.z >= this.PT.zTotal
      || ptCoord.x < 0
      || ptCoord.y < 0
      || ptCoord.z < 0
    ) {
      log.error('this.PT', this.PT);
      log.error('ptCoord out of bounds', ptCoord);
      return null;
    }

    // log.debug('ptCoord', ptCoord);
    // log.debug('this.PT', this.PT);


    /* 4.1 fetch chunk from Zarr */
    const { channel, resolution, x, y, z } = _ptToZarr(
      ptCoord.x, ptCoord.y, ptCoord.z,
      { PT_zExtent: this.PT.zExtent, PT_z0Extent: this.PT.z0Extent, PT_anchors: this.PT.anchors },
    );

    // Check if channel mappings are valid
    if (!this.channels || !this.channels.zarrMappings || this.channels.zarrMappings.length === 0) {
      log.error('Channel mappings not initialized, skipping brick upload');
      return null;
    }

    if (channel < 0 || channel >= this.channels.zarrMappings.length) {
      log.error('Channel index out of bounds', { channel, mappingsLength: this.channels.zarrMappings.length });
      return null;
    }

    const zarrChannel = this.channels.zarrMappings[channel];

    if (zarrChannel === undefined || zarrChannel === -1) {
      log.warn('zarrChannel is undefined or -1', {
        zarrChannel,
        channel,
        ptCoord,
        channelMappings: this.channels.zarrMappings,
        contextLost: this.isContextLost(),
      });

      // If this happens due to context loss, try to restore from last known config
      if (this._lastChannelConfig && this._lastChannelConfig.zarrMappings[channel] !== undefined) {
        log.warn('Attempting to use last known channel config');
        this.channels.zarrMappings = [...this._lastChannelConfig.zarrMappings];
        this.channels.colorMappings = [...this._lastChannelConfig.colorMappings];
        this.channels.downsampleMin = [...this._lastChannelConfig.downsampleMin];
        this.channels.downsampleMax = [...this._lastChannelConfig.downsampleMax];

        // Retry with restored config
        const restoredZarrChannel = this.channels.zarrMappings[channel];
        if (restoredZarrChannel !== undefined && restoredZarrChannel !== -1) {
          log.debug('Successfully restored channel mapping, continuing with upload');
        } else {
          log.error('Could not restore valid channel mapping, aborting brick upload');
          return null;
        }
      } else {
        log.error('No fallback channel config available, aborting brick upload');
        return null;
      }
    }

    log.debug('starting to load zarr chunk', { resolution, z, y, x, zarrChannel });
    // A logical brick: padded to 32^3 by edge replication, Z reduced per level.
    let { data: chunk } = await this.brickSource.readBrick({
      level: resolution, t: 0, c: zarrChannel, bx: x, by: y, bz: z,
    });
    log.debug('chunk', chunk);

    // The brick cache is uint8: map other dtypes (uint16, float32, ...) from the
    // channel's storage range to 0-255.
    if (!(chunk instanceof Uint8Array)) {
      if (this.channels.downsampleMin[channel] === undefined) {
        // Without a range from the metadata, the channel's overview brick sets it.
        const isOverview = resolution === this.zarrStore.resolutions - 1;
        const range = this._getStorageRange(zarrChannel) ?? (isOverview ? _getDataRange(chunk) : null);
        if (!range) {
          log.debug('No storage range yet for channel slot; waiting for its overview', channel);
          return null;
        }
        [this.channels.downsampleMin[channel], this.channels.downsampleMax[channel]] = range;
      }
      chunk = _toUint8(
        chunk, this.channels.downsampleMin[channel], this.channels.downsampleMax[channel],
      );
    }

    let min = 255;
    let max = 0;

    for (let i = 0; i < chunk.length; ++i) {
      const v = chunk[i];
      if (v < min) min = v;
      if (v > max) max = v;
    }
    return {
      chunk, min, max, channel, zarrChannel,
    };
  }

  /**
   * Upload a fetched brick to its brick cache slot and point its PT entry at it.
   * Synchronous, so uploads of concurrently fetched bricks never interleave.
   * @returns {boolean} Whether the brick was uploaded.
   */
  _writeBrick(ptCoord, bcSlot, brick) {
    if (this.isContextLost()) {
      log.warn('WebGL context is lost, skipping brick upload');
      return false;
    }
    const { chunk, channel } = brick;
    let { min, max } = brick;
    // The slot was given to another channel while this brick was in flight.
    if (this.channels.zarrMappings[channel] !== brick.zarrChannel) return false;

    /* 4.3 brick‑cache upload */
    const { gl } = this;
    const texBC = this.renderer.properties.get(this.bcTHREE).__webglTexture;
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_3D, texBC);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texSubImage3D(
      gl.TEXTURE_3D, 0,
      bcSlot.x * BRICK_SIZE,
      bcSlot.y * BRICK_SIZE,
      bcSlot.z * BRICK_SIZE,
      BRICK_SIZE, BRICK_SIZE, BRICK_SIZE,
      gl.RED, gl.UNSIGNED_BYTE, chunk,
    );
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
    gl.bindTexture(gl.TEXTURE_3D, null);
    // log.debug('uploaded brick');

    const error = gl.getError();
    if (error !== gl.NO_ERROR) {
      log.error('WebGL error during brick upload:', error, chunk);
    }

    /* 4.4 PT entry upload */
    if (channel >= this.channels.zarrMappings.length) {
      log.debug('channel is out of bounds', channel);
      min = 255;
      max = 255;
    }

    const ptVal = _packPT(min, max, bcSlot.x, bcSlot.y, bcSlot.z);
    const texPT = this.renderer.properties.get(this.ptTHREE).__webglTexture;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_3D, texPT);
    gl.texSubImage3D(
      gl.TEXTURE_3D, 0,
      ptCoord.x, ptCoord.y, ptCoord.z,
      1, 1, 1,
      gl.RED_INTEGER, gl.UNSIGNED_INT,
      new Uint32Array([ptVal]),
    );
    gl.bindTexture(gl.TEXTURE_3D, null);
    // log.debug('uploaded PT entry');
    // log.debug('ptVal', ptVal);
    // log.debug('min', min);
    // log.debug('max', max);
    // log.debug('bcSlot', bcSlot);
    // log.debug('channel', channel);
    // log.debug('resolution', resolution);
    // log.debug('x', x);
    // log.debug('y', y);
    // log.debug('z', z);
    // log.debug('ptCoord', ptCoord);

    const error2 = gl.getError();
    if (error2 !== gl.NO_ERROR) {
      log.error('WebGL error during pagetable upload:', error2, chunk);
    }

    /* 4.5 bookkeeping */
    // const now = ++this.timeStamp;
    this.BCTimeStamps[bcSlot.bcIndex] = this.timeStamp;
    this.BCMinMax[bcSlot.bcIndex] = [min, max];
    this.bc2pt[bcSlot.bcIndex] = ptCoord;
    // log.debug('bookkeeping');
    return true;
  }

  /* ------------------------------------------------------------- *
 * 5. Public: handle a batch of PT requests (array of {x,y,z})   *
 * ------------------------------------------------------------- */
  /**
   * @param {{ x: number, y: number, z: number }[]} ptRequests Page table coordinates.
   * @param {object} options
   * @param {boolean} options.canBailOut Whether needsBailout may stop the batch early.
   * @returns {Promise<{ ptCoord: object, bcIndex: number }[]>} The uploaded bricks.
   */
  async handleBrickRequests(ptRequests, { canBailOut = true } = {}) {
    // log.debug('handleBrickRequests');
    if (ptRequests.length === 0) return [];

    // Track loading progress
    this.totalBricksRequested = ptRequests.length;
    this.currentRequestCount = ptRequests.length;

    // log.debug('ptRequests', ptRequests);
    // log.debug('this.BCFull', this.BCFull);
    // log.debug('this.BCUnusedIndex', this.BCUnusedIndex);
    // log.debug('this.BCTimeStamps', this.BCTimeStamps);
    // log.debug('this.LRUStack', this.LRUStack);

    /* <= k requests, allocate same number of bricks */
    const slots = this._allocateBCSlots(ptRequests.length);
    // log.debug('slots', slots);

    log.debug('Handling brick requests:', { requestCount: ptRequests.length, slotCount: slots.length });

    // Fetch up to BRICK_FETCH_CONCURRENCY bricks at once, in request order. Each
    // brick is uploaded as soon as its fetch completes.
    const uploaded = [];
    let nextRequest = 0;
    let isBailingOut = false;
    const fetchNext = async () => {
      while (nextRequest < ptRequests.length && !isBailingOut) {
        const i = nextRequest;
        nextRequest += 1;
        let brick;
        try {
          // eslint-disable-next-line no-await-in-loop
          brick = await this._fetchBrick(ptRequests[i]);
        } catch (error) {
          log.error('Failed to fetch brick', ptRequests[i], error);
        }
        if (brick && this._writeBrick(ptRequests[i], slots[i], brick)) {
          uploaded.push({ ptCoord: ptRequests[i], bcIndex: slots[i].bcIndex });
        }

        // Update progress
        this.currentRequestCount -= 1;

        const rlength = this.bricksEverLoaded.size;
        this.bricksEverLoaded.add(`${ptRequests[i].x},${ptRequests[i].y},${ptRequests[i].z}`);
        if (rlength === this.bricksEverLoaded.size) {
          log.debug('DUPLICATE BRICK LOADED', ptRequests[i]);
        }

        if (canBailOut && this.needsBailout) {
          // Stop starting new fetches; those in flight still finish and upload.
          log.debug('Bailing out of handleBrickRequests early due to needsBailout flag');
          this.needsBailout = false; // Reset the flag
          isBailingOut = true;
          // TODO(mark): do something with the allocated slots that were not used?
        }
      }
    };
    await Promise.all(Array.from(
      { length: Math.min(BRICK_FETCH_CONCURRENCY, ptRequests.length) },
      fetchNext,
    ));

    // Reset progress when complete
    this.currentRequestCount = 0;

    // log.debug('this.bricksAllocated', this.bricksAllocated);
    log.debug('this.bricksEverLoaded', this.bricksEverLoaded);
    // log.debug('uploaded bricks');

    /* let Three.js know textures changed */
    // this.bcTHREE.needsUpdate = true;
    // this.ptTHREE.needsUpdate = true;
    return uploaded;
  }

  /* --------------------------------------------------------- *
   * Rebuild the LRUStack with the k least-recently-used bricks *
   * --------------------------------------------------------- */
  _buildLRU() {
    // Update this.LRUStack based on BCTimeStamps.
    // BCTimeStamps is updated during both initial brick upload and processUsageData.
    // However it is not until _buildLRU is called that the timestamps are sorted
    // to update this.LRUStack.
    // Overview bricks are pinned: never candidates for eviction.
    const pinned = new Set(Array.from(this.overviewBricks.values()).flat());
    const brickIndicesWithTimes = this.BCTimeStamps
      .map((time, index) => ({ index, time }))
      .filter(({ index }) => !pinned.has(index));
    this.LRUStack = brickIndicesWithTimes
      .sort((a, b) => a.time - b.time)
      .slice(0, this.k)
      .map(item => item.index);
  }
}
