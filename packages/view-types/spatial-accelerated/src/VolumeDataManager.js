/* eslint-disable no-console */
/* eslint-disable no-bitwise */
/* eslint-disable no-underscore-dangle */
/* eslint-disable max-len */

// NOTES:
// 2048 x 2048 x 32 = 4096 bricks, around 134 MB
// 2048 x 2048 x 64 = 8192 bricks, around 268 MB
// 2048 x 2048 x 128 = 16384 bricks, around 537 MB
// 2048 x 2048 x 256 = 32768 bricks, around 1.074 GB
// 2048 x 2048 x 512 = 65536 bricks, around 2.148 GB
// 2048 x 2048 x 1024 = 131072 bricks, around 4.295 GB

// eslint-disable-next-line import/no-unresolved
// eslint-disable-next-line import/no-extraneous-dependencies

import * as zarrita from 'zarrita';
import {
  Data3DTexture,
  RedFormat,
  RedIntegerFormat,
  FloatType,
  UnsignedByteType,
  UnsignedIntType,
  LinearFilter,
  NearestFilter,
  Vector3,
} from 'three';

// Default chunk sizes
// const CHUNK_SIZE = 32;
// const CHUNK_TOTAL_SIZE = 32768; // 32*32*32 = 32768
const BRICK_SIZE = 32;
const BRICK_CACHE_SIZE_X = 64;
const BRICK_CACHE_SIZE_Y = 64;
const BRICK_CACHE_SIZE_Z = 4;
// const BRICK_CACHE_SIZE_TOTAL = BRICK_CACHE_SIZE_X * BRICK_CACHE_SIZE_Y * BRICK_CACHE_SIZE_Z;

const BRICK_CACHE_SIZE_VOXELS_X = BRICK_CACHE_SIZE_X * BRICK_SIZE;
const BRICK_CACHE_SIZE_VOXELS_Y = BRICK_CACHE_SIZE_Y * BRICK_SIZE;
const BRICK_CACHE_SIZE_VOXELS_Z = BRICK_CACHE_SIZE_Z * BRICK_SIZE;
const totalBricks = BRICK_CACHE_SIZE_X * BRICK_CACHE_SIZE_Y * BRICK_CACHE_SIZE_Z;

const PAGE_TABLE_ADDRESS_SIZE = 'uint32';
const BRICK_CACHE_ADDRESS_SIZE = 'uint16';

const MAX_RESOLUTION_LEVELS = 10; // [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
const MAX_CHANNELS = 7; // [0, 1, 2, 3, 4, 5, 6]

// const manualChannelSelection = 0;

// Add a constant for initialization status
const INIT_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETE: 'complete',
  FAILED: 'failed',
};

function log(message) {
  console.warn(`%cDM: ${message}`, 'background: blue; color: white; padding: 2px; border-radius: 3px;');
}

export class VolumeDataManager {
  constructor(url, gl, renderer) {
    log('CLASS INITIALIZING');
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

    // const maxFragmentUniformVectors = this.gl.getParameter(this.gl.MAX_FRAGMENT_UNIFORM_VECTORS);
    // console.warn('maxFragmentUniformVectors', maxFragmentUniformVectors);
    // 1024

    this.renderer = renderer;

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

    console.warn('GL CONSTANTS');
    console.warn(this.gl);
    console.warn(this.gl.TEXTURE0);
    console.warn(this.gl.textures);
    console.warn('RENDERER');
    console.warn(this.renderer);

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

    this.minimumMin = 255;
    this.maximumMin = 0;
    this.minimumMax = 255;
    this.maximumMax = 0;

    this.bricksAllocated = 0;
    this.bricksEverLoaded = new Set();

    // Properties for volume rendering
    this.originalScale = [1, 1, 1]; // Original dimensions
    // this.physicalScale = [{ size: 1 }, { size: 1 }, { size: 2.1676 }]; // Physical size scaling
    this.physicalScale = [{ size: 1 }, { size: 1 }, { size: 1 }]; // Physical size scaling
    this.testArray = [];
    this.ptArray = [];
    this.ptManOffsets = [];

    // top k page table addresses
    this.requestsStack = [];
    this.isBusy = false;

    // brick cache structure for internal calculations
    const totalBricks = BRICK_CACHE_SIZE_X * BRICK_CACHE_SIZE_Y * BRICK_CACHE_SIZE_Z;
    this.BCTimeStamps = new Array(totalBricks).fill(0);
    this.BCMinMax = new Array(totalBricks).fill([0, 0]);
    this.BCFull = false;
    this.BCUnusedIndex = 0;

    // brick cache to page table mapping
    this.bc2pt = new Array(totalBricks).fill(null);

    // top k unused brick cache addresses
    this.LRUStack = [];
    this.LRUReady = false;
    this.triggerUsage = true;
    this.triggerRequest = false;
    this.timeStamp = 0;
    this.k = 40;
    this.noNewRequests = false;

    // Add initialization status
    this.initStatus = INIT_STATUS.NOT_STARTED;
    this.initError = null;
    log('VolumeDataManager constructor complete');
  }

  /**
   * Initialize the VolumeDataManager with Zarr store details and device limits
   * This should be called ONCE at website initialization
   * @returns {Promise<Object>} Object with Zarr store details and device limits
   */
  async init(config) {
    log('INIT()');
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
    log('INIT() IN PROGRESS');
    try {
      // Query Zarr store details
      this.group = await zarrita.open(this.store);

      // Get all resolution levels
      const resolutions = this.group.attrs.multiscales[0].datasets.length;
      this.zarrStore.resolutions = resolutions;
      console.log('resolutions in init', resolutions);
      const shapes = new Array(resolutions).fill(null);
      const arrays = new Array(resolutions).fill(null);
      const scales = new Array(resolutions).fill(null);

      // Try to load each resolution level in order
      const loadPromises = [];
      for (let i = 0; i < resolutions; i++) {
        loadPromises.push(this.tryLoadResolution(i, arrays, shapes));
      }

      const results = await Promise.all(loadPromises);

      console.warn('results', results);

      // Verify all resolutions were loaded successfully
      const failedResolutions = results.filter(r => !r.success);
      if (failedResolutions.length > 0) {
        throw new Error(`Failed to load ${failedResolutions.length} resolution levels: ${failedResolutions.map(r => r.level).join(', ')}`);
      }

      console.info(`Successfully loaded ${resolutions} resolution levels.`);

      console.info('shapes', shapes);

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
          channelCount: shapes[0][1],
          scales,
        };

        // initializing channel mappings and slots as empty
        this.channels.colorMappings = new Array(Math.min(this.zarrStore.channelCount, 7)).fill(-1);
        this.channels.zarrMappings = new Array(Math.min(this.zarrStore.channelCount, 7)).fill(undefined);
        this.channels.downsampleMin = new Array(Math.min(this.zarrStore.channelCount, 7)).fill(undefined);
        this.channels.downsampleMax = new Array(Math.min(this.zarrStore.channelCount, 7)).fill(undefined);

        console.log('zarrMappings in init', this.channels.zarrMappings);
        console.log('downsampleMin in init', this.channels.downsampleMin);
        console.log('downsampleMax in init', this.channels.downsampleMax);

        // Extract physical size information if available
        if (array0.meta && array0.meta.physicalSizes) {
          const { x, y, z } = array0.meta.physicalSizes;

          // Get size data or use default value of 1
          const zSize = z?.size || 1;
          const ySize = y?.size || 1;
          const xSize = x?.size || 1;

          this.zarrStore.physicalSizeVoxel = [zSize, ySize, xSize];

          console.log('avail physicalSizeVoxel', this.zarrStore.physicalSizeVoxel);

          // Calculate total physical size
          if (array0.shape && array0.shape.length >= 5) {
            this.zarrStore.physicalSizeTotal = [
              (array0.shape[2] || 1) * zSize,
              (array0.shape[3] || 1) * ySize,
              (array0.shape[4] || 1) * xSize,
            ];
          }
        } else {
          console.log('no physicalSizeVoxel');
          this.zarrStore.physicalSizeVoxel = [1, 1, 1];
          this.zarrStore.physicalSizeTotal = [
            array0.shape[2] || 1,
            array0.shape[3] || 1,
            array0.shape[4] || 1,
          ];
          console.log('default physicalSizeVoxel', this.zarrStore.physicalSizeVoxel);
          console.log('default physicalSizeTotal', this.zarrStore.physicalSizeTotal);
        }

        console.warn('group.attrs', this.group.attrs);
        if (this.group.attrs && this.group.attrs.multiscales
            && this.group.attrs.multiscales[0].datasets
            && this.group.attrs.multiscales[0].datasets[0].coordinateTransformations) {
          for (let i = 0; i < resolutions; i++) {
            if (this.group.attrs.multiscales[0].datasets[i]
                && this.group.attrs.multiscales[0].datasets[i].coordinateTransformations
                && this.group.attrs.multiscales[0].datasets[i].coordinateTransformations[0]
                && this.group.attrs.multiscales[0].datasets[i].coordinateTransformations[0].scale) {
              const { scale } = this.group.attrs.multiscales[0].datasets[i].coordinateTransformations[0];
              scales[i] = [scale[4], scale[3], scale[2]];
              console.warn('scale', i, scales[i]);
            }
          }
        } else {
          console.error('no coordinateTransformations available, assuming downsampling ratio of 2 per dimension');
          for (let i = 0; i < resolutions; i++) {
            const scale = Math.pow(2, i);
            scales[i] = [scale, scale, scale];
          }
        }

        console.warn('scales', scales);
        this.zarrStore.scales = scales;

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

            console.warn('physicalScale', this.physicalScale);

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

          const chunkSize = array0.chunks || [BRICK_SIZE, BRICK_SIZE, BRICK_SIZE];
          return [
            Math.ceil((shape[2] || 1) / (chunkSize[2] || BRICK_SIZE)),
            Math.ceil((shape[3] || 1) / (chunkSize[3] || BRICK_SIZE)),
            Math.ceil((shape[4] || 1) / (chunkSize[4] || BRICK_SIZE)),
          ];
        });

        console.warn('zarrStore', this.zarrStore);

        // init channel mappings
        console.log('initializing channel mappings');
        console.log('config', config);
        // for each key in config, add to channel mappings
        Object.keys(config).forEach((key, i) => {
          const configChannel = config[key].spatialTargetC;
          this.channels.zarrMappings[i] = configChannel;
          this.channels.colorMappings[i] = i;
          this.channels.downsampleMin[i] = this.zarrStore.group.attrs?.omero?.channels?.[configChannel]?.window?.min || 0;
          this.channels.downsampleMax[i] = this.zarrStore.group.attrs?.omero?.channels?.[configChannel]?.window?.max || 65535;
        });
        console.log('zarrMappings after init', this.channels.zarrMappings);
        console.log('colorMappings after init', this.channels.colorMappings);
        console.log('downsampleMin after init', this.channels.downsampleMin);
        console.log('downsampleMax after init', this.channels.downsampleMax);

        // Initialize MRMCPT textures after we have all the necessary information
        this.initMRMCPT();
        // this.populateMRMCPT();
        this.testTexture();
      }

      this.initStatus = INIT_STATUS.COMPLETE;
      log('INIT() COMPLETE');

      console.warn(this.zarrStore);

      if (this.zarrStore.group.attrs.coordinateTransformations
          && this.zarrStore.group.attrs.coordinateTransformations[0]
          && this.zarrStore.group.attrs.coordinateTransformations[0].scale) {
        console.warn('scale', this.zarrStore.group.attrs.coordinateTransformations[0].scale);
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
      log('INIT() FAILED');
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
   * Initialize the BrickCache and PageTable
   */
  initMRMCPT() {
    log('initMRMCPT');

    console.warn('initMRMCPT', this.zarrStore.shapes[0]);
    console.warn('initMRMCPT', this.zarrStore.channelCount);
    console.warn('initMRMCPT', this.channels.zarrMappings);
    console.warn('initMRMCPT', this.channels.colorMappings);

    // Calculate PT extents first
    this.PT.xExtent = 1;
    this.PT.yExtent = 1;
    this.PT.zExtent = 1;
    const l0z = this.zarrStore.brickLayout[0][0]; // Get z extent from highest resolution
    this.PT.z0Extent = l0z;

    console.warn('PT', this.PT);

    console.warn('PT anchors', this.PT.anchors);

    console.warn('PT anchors with 0', this.PT.anchors);

    this.PT.lowestDataRes = this.zarrStore.brickLayout.length - 1;
    console.warn('lowestDataRes', this.PT.lowestDataRes);

    // Sum up the extents from all resolution levels excluding the l0
    for (let i = this.zarrStore.brickLayout.length - 1; i > 0; i--) {
      this.PT.anchors.push([
        this.PT.xExtent,
        this.PT.yExtent,
        this.PT.zExtent,
      ]);
      this.PT.xExtent += this.zarrStore.brickLayout[i][2];
      this.PT.yExtent += this.zarrStore.brickLayout[i][1];
      this.PT.zExtent += this.zarrStore.brickLayout[i][0];
    }

    this.PT.anchors.push([0, 0, this.PT.zExtent]);
    this.PT.anchors.reverse();

    console.warn('PT anchors', this.PT.anchors);

    // Calculate total Z extent including channel offsets
    // this.PT.zTotal = this.PT.zExtent + (this.zarrStore.channelCount * l0z);
    this.PT.zTotal = this.PT.zExtent + this.channels.zarrMappings.length * l0z;
    console.log('number of PT channels', this.channels.zarrMappings.length);

    console.warn('Page Table Extents:', {
      x: this.PT.xExtent,
      y: this.PT.yExtent,
      z: this.PT.zExtent,
      z0: this.PT.z0Extent,
      zTotal: this.PT.zTotal,
    });

    // Initialize the BrickCache as a 3D texture (uint8)
    const brickCacheData = new Uint8Array(
      BRICK_CACHE_SIZE_VOXELS_X
        * BRICK_CACHE_SIZE_VOXELS_Y
        * BRICK_CACHE_SIZE_VOXELS_Z,
    );
    brickCacheData.fill(0);

    // Initialize the PageTable data using calculated extents
    const pageTableData = new Uint32Array(
      this.PT.xExtent * this.PT.yExtent * this.PT.zTotal,
    );
    pageTableData.fill(0);

    this.bcTHREE = new Data3DTexture(
      brickCacheData,
      BRICK_CACHE_SIZE_VOXELS_X,
      BRICK_CACHE_SIZE_VOXELS_Y,
      BRICK_CACHE_SIZE_VOXELS_Z,
    );
    this.bcTHREE.format = RedFormat;
    this.bcTHREE.type = UnsignedByteType;
    this.bcTHREE.internalFormat = 'R8';
    // this.bcTHREE.minFilter = NearestFilter;
    // this.bcTHREE.magFilter = NearestFilter;
    this.bcTHREE.minFilter = LinearFilter;
    this.bcTHREE.magFilter = LinearFilter;
    this.bcTHREE.generateMipmaps = false;
    this.bcTHREE.needsUpdate = true;

    this.ptTHREE = new Data3DTexture(
      pageTableData,
      this.PT.xExtent,
      this.PT.yExtent,
      this.PT.zTotal,
    );
    this.ptTHREE.format = RedIntegerFormat;
    this.ptTHREE.type = UnsignedIntType;
    this.ptTHREE.internalFormat = 'R32UI';
    this.ptTHREE.minFilter = NearestFilter;
    this.ptTHREE.magFilter = NearestFilter;
    this.ptTHREE.generateMipmaps = false;
    this.ptTHREE.needsUpdate = true;

    console.warn('gl', this.gl);
    console.warn('renderer', this.renderer);

    log('initMRMCPT() COMPLETE');
  }

  testTexture() {
    console.warn('testTexture pt', this.ptTHREE);
    console.warn('testTexture bc', this.bcTHREE);
  }

  async initTexture() {
    const requests = [
      { x: 0, y: 0, z: 1 },
    ];
    await this.handleBrickRequests(requests);
  }

  updateChannels(channelProps) {
    log('updateChannels');
    console.log('channelProps', channelProps);

    console.error('TODO: init channel mappings first ');
    console.log('this.channels.zarrMappings', this.channels.zarrMappings);
    console.log('this.channels.colorMappings', this.channels.colorMappings);
    console.log('this.channels.downsampleMin', this.channels.downsampleMin);
    console.log('this.channels.downsampleMax', this.channels.downsampleMax);

    if (this.channels.zarrMappings.length === 0) {
      console.error('channels not initialized yet');
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
      console.log('Channel mappings unchanged, skipping update');
      // return;
    }

    console.log('Channel mappings changed:', {
      current: currentSorted,
      requested: requestedSorted,
    });

    // Instead of for...of loop, use Object.entries() with forEach
    Object.entries(channelProps).forEach(([uiChannelKey, channelData]) => {
      const targetZarrChannel = channelData.spatialTargetC;

      console.log(`UI channel "${uiChannelKey}" wants zarr channel ${targetZarrChannel}`);

      // Check if this zarr channel is already mapped
      const existingSlotIndex = this.channels.zarrMappings.indexOf(targetZarrChannel);

      if (existingSlotIndex === -1) {
        // Need to allocate a new slot for this zarr channel
        const nextFreeSlot = this.channels.zarrMappings.findIndex(slot => slot === undefined);
        if (nextFreeSlot !== -1) {
          this.channels.zarrMappings[nextFreeSlot] = targetZarrChannel;
          console.log('channelData', channelData);
          console.log('this.zarrStore.group.attrs?.omero?.channels', this.zarrStore.group.attrs?.omero?.channels);
          console.log('targetZarrChannel', targetZarrChannel);
          this.channels.downsampleMin[nextFreeSlot] = this.zarrStore.group.attrs?.omero?.channels?.[targetZarrChannel]?.window?.min || 0;
          this.channels.downsampleMax[nextFreeSlot] = this.zarrStore.group.attrs?.omero?.channels?.[targetZarrChannel]?.window?.max || 65535;
          console.log(`Mapped zarr channel ${targetZarrChannel} to slot ${nextFreeSlot}`);
          console.log('channels', this.channels);
        } else {
          console.log('No free slots found, looking for unused mapped channels');

          // Find zarr channels that are currently mapped but no longer requested
          const currentlyMapped = this.channels.zarrMappings.filter(mapping => mapping !== undefined);
          const stillRequested = requestedZarrChannels; // We calculated this earlier
          const unusedMappedChannels = currentlyMapped.filter(mappedChannel => !stillRequested.includes(mappedChannel));

          console.log('Currently mapped:', currentlyMapped);
          console.log('Still requested:', stillRequested);
          console.log('Unused mapped channels:', unusedMappedChannels);

          if (unusedMappedChannels.length > 0) {
            // Find the first slot that maps to an unused zarr channel
            const slotToReuse = this.channels.zarrMappings.findIndex(mapping => unusedMappedChannels.includes(mapping));

            if (slotToReuse !== -1) {
              const oldZarrChannel = this.channels.zarrMappings[slotToReuse];
              this.channels.zarrMappings[slotToReuse] = targetZarrChannel;
              this.channels.downsampleMin[slotToReuse] = this.zarrStore.group.attrs?.omero?.channels?.[targetZarrChannel]?.window?.min || 0;
              this.channels.downsampleMax[slotToReuse] = this.zarrStore.group.attrs?.omero?.channels?.[targetZarrChannel]?.window?.max || 65535;
              console.log(`Reused slot ${slotToReuse}: ${oldZarrChannel} -> ${targetZarrChannel}`);

              this._purgeChannel(slotToReuse);
            } else {
              console.error('Could not find slot to reuse - this should not happen');
            }
          } else {
            console.error('All slots are full and all mapped channels are still in use');
          }
        }
      } else {
        console.log(`Zarr channel ${targetZarrChannel} already mapped to slot ${existingSlotIndex}`);
      }
    });

    const newColorMappings = Object.values(channelProps).map((ch) => {
      const slot = this.channels.zarrMappings.indexOf(ch.spatialTargetC);
      return slot !== -1 ? slot : -1;
    });

    while (newColorMappings.length < 7) {
      newColorMappings.push(-1);
    }

    console.log('newColorMappings', newColorMappings);
    this.channels.colorMappings = newColorMappings;

    console.log('updatedChannels', this.channels);

    console.error('TODO: not implemented yet');
  }

  /**
   * Try to load a resolution level
   * @param {number} resolutionIndex - The resolution level to load
   * @param {Array} arrays - Array to store the loaded arrays
   * @param {Array} shapes - Array to store the shapes
   * @returns {Promise} Promise resolving when the resolution is loaded or rejected
   */
  async tryLoadResolution(resolutionIndex, arrays, shapes) {
    log('tryLoadResolution');
    console.warn(resolutionIndex, arrays, shapes);
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
      log('tryLoadResolution() COMPLETE');
      return { success: true, level: resolutionIndex };
    } catch (err) {
      console.error(`Failed to load resolution ${resolutionIndex}:`, err);
      return { success: false, level: resolutionIndex, error: err.message };
    }
  }

  /**
   * Get physical dimensions
   * @returns {Array} Physical dimensions [X, Y, Z]
   */
  getPhysicalDimensionsXYZ() {
    console.log('getPhysicalDimensionsXYZ');
    console.log('this.zarrStore.physicalSizeTotal', this.zarrStore.physicalSizeTotal);
    const out = [this.zarrStore.physicalSizeTotal[2],
      this.zarrStore.physicalSizeTotal[1],
      this.zarrStore.physicalSizeTotal[0]];
    console.log('out', out);
    return out;
  }

  /**
   * Get the maximum resolution
   * @returns {number} Maximum resolution
   */
  getMaxResolutionXYZ() {
    console.log('getMaxResolutionXYZ');
    console.log('this.zarrStore.shapes', this.zarrStore.shapes);
    const out = [this.zarrStore.shapes[0][4],
      this.zarrStore.shapes[0][3],
      this.zarrStore.shapes[0][2]];
    console.log('out', out);
    return out;
  }

  getOriginalScaleXYZ() {
    log('getOriginalScaleXYZ');
    console.log('this.zarrStore.physicalSizeVoxel', this.zarrStore.physicalSizeVoxel);
    const out = [this.zarrStore.physicalSizeVoxel[2],
      this.zarrStore.physicalSizeVoxel[1],
      this.zarrStore.physicalSizeVoxel[0]];
    console.log('out', out);
    return out;
  }

  getNormalizedScaleXYZ() {
    console.log('getNormalizedScaleXYZ');
    const out = [
      1.0,
      this.zarrStore.physicalSizeVoxel[1] / this.zarrStore.physicalSizeVoxel[2],
      this.zarrStore.physicalSizeVoxel[0] / this.zarrStore.physicalSizeVoxel[0],
    ];
    console.log('out', out);
    return out;
  }

  getBoxDimensionsXYZ() {
    console.log('getBoxDimensionsXYZ');
    console.log('this.zarrStore.shapes', this.zarrStore.shapes);
    const out = [1,
      this.zarrStore.shapes[0][3] / this.zarrStore.shapes[0][4],
      this.zarrStore.shapes[0][2] / this.zarrStore.shapes[0][4],
    ];
    console.log('out', out);
    return out;
  }

  /**
   * Load a specific Zarr chunk based on [t,c,z,y,x] coordinates
   * @param {number} t - Time point (default 0)
   * @param {number} c - Channel (default 0)
   * @param {number} z - Z coordinate
   * @param {number} y - Y coordinate
   * @param {number} x - X coordinate
   * @param {number} resolution - Resolution level
   * @returns {Promise<Uint8Array>} 32x32x32 chunk data
   */
  async loadZarrChunk(t = 0, c = 0, z, y, x, resolution) {
    // log('loadZarrChunk');
    if (!this.zarrStore || !this.zarrStore.arrays[resolution]) {
      throw new Error('Zarr store or resolution not initialized');
    }

    // console.warn('loadZarrChunk', t, c, z, y, x, resolution);

    const array = this.zarrStore.arrays[resolution];
    const chunkEntry = await array.getChunk([t, c, z, y, x]);

    // console.log('chunkEntry', chunkEntry);

    if (!chunkEntry) {
      throw new Error(`No chunk found at coordinates [${t},${c},${z},${y},${x}]`);
    }

    // Ensure the chunk is the expected size
    if (chunkEntry.data.length !== BRICK_SIZE * BRICK_SIZE * BRICK_SIZE) {
      throw new Error(`Unexpected chunk size: ${chunkEntry.data.length}`);
    }

    return chunkEntry.data;
  }

  async processRequestData(buffer) {
    if (this.isBusy) return;
    this.isBusy = true;
    this.triggerRequest = false;

    const counts = new Map();
    for (let i = 0; i < buffer.length; i += 4) {
      const r = buffer[i]; const g = buffer[i + 1]; const b = buffer[i + 2]; const
        a = buffer[i + 3];
      if ((r | g | b | a) === 0) continue;
      const packed = ((r << 24) | (g << 16) | (b << 8) | a) >>> 0;
      counts.set(packed, (counts.get(packed) || 0) + 1);
    }
    // console.log('counts', counts);
    // console.log('this.k', this.k);
    /* Top‑K (≤ k) PT requests */
    const requests = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, this.k)
      .map(([packed]) => ({
        x: (packed >> 22) & 0x3FF,
        y: (packed >> 12) & 0x3FF,
        z: packed & 0xFFF,
      }));
    if (requests.length === 0) {
      this.noNewRequests = true;
    }
    // console.log('requests', requests);
    await this.handleBrickRequests(requests);
    this.triggerUsage = true;
    this.isBusy = false;
  }


  async processUsageData(buffer) {
    if (this.isBusy) return;
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
      if ((x | y | z) === 0) continue;

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
    if (this.BCFull) this._buildLRU();

    // console.warn('this.BCTimeStamps', this.BCTimeStamps);
    // console.warn('this.timeStamp', this.timeStamp);
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
    console.log('purging channel', ptChannelIndex);
    console.log('corresponding zarr channel', this.channels.zarrMappings[ptChannelIndex]);

    if (!this.ptTHREE) {
      console.error('pagetable texture not initialized');
      return;
    }

    this.channels.downsampleMin[ptChannelIndex] = undefined;
    this.channels.downsampleMax[ptChannelIndex] = undefined;
    this.channels.zarrMappings[ptChannelIndex] = undefined;

    const channelMask = this.PT.channelOffsets[ptChannelIndex];

    console.log('channelMask', channelMask);
    console.error('TODO: not tested yet');

    const { gl } = this;
    const texPT = this.renderer.properties.get(this.ptTHREE).__webglTexture;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_3D, texPT);

    for (let r = 0; r < this.zarrStore.resolutions; r++) {
      const anchor = [
        this.PT.anchors[r][2] * channelMask[2],
        this.PT.anchors[r][1] * channelMask[1],
        this.PT.anchors[r][0] * channelMask[0],
      ];
      console.log('anchor', anchor);
      const extents = this.zarrStore.brickLayout[r];
      const size = extents[0] * extents[1] * extents[2];
      console.log('extents', extents);
      console.log('size', size);
      // texsub 3D
      // replace with a block of zeros
      gl.texSubImage3D(
        gl.TEXTURE_3D, 0,
        anchor[0], anchor[1], anchor[2],
        extents[0], extents[1], extents[2],
        gl.RED_INTEGER, gl.UNSIGNED_INT,
        new Uint32Array(size),
      );
    }
    gl.bindTexture(gl.TEXTURE_3D, null);
  }

  // Pack PT entry indicating "not resident but init" with min/max preserved
  _packPTNotResident(min, max, bcX, bcY, bcZ) {
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

  // Update a PT entry
  _updatePTEntry(ptX, ptY, ptZ, ptVal) {
    if (!this.ptTHREE) return;

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

  _ptToZarr(ptx, pty, ptz) {
    let channel = -1;
    let resolution = -1;
    let x = -1;
    let y = -1;
    let z = -1;
    // console.log('pt', ptx, pty, ptz);
    // console.log('pt', ptx, pty, ptz);
    // console.log('ptz', this.PT.z, this.PT.l0z);
    if (ptz >= this.PT.zExtent) {
      // console.log('ptz >= this.PT.zExtent');
      resolution = 0;
      x = ptx;
      y = pty;
      z = (ptz - this.PT.zExtent) % this.PT.z0Extent;
      channel = Math.floor((ptz - this.PT.zExtent) / this.PT.z0Extent);
    } else {
      // console.log('ptz < this.PT.zExtent');
      // console.log('this.PT.anchors', this.PT.anchors);
      for (let i = 1; i < this.PT.anchors.length; i++) {
        if (ptx < this.PT.anchors[i][0] && pty < this.PT.anchors[i][1] && ptz < this.PT.anchors[i][2]) {
          // all PT coordinates are less than the anchor -> one res lower
          // console.log('all PT coordinates are less than the anchor -> one res lower');
        } else {
          // console.log('not all PT coordinates are less than the anchor ', this.PT.anchors[i]);
          resolution = i;
          const channelMask = [0, 0, 0];
          // console.log('ptx', ptx);
          // console.log('pty', pty);
          // console.log('ptz', ptz);
          // console.log('this.PT.anchors[i]', this.PT.anchors[i]);
          if (ptx >= this.PT.anchors[i][0]) { channelMask[0] = 1; }
          if (pty >= this.PT.anchors[i][1]) { channelMask[1] = 1; }
          if (ptz >= this.PT.anchors[i][2]) { channelMask[2] = 1; }
          const binaryChannel = (channelMask[0] << 2) | (channelMask[1] << 1) | channelMask[2];
          channel = Math.max(1, Math.min(7, binaryChannel)) - 1;
          // console.log('channel', channel);
          const thisOffset = channelMask.map((v, j) => v * this.PT.anchors[i][j]);
          // console.log('thisOffset', thisOffset);
          x = ptx - thisOffset[0];
          y = pty - thisOffset[1];
          z = ptz - thisOffset[2];
          // console.log('x', x);
          // console.log('y', y);
          // console.log('z', z);
          break;
        }
      }
    }
    // console.log(channel, resolution, x, y, z);

    return {
      channel,
      resolution,
      x,
      y,
      z,
    };
  }

  /* ------------------------------------------------------------- *
 * 2. Allocate the next n free bricks in the brick cache         *
 * ------------------------------------------------------------- */
  _allocateBCSlots(n) {
    let slots = [];
    const total = BRICK_CACHE_SIZE_X * BRICK_CACHE_SIZE_Y * BRICK_CACHE_SIZE_Z;

    if (!this.BCFull && this.BCUnusedIndex + n > total) {
      this.BCFull = true;
      console.warn('BRICK CACHE FULL');
    }
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
      if (this.LRUStack.length < n) this._buildLRU(); // top-up list
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
 * 3. Pack PT entry (flags | min | max | bcX | bcY | bcZ)        *
 * ------------------------------------------------------------- */
  _packPT(min, max, bcX, bcY, bcZ) {
    // Scale down to 7-bit range (0-127) by dividing by 2
    const clamp7 = v => Math.max(0, Math.min(127, Math.floor(v / 2)));
    // console.log('Scaled min/max:', clamp7(min), clamp7(max));
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

  /* ------------------------------------------------------------- *
 * 4. Upload one brick + PT entry                                *
 * ------------------------------------------------------------- */
  async _uploadBrick(ptCoord, bcSlot) {
    // console.log('uploading brick', ptCoord, bcSlot);

    if (ptCoord.x >= this.PT.xExtent
      || ptCoord.y >= this.PT.yExtent
      || ptCoord.z >= this.PT.zTotal
      || ptCoord.x < 0
      || ptCoord.y < 0
      || ptCoord.z < 0
    ) {
      console.error('this.PT', this.PT);
      console.error('ptCoord out of bounds', ptCoord);
      return;
    }

    // console.log('ptCoord', ptCoord);
    // console.log('this.PT', this.PT);


    /* 4.1 fetch chunk from Zarr */
    const { channel, resolution, x, y, z } = this._ptToZarr(ptCoord.x, ptCoord.y, ptCoord.z);

    const zarrChannel = this.channels.zarrMappings[channel];

    if (zarrChannel === undefined || zarrChannel === -1) {
      console.error('zarrChannel is undefined or -1', zarrChannel);
      return;
    }

    let chunk = await this.loadZarrChunk(0, zarrChannel, z, y, x, resolution);
    // console.log('chunk', chunk);

    if (chunk instanceof Uint16Array) {
      if (this.channels.downsampleMin[channel] === undefined) {
        // get the channel ID from this.channels.zarrMappings
        const channelId = this.channels.zarrMappings[channel];
        console.log('channelId was not found in this.channels.downsampleMin[channel]', channelId);
        // get the downsample min and max for the channel from omero
        this.channels.downsampleMin[channel] = this.zarrStore.group.attrs?.omero?.channels?.[channelId]?.window?.min || 0;
        this.channels.downsampleMax[channel] = this.zarrStore.group.attrs?.omero?.channels?.[channelId]?.window?.max || 65535;

        console.log('this.channels.downsampleMin[channel]', this.channels.downsampleMin[channel]);
        console.log('this.channels.downsampleMax[channel]', this.channels.downsampleMax[channel]);

        console.log('this.zarrStore.group.attrs?.omero?.channels', this.zarrStore.group.attrs?.omero?.channels);
        console.log('this.channels.downsampleMin[channel]', this.channels.downsampleMin[channel]);
      }
      const uint8Chunk = new Uint8Array(chunk.length);
      for (let i = 0; i < chunk.length; i++) {
        // Scale from 0-65535 to 0-255
        uint8Chunk[i] = Math.floor((chunk[i] - this.channels.downsampleMin[channel]) / (this.channels.downsampleMax[channel] - this.channels.downsampleMin[channel]) * 255);
      }
      chunk = uint8Chunk;
    }

    // console.log('chunk', chunk);
    chunk = new Uint8Array(chunk);
    // if (chunk instanceof Uint8Array) {
    //   console.log('chunk is Uint8Array');
    // }

    let min = 255;
    let max = 0;

    for (let i = 0; i < chunk.length; ++i) {
      const v = chunk[i];
      if (v < min) min = v;
      if (v > max) max = v;
    }

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
    // console.log('uploaded brick');

    const error = gl.getError();
    if (error !== gl.NO_ERROR) {
      console.error('WebGL error during brick upload:', error, chunk);
    }

    /* 4.4 PT entry upload */
    if (channel >= this.channels.zarrMappings.length) {
      console.log('channel is out of bounds', channel);
      min = 255;
      max = 255;
    }

    const ptVal = this._packPT(min, max, bcSlot.x, bcSlot.y, bcSlot.z);
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
    // console.log('uploaded PT entry');
    // console.log('ptVal', ptVal);
    // console.log('min', min);
    // console.log('max', max);
    // console.log('bcSlot', bcSlot);
    // console.log('channel', channel);
    // console.log('resolution', resolution);
    // console.log('x', x);
    // console.log('y', y);
    // console.log('z', z);
    // console.log('ptCoord', ptCoord);

    const error2 = gl.getError();
    if (error2 !== gl.NO_ERROR) {
      console.error('WebGL error during pagetable upload:', error2, chunk);
    }

    /* 4.5 bookkeeping */
    // const now = ++this.timeStamp;
    this.BCTimeStamps[bcSlot.bcIndex] = this.timeStamp;
    this.BCMinMax[bcSlot.bcIndex] = [min, max];
    this.bc2pt[bcSlot.bcIndex] = ptCoord;
    // console.log('bookkeeping');
  }

  /* ------------------------------------------------------------- *
 * 5. Public: handle a batch of PT requests (array of {x,y,z})   *
 * ------------------------------------------------------------- */
  async handleBrickRequests(ptRequests) {
    // console.log('handleBrickRequests');
    if (ptRequests.length === 0) return;
    // console.log('ptRequests', ptRequests);
    // console.log('this.BCFull', this.BCFull);
    // console.log('this.BCUnusedIndex', this.BCUnusedIndex);
    // console.log('this.BCTimeStamps', this.BCTimeStamps);
    // console.log('this.LRUStack', this.LRUStack);

    /* <= k requests, allocate same number of bricks */
    const slots = this._allocateBCSlots(ptRequests.length);
    // console.log('slots', slots);

    /* upload each (sequentially or Promise.all if you prefer IO overlap) */
    for (let i = 0; i < ptRequests.length; ++i) {
    // eslint-disable-next-line no-await-in-loop
      await this._uploadBrick(ptRequests[i], slots[i]);
      this.bricksAllocated++;
      const rlength = this.bricksEverLoaded.size;
      this.bricksEverLoaded.add(`${ptRequests[i].x},${ptRequests[i].y},${ptRequests[i].z}`);
      if (rlength === this.bricksEverLoaded.size) {
        console.warn('DUPLICATE BRICK LOADED', ptRequests[i]);
      }
    }
    // console.log('this.bricksAllocated', this.bricksAllocated);
    console.log('this.bricksEverLoaded', this.bricksEverLoaded);
    // console.log('uploaded bricks');

    /* let Three.js know textures changed */
    // this.bcTHREE.needsUpdate = true;
    // this.ptTHREE.needsUpdate = true;
  }

  /* --------------------------------------------------------- *
   * Rebuild the LRUStack with the k least-recently-used bricks *
   * --------------------------------------------------------- */
  _buildLRU() {
    const brickIndicesWithTimes = this.BCTimeStamps
      .map((time, index) => ({ index, time }));
    this.LRUStack = brickIndicesWithTimes
      .sort((a, b) => a.time - b.time)
      .slice(0, this.k)
      .map(item => item.index);
  }
}
