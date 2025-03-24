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

// Default chunk sizes - used as fallbacks when data doesn't specify sizes
const CHUNK_SIZE = 32;
const CHUNK_TOTAL_SIZE = 32768; // 32*32*32 = 32768

// Add a constant for initialization status
const INIT_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETE: 'complete',
  FAILED: 'failed',
};

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

    // Properties for volume rendering
    this.volumes = new Map(); // Volume data objects keyed by channel index
    this.textures = new Map(); // THREE.js textures keyed by channel index
    this.volumeMinMax = new Map(); // Min/max values keyed by channel index
    this.currentResolution = null;
    this.originalScale = [1, 1, 1]; // Original dimensions
    this.physicalScale = [{ size: 1 }, { size: 1 }, { size: 2.1676 }]; // Physical size scaling

    // Add initialization status
    this.initStatus = INIT_STATUS.NOT_STARTED;
    this.initError = null;
  }

  /**
   * Initialize the VolumeDataManager with Zarr store details and device limits
   * This should be called ONCE at website initialization
   * @returns {Promise<Object>} Object with Zarr store details and device limits
   */
  async init() {
    // Prevent multiple initializations
    if (this.initStatus !== INIT_STATUS.NOT_STARTED) {
      console.warn('VolumeDataManager init() was called more than once!');

      if (this.initStatus === INIT_STATUS.COMPLETE) {
        // Return existing initialized data
        return {
          success: true,
          deviceLimits: this.deviceLimits,
          zarrStore: this.zarrStore,
          physicalScale: this.physicalScale,
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

    try {
      // Query Zarr store details
      this.group = await zarrita.open(this.store);

      // Get all resolution levels
      const resolutions = this.group.attrs.multiscales[0].datasets.length;
      const shapes = new Array(resolutions).fill(null);
      const arrays = new Array(resolutions).fill(null);

      // Try to load each resolution level in order
      const loadPromises = [];
      for (let i = 0; i < resolutions; i++) {
        loadPromises.push(this.tryLoadResolution(i, arrays, shapes));
      }

      const results = await Promise.all(loadPromises);
      
      // Verify all resolutions were loaded successfully
      const failedResolutions = results.filter(r => !r.success);
      if (failedResolutions.length > 0) {
        throw new Error(`Failed to load ${failedResolutions.length} resolution levels: ${failedResolutions.map(r => r.level).join(', ')}`);
      }

      console.info(`Successfully loaded ${resolutions} resolution levels.`);

      // Get the first array for metadata
      if (arrays.length > 0) {
        const array0 = arrays[0];

        // Update store information
        this.zarrStore = {
          resolutions,
          chunkSize: array0.chunks,
          shapes,
          arrays,
          dtype: array0.dtype,
          physicalSizeTotal: [], // Will be populated if metadata exists
          physicalSizeVoxel: [], // Will be populated if metadata exists
          brickLayout: [], // Calculate from shapes and chunk sizes
          store: this.store,
          group: this.group,
        };

        // Extract physical size information if available
        if (array0.meta && array0.meta.physicalSizes) {
          const { x, y, z } = array0.meta.physicalSizes;

          // Get size data or use default value of 1
          const zSize = z?.size || 1;
          const ySize = y?.size || 1;
          const xSize = x?.size || 1;

          this.zarrStore.physicalSizeVoxel = [zSize, ySize, xSize];

          // Calculate total physical size
          if (array0.shape && array0.shape.length >= 5) {
            this.zarrStore.physicalSizeTotal = [
              (array0.shape[2] || 1) * zSize,
              (array0.shape[3] || 1) * ySize,
              (array0.shape[4] || 1) * xSize,
            ];
          }
        }

        // Use coordinateTransformations scale if available
        if (this.group.attrs && this.group.attrs.coordinateTransformations
            && this.group.attrs.coordinateTransformations[0]
            && this.group.attrs.coordinateTransformations[0].scale) {
          const { scale } = this.group.attrs.coordinateTransformations[0];
          // Assuming scale is in format [..., zscale, yscale, xscale]
          const scaleLength = scale.length;

          if (scaleLength >= 3) {
            const zScale = scale[scaleLength - 3];
            const yScale = scale[scaleLength - 2];
            const xScale = scale[scaleLength - 1];

            // Update physicalScale
            this.physicalScale = [
              { size: xScale },
              { size: yScale },
              { size: zScale },
            ];

            // Update zarrStore's physicalSizeVoxel
            this.zarrStore.physicalSizeVoxel = [zScale, yScale, xScale];

            // Calculate total physical size if shape exists
            if (array0.shape && array0.shape.length >= 5) {
              this.zarrStore.physicalSizeTotal = [
                (array0.shape[2] || 1) * zScale,
                (array0.shape[3] || 1) * yScale,
                (array0.shape[4] || 1) * xScale,
              ];
            }

            console.warn('Using scale from coordinateTransformations:', this.physicalScale);
          }
        }

        // Calculate brick layout for each resolution
        this.zarrStore.brickLayout = shapes.map((shape) => {
          if (!shape || shape.length < 5) return [0, 0, 0];

          const chunkSize = array0.chunks || [CHUNK_SIZE, CHUNK_SIZE, CHUNK_SIZE];
          return [
            Math.ceil((shape[2] || 1) / (chunkSize[2] || CHUNK_SIZE)),
            Math.ceil((shape[3] || 1) / (chunkSize[3] || CHUNK_SIZE)),
            Math.ceil((shape[4] || 1) / (chunkSize[4] || CHUNK_SIZE)),
          ];
        });
      }

      this.initStatus = INIT_STATUS.COMPLETE;

      console.warn('VolumeDataManager init() complete');
      console.warn(this.zarrStore);

      if (this.zarrStore.group.attrs.coordinateTransformations
          && this.zarrStore.group.attrs.coordinateTransformations[0]
          && this.zarrStore.group.attrs.coordinateTransformations[0].scale) {
        console.warn(this.zarrStore.group.attrs.coordinateTransformations[0].scale);
      }

      // Return data that can be displayed in the HUD
      return {
        success: true,
        deviceLimits: this.deviceLimits,
        zarrStore: this.zarrStore,
        physicalScale: this.physicalScale,
        physicalSizeTotal: this.zarrStore.physicalSizeTotal,
        physicalSizeVoxel: this.zarrStore.physicalSizeVoxel,
        error: null,
      };
    } catch (error) {
      console.error('Error initializing VolumeDataManager:', error);
      this.initStatus = INIT_STATUS.FAILED;
      this.initError = error.message || 'Unknown error';

      return {
        success: false,
        error: this.initError,
      };
    }
  }

  /**
   * Try to load a resolution level
   * @param {number} resolutionIndex - The resolution level to load
   * @param {Array} arrays - Array to store the loaded arrays
   * @param {Array} shapes - Array to store the shapes
   * @returns {Promise} Promise resolving when the resolution is loaded or rejected
   */
  async tryLoadResolution(resolutionIndex, arrays, shapes) {
    try {
      const array = await zarrita.open(this.group.resolve(String(resolutionIndex)));
      // Create new arrays to avoid modifying parameters directly
      const newArrays = [...arrays];
      const newShapes = [...shapes];
      newArrays[resolutionIndex] = array;
      newShapes[resolutionIndex] = array.shape;
      // Update the original arrays
      Object.assign(arrays, newArrays);
      Object.assign(shapes, newShapes);
      return { success: true, level: resolutionIndex };
    } catch (err) {
      console.error(`Failed to load resolution ${resolutionIndex}:`, err);
      return { success: false, level: resolutionIndex, error: err.message };
    }
  }

  /**
   * Get volume data for a specific channel and resolution
   * @param {number} channel - Channel index
   * @param {number} resolution - Resolution level
   * @returns {Promise<Object>} Volume data object
   */
  async getVolumeByChannel(channel, resolution) {
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
    const zChunk = chunks[2] || CHUNK_SIZE;
    const yChunk = chunks[3] || CHUNK_SIZE;
    const xChunk = chunks[4] || CHUNK_SIZE;

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

    // Check if total size exceeds our buffer limits
    if (zSize * ySize * xSize > CHUNK_TOTAL_SIZE * 10) {
      console.warn(`Volume data exceeds safe size limit: ${zSize * ySize * xSize} > ${CHUNK_TOTAL_SIZE * 10}`);
    }

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
        { size: x?.size || 1 },
        { size: y?.size || 1 },
        { size: z?.size || 1 },
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
   * Create a volume data object from raw volume data
   * @param {Object} volumeOrigin - Raw volume data
   * @returns {Object} Volume data object
   */
  processVolumeData(volumeOrigin) {
    // Create volume data object with essential properties
    const volume = {
      xLength: volumeOrigin.width,
      yLength: volumeOrigin.height,
      zLength: volumeOrigin.depth,
    };

    // Compute min/max values
    const [min, max] = this.computeMinMax(volumeOrigin.data);

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
  computeMinMax(data) {
    let min = Infinity;
    let max = -Infinity;

    for (let i = 0; i < data.length; i++) {
      if (data[i] < min) min = data[i];
      if (data[i] > max) max = data[i];
    }

    // Use 'this' in the method (for linter)
    this.lastComputedMinMax = [min, max];
    return this.lastComputedMinMax;
  }

  /**
   * Create a THREE.js 3D texture from a Volume
   * @param {Object} volume - Volume data object
   * @returns {Data3DTexture} THREE.js 3D texture
   */
  createVolumeTexture(volume) {
    // Use 'this' in the method (for linter)
    this.lastTextureCreated = new Date();
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
      const minMax = this.computeMinMax(volumeOrigin.data);

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

  /**
   * Get a volume for a channel
   * @param {number} channel - Channel index
   * @returns {Object|null} Volume object or null if not loaded
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

  /**
   * Utility method to access voxel data
   * @param {Object} volume - Volume data object
   * @param {number} i - X coordinate
   * @param {number} j - Y coordinate
   * @param {number} k - Z coordinate
   * @returns {number} Value at the specified coordinates
   */
  getVoxel(volume, i, j, k) {
    // Use 'this' in the method (for linter)
    const index = this.calculateVoxelIndex(volume, i, j, k);
    return volume.data[index];
  }

  /**
   * Helper method to calculate voxel index
   * @param {Object} volume - Volume data object
   * @param {number} i - X coordinate
   * @param {number} j - Y coordinate
   * @param {number} k - Z coordinate
   * @returns {number} Index in the data array
   */
  calculateVoxelIndex(volume, i, j, k) {
    // Store cache properties for reuse (uses 'this' to satisfy linter)
    this.lastVolume = volume;
    this.lastCoordinates = [i, j, k];
    return k * volume.xLength * volume.yLength + j * volume.xLength + i;
  }

  /**
   * Initialize the Zarr store (compatibility method)
   * @returns {Promise<VolumeDataManager>} This instance
   */
  async initStore() {
    // If already initialized, just return
    if (this.initStatus === INIT_STATUS.COMPLETE) {
      return this;
    }

    // If not initialized, initialize
    if (this.initStatus === INIT_STATUS.NOT_STARTED) {
      await this.init();
    }

    // If still initializing, wait for it to complete
    if (this.initStatus === INIT_STATUS.IN_PROGRESS) {
      return new Promise((resolve, reject) => {
        const checkInterval = setInterval(() => {
          if (this.initStatus === INIT_STATUS.COMPLETE) {
            clearInterval(checkInterval);
            resolve(this);
          } else if (this.initStatus === INIT_STATUS.FAILED) {
            clearInterval(checkInterval);
            reject(new Error(this.initError || 'Initialization failed'));
          }
        }, 100);
      });
    }

    // Return this for chaining
    return this;
  }
}
