// TODO: add constants here
// store device limits here
// keep track of the current chunks
// later -- create octree structure for accessing
// handle the chunk loading
// reference viewport settings

import * as zarrita from 'zarrita';
import {
  Data3DTexture,
  RedFormat,
  FloatType,
  LinearFilter,
} from 'three';
import { Volume } from './Volume.js';

// constants for now
const CHUNK_SIZE = 32;
const CHUNK_TOTAL_SIZE = 32768;

class Brick {
  constructor() {
    this.resolution = null; // 0 through 6
    this.brickIndex = []; // [0, 0, 0] the one needed for querying in zarr store
    this.spatialExtents = []; // can be [0, 0, 0] to [1024, 1024, 795]
    this.min = null;
    this.max = null;
  }

  // 1 for solid, 0 for relevant, -1 for empty
  isVisible(min, max) {
    if (max < this.min) return 1;
    if (min > this.max) return -1;
    return 0;
  }
}

export class VolumeDataManager {
  constructor(url, gl) {
    this.url = url;
    this.store = new zarrita.FetchStore(url);
    
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
    
    // Create a mock context if we couldn't get a real one
    if (!this.gl || typeof this.gl.getParameter !== 'function') {
      console.warn('Unable to get WebGL context, using mock context');
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
        MAX_TEXTURE_SIZE: 'MAX_TEXTURE_SIZE',
        MAX_3D_TEXTURE_SIZE: 'MAX_3D_TEXTURE_SIZE',
        MAX_RENDERBUFFER_SIZE: 'MAX_RENDERBUFFER_SIZE',
        MAX_UNIFORM_BUFFER_BINDINGS: 'MAX_UNIFORM_BUFFER_BINDINGS',
      };
    }
    
    this.deviceLimits = {
      maxTextureSize: this.gl.getParameter(this.gl.MAX_TEXTURE_SIZE),
      max3DTextureSize: this.gl.getParameter(this.gl.MAX_3D_TEXTURE_SIZE),
      maxRenderbufferSize: this.gl.getParameter(this.gl.MAX_RENDERBUFFER_SIZE),
      maxUniformBufferBindings: this.gl.getParameter(this.gl.MAX_UNIFORM_BUFFER_BINDINGS),
    };
    this.zarrStore = {
      resolutions: null, // 6
      chunkSize: [], // [32, 32, 32]
      shapes: [], // [[795, 1024, 1024], ..., [64, 64, 64], [32, 32, 32]]
      arrays: [], // [array0, array1, array2, array3, array4, array5]
      dtype: '', // 'uint8'
      physicalSizeTotal: [], // [795 x 0.0688, 1024 x 0.03417, 1024 x 0.03417]
      physicalSizeVoxel: [], // [0.0688, 0.03417, 0.03417]
      brickLayout: [], // [[25, 32, 32],[13, 16, 16], ..., [2,2,2],[1,1,1]]
      store: '', // ref to this.store
      group: '', // ref to this.group
    };
    this.cacheStatus = {
      chunksCached: 0,
      cacheFull: false,
      cacheSize: 0,
      cacheLimit: 0,
      cacheUsed: 0,
      cacheUsedPercent: 0,
    };
    this.logValues = {
      totalChunksRequestedFromServer: 0,
      loadTimeLastChunk: 0,
      loadTimeTotal: 0,
      loadTimeAverage: 0,
    };

    this.brickCache = [];
    this.brickCacheAddresses = new Map();

    // Add new properties for volume rendering
    this.volumes = new Map(); // Volume objects keyed by channel index
    this.textures = new Map(); // THREE.js textures keyed by channel index
    this.volumeMinMax = new Map(); // Min/max values keyed by channel index
    this.currentResolution = null;
    this.originalScale = [1, 1, 1]; // Original dimensions
    this.physicalScale = [{ size: 1 }, { size: 1 }, { size: 2.1676 }]; // Physical size scaling
  }

  async initStore() {
    this.group = await zarrita.open(this.store);
    this.array0 = await zarrita.open(this.group.resolve('0'));
    this.array1 = await zarrita.open(this.group.resolve('1'));
    this.array2 = await zarrita.open(this.group.resolve('2'));
    this.array3 = await zarrita.open(this.group.resolve('3'));
    this.array4 = await zarrita.open(this.group.resolve('4'));
    this.array5 = await zarrita.open(this.group.resolve('5'));

    this.zarrStore.chunkSize = this.array0.chunkSize;
    this.zarrStore.shape = this.array0.shape;
    this.zarrStore.dtype = this.array0.dtype;
    this.zarrStore.physicalSize = this.array0.physicalSize;
    this.zarrStore.dimensions = this.array0.dimensions;
    this.zarrStore.store = this.group.store;

    this.firstBrick = new Brick();

    return this;
  }

  /**
   * Get volume data for a specific channel and resolution
   * @param {number} channel - Channel index
   * @param {number} resolution - Resolution level
   * @returns {Promise<Object>} Volume data object
   */
  async getVolumeByChannel(channel, resolution) {
    const downsampleDepth = 2 ** resolution;

    // For now, we're hardcoding to use a test dataset
    // In a real implementation, this would use the store initialized above
    const root = new zarrita.FetchStore('https://vitessce-data-v2.s3.us-east-1.amazonaws.com/data/zarr_test/kingsnake_1c_32_z.zarr/');
    const rootGroup = await zarrita.open(root);

    // Load the array at the requested resolution
    const array = await zarrita.open(rootGroup.resolve(String(resolution)));

    // Extract dimensions from array
    const shapeRes = array.shape;
    const { chunks } = array;

    // Get the sizes for each dimension
    const zSize = shapeRes[2];
    const ySize = shapeRes[3];
    const xSize = shapeRes[4];

    // Create a buffer for the volume data
    // In a production system, this would use the correct dtype from the Zarr metadata
    const volumeData = new Uint8Array(zSize * ySize * xSize);

    // Extract chunk sizes
    const zChunk = chunks[2];
    const yChunk = chunks[3];
    const xChunk = chunks[4];

    // Calculate number of chunks in each dimension
    const zChunkCount = Math.ceil(zSize / zChunk);
    const yChunkCount = Math.ceil(ySize / yChunk);
    const xChunkCount = Math.ceil(xSize / xChunk);

    // Collect all chunk coordinate jobs
    const allChunkJobs = [];
    for (let cz = 0; cz < zChunkCount; cz++) {
      for (let cy = 0; cy < yChunkCount; cy++) {
        for (let cx = 0; cx < xChunkCount; cx++) {
          allChunkJobs.push([cz, cy, cx]);
        }
      }
    }

    // Load each chunk and copy into the volumeData buffer
    await Promise.all(allChunkJobs.map(async ([cz, cy, cx]) => {
      const chunkEntry = await array.getChunk([0, 0, cz, cy, cx]);
      if (!chunkEntry) {
        return;
      }

      const chunkData = chunkEntry.data;

      // Calculate chunk boundaries
      const zStart = cz * zChunk;
      const yStart = cy * yChunk;
      const xStart = cx * xChunk;

      // Actual size may be smaller at boundaries
      const actualZ = Math.min(zSize - zStart, zChunk);
      const actualY = Math.min(ySize - yStart, yChunk);
      const actualX = Math.min(xSize - xStart, xChunk);

      // Copy chunk data into the volumeData buffer
      let idx = 0;
      for (let z = 0; z < actualZ; z++) {
        for (let y = 0; y < actualY; y++) {
          for (let x = 0; x < actualX; x++) {
            const globalZ = zStart + z;
            const globalY = yStart + y;
            const globalX = xStart + x;
            const globalIndex = globalX + globalY * xSize + globalZ * xSize * ySize;

            volumeData[globalIndex] = chunkData[idx];
            idx++;
          }
        }
      }
    }));

    // Store information about physical dimensions if available
    this.updatePhysicalScale(array);

    // Return the volume data
    return {
      data: volumeData,
      width: xSize,
      height: ySize,
      depth: zSize,
    };
  }

  /**
   * Extract and update physical scale information from array metadata
   * @param {Object} array - Zarr array with metadata
   */
  updatePhysicalScale(array) {
    if (array.meta && array.meta.physicalSizes) {
      const { x, y, z } = array.meta.physicalSizes;
      this.physicalScale = [
        { size: x.size || 1 },
        { size: y.size || 1 },
        { size: z.size || 1 },
      ];
    }

    // Set original scale from the array shape
    if (array.shape) {
      this.originalScale = [
        array.shape[4], // X dimension
        array.shape[3], // Y dimension
        array.shape[2], // Z dimension
      ];
    }
  }

  /**
   * Create a Volume object from raw volume data
   * @param {Object} volumeOrigin - Raw volume data
   * @returns {Volume} Volume object
   */
  processVolumeData(volumeOrigin) {
    const volume = new Volume();
    volume.xLength = volumeOrigin.width;
    volume.yLength = volumeOrigin.height;
    volume.zLength = volumeOrigin.depth;

    // Compute min/max values
    const [min, max] = this._computeMinMax(volumeOrigin.data);

    // Normalize values to float in [0,1] range
    const normalizedData = new Float32Array(volumeOrigin.data.length);
    for (let i = 0; i < volumeOrigin.data.length; i++) {
      normalizedData[i] = (volumeOrigin.data[i] - min) / Math.sqrt((max ** 2) - (min ** 2));
    }

    volume.data = normalizedData;
    return volume;
  }

  /**
   * Compute min and max values in a data array
   * @param {TypedArray} data - Data array
   * @returns {Array} [min, max] values
   */
  _computeMinMax(data) {
    let min = Infinity;
    let max = -Infinity;

    for (let i = 0; i < data.length; i++) {
      if (data[i] < min) min = data[i];
      if (data[i] > max) max = data[i];
    }

    return [min, max];
  }

  /**
   * Create a THREE.js 3D texture from a Volume
   * @param {Volume} volume - Volume object
   * @returns {Data3DTexture} THREE.js 3D texture
   */
  createVolumeTexture(volume) {
    const texture = new Data3DTexture(volume.data, volume.xLength, volume.yLength, volume.zLength);
    texture.format = RedFormat;
    texture.type = FloatType;
    texture.generateMipmaps = false;
    texture.minFilter = LinearFilter;
    texture.magFilter = LinearFilter;
    texture.needsUpdate = true;
    return texture;
  }

  /**
   * Load volume data for multiple channels
   * @param {Array} channelTargetC - Channel indices to load
   * @param {number} resolution - Target resolution
   * @returns {Promise<Object>} Object with loaded volume data
   */
  async loadVolumeData(channelTargetC, resolution) {
    // Only load channels that aren't already loaded at this resolution
    const channelsToLoad = channelTargetC
      .filter(channel => !this.volumes.has(channel) || resolution !== this.currentResolution);

    // If nothing to load, return current state
    if (channelsToLoad.length === 0) {
      return {
        volumes: this.volumes,
        textures: this.textures,
        volumeMinMax: this.volumeMinMax,
      };
    }

    // Load each channel's volume data
    const volumeOrigins = await Promise.all(
      channelsToLoad.map(channel => this.getVolumeByChannel(channel, resolution)),
    );

    // Process and store each loaded volume
    channelsToLoad.forEach((channel, index) => {
      const volumeOrigin = volumeOrigins[index];
      const volume = this.processVolumeData(volumeOrigin);
      const minMax = this._computeMinMax(volumeOrigin.data);

      this.volumes.set(channel, volume);
      this.textures.set(channel, this.createVolumeTexture(volume));
      this.volumeMinMax.set(channel, minMax);
    });

    this.currentResolution = resolution;

    return {
      volumes: this.volumes,
      textures: this.textures,
      volumeMinMax: this.volumeMinMax,
    };
  }

  /* Accessor methods */

  /**
   * Get a volume for a channel
   * @param {number} channel - Channel index
   * @returns {Volume|null} Volume object or null if not loaded
   */
  getVolume(channel) {
    return this.volumes.get(channel) || null;
  }

  /**
   * Get a texture for a channel
   * @param {number} channel - Channel index
   * @returns {Data3DTexture|null} Texture or null if not loaded
   */
  getTexture(channel) {
    return this.textures.get(channel) || null;
  }

  /**
   * Get min/max values for a channel
   * @param {number} channel - Channel index
   * @returns {Array|null} [min, max] values or null if not loaded
   */
  getMinMax(channel) {
    return this.volumeMinMax.get(channel) || null;
  }

  /**
   * Get physical scale
   * @returns {Array} Array of scale objects for X, Y, Z
   */
  getScale() {
    return this.physicalScale;
  }

  /**
   * Get original dimensions
   * @returns {Array} Original dimensions [X, Y, Z]
   */
  getOriginalDimensions() {
    return this.originalScale;
  }

  /**
   * Clear all loaded volumes and textures
   */
  clearCache() {
    // Dispose THREE.js textures first to avoid memory leaks
    this.textures.forEach((texture) => {
      if (texture && texture.dispose) {
        texture.dispose();
      }
    });

    this.volumes.clear();
    this.textures.clear();
    this.volumeMinMax.clear();
  }

  // update brick data
}
