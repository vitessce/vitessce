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

const PAGE_TABLE_ADDRESS_SIZE = 'uint32';
const BRICK_CACHE_ADDRESS_SIZE = 'uint16';

const MAX_RESOLUTION_LEVELS = 10; // [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
const MAX_CHANNELS = 7; // [0, 1, 2, 3, 4, 5, 6]

// Add a constant for initialization status
const INIT_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETE: 'complete',
  FAILED: 'failed',
};

function log(message) {
  // console.warn(`%cDM: ${message}`,
  //   'background: deeppink; color: white; padding: 2px; border-radius: 3px;');
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

    this.GLCONSTANTS = {
      // this.gl.TEXTURE0,
    };

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

    this.BrickCache = [];
    this.PageTable = [];
    this.ptTHREE = null;
    this.bcTHREE = null;

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
      anchors: [
        [0, 0, 28],
        [16, 16, 15],
        [8, 8, 8],
        [4, 4, 4],
        [2, 2, 2],
        [1, 1, 1],
      ],
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

    // Properties for volume rendering
    this.volumes = new Map(); // Volume data objects keyed by channel index
    this.textures = new Map(); // THREE.js textures keyed by channel index
    this.volumeMinMax = new Map(); // Min/max values keyed by channel index
    this.currentResolution = null;
    this.originalScale = [1, 1, 1]; // Original dimensions
    this.physicalScale = [{ size: 1 }, { size: 1 }, { size: 2.1676 }]; // Physical size scaling

    this.testArray = [];
    this.ptArray = [];
    this.ptManOffsets = [];

    // top k page table addresses
    this.requestsStack = [];

    // brick cache structure for internal calculations
    this.BCTimeStamps = [];
    this.BCMinMax = [];
    this.BCFull = false;
    this.BCUnusedIndex = 0;

    // top k unused brick cache addresses
    this.LRUStack = [];
    this.LRUReady = false;
    this.triggerRequest = true;
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
  async init() {
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
      const shapes = new Array(resolutions).fill(null);
      const arrays = new Array(resolutions).fill(null);

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
          channelCount: 1, // For now hardcoded to 1
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

          const chunkSize = array0.chunks || [BRICK_SIZE, BRICK_SIZE, BRICK_SIZE];
          return [
            Math.ceil((shape[2] || 1) / (chunkSize[2] || BRICK_SIZE)),
            Math.ceil((shape[3] || 1) / (chunkSize[3] || BRICK_SIZE)),
            Math.ceil((shape[4] || 1) / (chunkSize[4] || BRICK_SIZE)),
          ];
        });

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

    // Calculate PT extents first
    this.PT.xExtent = 1;
    this.PT.yExtent = 1;
    this.PT.zExtent = 1;
    const l0z = this.zarrStore.brickLayout[0][0]; // Get z extent from highest resolution
    this.PT.z0Extent = l0z;

    console.warn('PT', this.PT);

    // Sum up the extents from all resolution levels excluding the l0
    for (let i = 1; i < this.zarrStore.brickLayout.length; i++) {
      this.PT.xExtent += this.zarrStore.brickLayout[i][2];
      this.PT.yExtent += this.zarrStore.brickLayout[i][1];
      this.PT.zExtent += this.zarrStore.brickLayout[i][0];
    }

    // Calculate total Z extent including channel offsets
    this.PT.zTotal = this.PT.zExtent + (this.zarrStore.channelCount * l0z);

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
    this.bcTHREE.minFilter = NearestFilter;
    this.bcTHREE.magFilter = NearestFilter;
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

  async initTestData() {
    log('initTestData');

    // const test5 = await this.loadZarrChunk(0, 0, 0, 0, 0, 5);
    const test4 = await this.loadZarrChunk(0, 0, 0, 0, 0, 4);
    const test3 = await this.loadZarrChunk(0, 0, 1, 1, 1, 3);
    const test2 = await this.loadZarrChunk(0, 0, 3, 3, 3, 2);
    const test1 = await this.loadZarrChunk(0, 0, 7, 7, 7, 1);
    const test0 = await this.loadZarrChunk(0, 0, 15, 15, 15, 0);
    this.testArray = [test4, test3, test2, test1, test0];

    console.log('testArray', this.testArray);

    // update page table manually
    const offset0 = new Vector3(15, 15, 43); // 0 0 28 + 15 15 15
    const offset1 = new Vector3(7, 7, 22); // 0 0 15 + 7 7 7
    const offset2 = new Vector3(3, 3, 11); // 0 0 8 + 3 3 3
    const offset3 = new Vector3(1, 1, 5); // 0 0 4 + 1 1 1
    const offset4 = new Vector3(0, 0, 2); // 0 0 2 + 0 0 0
    this.ptManOffsets = [offset0, offset1, offset2, offset3, offset4];

    /*
          [1] 0 — flag resident
          [1] 1 — flag init
          [7] 2…8 — min → 128
          [7] 9…15 — max → 128
          [6] 16…21 — x offset in brick cache → 64
          [6] 22…27 — y offset in brick cache → 64
          [4] 28…31 — z offset in brick cache → 16 (only needs 4 no?)
        */

    const pt0binary = '11000000011111110001010000000000';
    const pt1binary = '11000000011111110001000000000000';
    const pt2binary = '11000000011111110000110000000000';
    const pt3binary = '11000000011111110000100000000000';
    const pt4binary = '11000000011111110000010000000000';

    const pt0 = parseInt(pt0binary, 2) >>> 0;
    const pt1 = parseInt(pt1binary, 2) >>> 0;
    const pt2 = parseInt(pt2binary, 2) >>> 0;
    const pt3 = parseInt(pt3binary, 2) >>> 0;
    const pt4 = parseInt(pt4binary, 2) >>> 0;
    this.ptArray = [pt0, pt1, pt2, pt3, pt4];

    log('initTestData() COMPLETE');
    console.log('ptArray', this.ptArray);
    console.log('ptManOffsets', this.ptManOffsets);
    console.log('testArray', this.testArray);
  }

  async populateBC() {
    log('populateBC');
    console.warn('populateBC', this.bcTHREE);

    const texPropsBC = this.renderer.properties.get(this.bcTHREE);

    // const test5 = await this.loadZarrChunk(0, 0, 0, 0, 0, 5);
    const test4 = await this.loadZarrChunk(0, 0, 0, 0, 0, 4);
    const test3 = await this.loadZarrChunk(0, 0, 1, 1, 2, 3);
    const test2 = await this.loadZarrChunk(0, 0, 4, 3, 4, 2);
    const test1 = await this.loadZarrChunk(0, 0, 8, 7, 7, 1);
    const test0 = await this.loadZarrChunk(0, 0, 15, 15, 15, 0);
    const testArray = [test4, test3, test2, test1, test0];

    const offset0 = new Vector3(15, 15, 43); // 0 0 28 + 15 15 15
    const offset1 = new Vector3(7, 7, 23); // 0 0 15 + 7 7 8
    const offset2 = new Vector3(4, 3, 12); // 0 0 8 + 4 3 4
    const offset3 = new Vector3(2, 1, 5); // 0 0 4 + 2 1 1
    const offset4 = new Vector3(0, 0, 2); // 0 0 2 + 0 0 0
    // const offsets = [offset0, offset1, offset2, offset3, offset4];


    // console.warn('testArray', testArray);

    this.gl.activeTexture(this.gl.TEXTURE2);
    this.gl.bindTexture(this.gl.TEXTURE_3D, texPropsBC.__webglTexture);

    this.gl.pixelStorei(this.gl.UNPACK_ALIGNMENT, 1);

    console.warn('texPropsBC', texPropsBC);

    // Check for WebGL errors after binding
    let error = this.gl.getError();
    console.warn('After bind error:', error);
    for (let i = 0; i < testArray.length; i++) {
      this.gl.texSubImage3D(
        this.gl.TEXTURE_3D,
        0,
        32 * i, 0, 0,
        32, 32, 32,
        this.gl.RED,
        this.gl.UNSIGNED_BYTE,
        testArray[i],
      );
    }
    this.gl.pixelStorei(this.gl.UNPACK_ALIGNMENT, 4);

    this.gl.bindTexture(this.gl.TEXTURE_3D, null);

    // Check for WebGL errors after texSubImage3D
    error = this.gl.getError();
    console.warn('After texSubImage3D for BC error:', error);
  }

  async populatePT() {
    log('populatePT');
    console.warn('populatePT', this.ptTHREE);

    const texPropsPT = this.renderer.properties.get(this.ptTHREE);

    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_3D, texPropsPT.__webglTexture);

    let error = this.gl.getError();
    this.gl.texSubImage3D(
      this.gl.TEXTURE_3D,
      0,
      0, 0, 0,
      1, 1, 1,
      this.gl.RED_INTEGER,
      this.gl.UNSIGNED_INT,
      new Uint32Array([0xFFFFFFFF]), // max value
    );

    // update page table manually
    const offset0 = new Vector3(15, 15, 43); // 0 0 28 + 28 28 28
    const offset1 = new Vector3(7, 7, 23); // 0 0 15 + 14 14 14
    const offset2 = new Vector3(4, 3, 12); // 0 0 8 + 6 6 6
    const offset3 = new Vector3(2, 1, 5); // 0 0 4 + 2 2 2
    const offset4 = new Vector3(0, 0, 2); // 0 0 2 + 0 0 0
    const offsets = [offset0, offset1, offset2, offset3, offset4];

    /*
          [1] 0 — flag resident
          [1] 1 — flag init
          [7] 2…8 — min → 128
          [7] 9…15 — max → 128
          [6] 16…21 — x offset in brick cache → 64
          [6] 22…27 — y offset in brick cache → 64
          [4] 28…31 — z offset in brick cache → 16 (only needs 4 no?)
        */

    const pt0binary = '11000000011111110001000000000000';
    const pt1binary = '11000000011111110000110000000000';
    const pt2binary = '11000000011111110000100000000000';
    const pt3binary = '11000000011111110000010000000000';
    const pt4binary = '11000000011111110000000000000000';


    const pt0 = parseInt(pt0binary, 2) >>> 0;
    const pt1 = parseInt(pt1binary, 2) >>> 0;
    const pt2 = parseInt(pt2binary, 2) >>> 0;
    const pt3 = parseInt(pt3binary, 2) >>> 0;
    const pt4 = parseInt(pt4binary, 2) >>> 0;
    const ptArray = [pt0, pt1, pt2, pt3, pt4];

    for (let i = 0; i < 5; i++) {
      this.gl.texSubImage3D(
        this.gl.TEXTURE_3D,
        0,
        offsets[i].x, offsets[i].y, offsets[i].z,
        1, 1, 1,
        this.gl.RED_INTEGER,
        this.gl.UNSIGNED_INT,
        new Uint32Array([ptArray[i]]),
      );
    }

    this.gl.bindTexture(this.gl.TEXTURE_3D, null);
    error = this.gl.getError();
    console.warn('After texSubImage3D for PT error:', error);
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
   * Get volume data for a specific channel and resolution
   * @param {number} channel - Channel index
   * @param {number} resolution - Resolution level
   * @returns {Promise<Object>} Volume data object
   */
  async getVolumeByChannel(channel, resolution) {
    log('getVolumeByChannel');
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
    const zChunk = chunks[2] || BRICK_SIZE;
    const yChunk = chunks[3] || BRICK_SIZE;
    const xChunk = chunks[4] || BRICK_SIZE;

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
    console.warn('updatePhysicalScale', this.physicalScale);

    log('getVolumeByChannel() COMPLETE');

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
    log('updatePhysicalScale');
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

    log('updatePhysicalScale() COMPLETE');
  }

  /**
   * Create a volume data object from raw volume data
   * @param {Object} volumeOrigin - Raw volume data
   * @returns {Object} Volume data object
   */
  processVolumeData(volumeOrigin) {
    log('processVolumeData');
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
    log('computeMinMax');
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
    log('createVolumeTexture');
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
    log('loadVolumeData');
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
    log('getVolume');
    return this.volumes.get(channel) || null;
  }

  /**
   * Get min/max values for a channel
   * @param {number} channel - Channel index
   * @returns {Array|null} [min, max] values or null if not loaded
   */
  getMinMax(channel) {
    log('getMinMax');
    return this.volumeMinMax.get(channel) || null;
  }

  /**
   * Get physical dimensions
   * @returns {Array} Physical dimensions [X, Y, Z]
   */
  getPhysicalDimensionsXYZ() {
    log('getPhysicalDimensionsXYZ');
    return [this.zarrStore.physicalSizeTotal[2],
      this.zarrStore.physicalSizeTotal[1],
      this.zarrStore.physicalSizeTotal[0]];
  }

  /**
   * Get the maximum resolution
   * @returns {number} Maximum resolution
   */
  getMaxResolutionXYZ() {
    log('getMaxResolutionXYZ');
    return [this.zarrStore.shapes[0][4],
      this.zarrStore.shapes[0][3],
      this.zarrStore.shapes[0][2]];
  }

  getOriginalScaleXYZ() {
    log('getOriginalScaleXYZ');
    return [this.zarrStore.physicalSizeVoxel[2],
      this.zarrStore.physicalSizeVoxel[1],
      this.zarrStore.physicalSizeVoxel[0]];
  }

  getBoxDimensionsXYZ() {
    log('getBoxDimensionsXYZ');
    return [1,
      this.zarrStore.shapes[0][3] / this.zarrStore.shapes[0][4],
      this.zarrStore.shapes[0][2] / this.zarrStore.shapes[0][4],
    ];
  }

  /**
   * Clear all loaded volumes and textures
   */
  clearCache() {
    log('clearCache');
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
    log('loadZarrChunk');
    if (!this.zarrStore || !this.zarrStore.arrays[resolution]) {
      throw new Error('Zarr store or resolution not initialized');
    }

    const array = this.zarrStore.arrays[resolution];
    const chunkEntry = await array.getChunk([t, c, z, y, x]);

    if (!chunkEntry) {
      throw new Error(`No chunk found at coordinates [${t},${c},${z},${y},${x}]`);
    }

    // Ensure the chunk is the expected size
    if (chunkEntry.data.length !== BRICK_SIZE * BRICK_SIZE * BRICK_SIZE) {
      throw new Error(`Unexpected chunk size: ${chunkEntry.data.length}`);
    }

    return chunkEntry.data;
  }

  /**
   * Process data from render targets
   * @param {Float32Array} buffer - Pixel data from render target
   * @param {number} targetId - Which render target (1 or 2)
   */
  async processRequestDataOld(buffer) {
    const counts = new Map();
    // console.log('Sample bytes:', buffer.slice(0, 16)); // 4 RGBA pixels

    let timeStart = performance.now();
    for (let i = 0; i < buffer.length; i += 4) {
      const r = buffer[i]; const g = buffer[i + 1]; const b = buffer[i + 2]; const
        a = buffer[i + 3];
      if (r + g + b + a === 0) continue;

      const packed = ((r << 24) | (g << 16) | (b << 8) | a) >>> 0;
      counts.set(packed, (counts.get(packed) || 0) + 1);
    }
    // ('time taken for counts in ms:', performance.now() - timeStart);

    timeStart = performance.now();
    // Sort by frequency
    const topK = [...counts.entries()]
      .sort((a, b) => b[1] - a[1]) // descending count
      .slice(0, 20) // top 20 requests

      // decode after sorting
      .map(([packed, count]) => {
        const x = (packed >> 22) & 0x3FF;
        const y = (packed >> 12) & 0x3FF;
        const z = packed & 0xFFF;
        return { x, y, z, count };
      });
    // console.log('time taken for topK: in ms', performance.now() - timeStart);
    // console.log('Top requests:', topK);
  }

  async processRequestData(buffer) {
    this.triggerRequest = false;
    // console.log('processRequestData');
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
    this.triggerRequest = true;
  }


  /**
   * Process data from render targets
   * @param {Float32Array} buffer - Pixel data from render target
   * @param {number} targetId - Which render target (1 or 2)
   */
  async processUsageData(buffer) {
    // console.log('Processing data from usage buffer');

    // Process the render target data here
    // This is where you implement your specific processing logic
    // For example:

    // Example: Count number of pixels above threshold
    const threshold = 0.5;
    let pixelsAboveThreshold = 0;

    for (let i = 0; i < buffer.length; i += 4) {
      // Check R channel value
      if (buffer[i] > threshold) {
        pixelsAboveThreshold++;
      }
    }
    // You can add more complex processing here
    // Or store the data for later use
  }

  /* ------------------------------------------------------------- *
 * 1. Convert PT (x,y,z) → { level, bx, by, bz } in Zarr space  *
 * ------------------------------------------------------------- */
  _ptToZarr(ptx, pty, ptz) {
    let channel = -1;
    let resolution = -1;
    let x = -1;
    let y = -1;
    let z = -1;
    // console.log('pt', ptx, pty, ptz);
    if (ptz >= this.PT.z0Extent) {
      resolution = 0;
      x = ptx;
      y = pty;
      z = (ptz - this.PT.zExtent) % this.PT.z0Extent;
      channel = Math.floor((ptz - this.PT.zExtent) / this.PT.z0Extent);
    } else {
      for (let i = 1; i < this.PT.anchors.length; i++) {
        if (ptx < this.PT.anchors[i][0] && pty < this.PT.anchors[i][1] && ptz < this.PT.anchors[i][2]) {
          // all PT coordinates are less than the anchor -> one res lower
        } else {
          resolution = i;
          const channelMask = [0, 0, 0];
          if (ptx >= this.PT.anchors[i][0]) { channelMask[0] = 1; }
          if (pty >= this.PT.anchors[i][1]) { channelMask[1] = 1; }
          if (ptz >= this.PT.anchors[i][2]) { channelMask[2] = 1; }
          const binaryChannel = (channelMask[0] << 2) | (channelMask[1] << 1) | channelMask[2];
          channel = Math.max(1, Math.min(7, binaryChannel)) - 1;
          const thisOffset = channelMask.map((v, j) => v * this.PT.anchors[i][j]);
          x = ptx - thisOffset[0];
          y = pty - thisOffset[1];
          z = ptz - thisOffset[2];
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
 *    (very dumb allocator – good enough until you wire in LRU)  *
 * ------------------------------------------------------------- */
  _allocateBCSlots(n) {
    const slots = [];
    const total = BRICK_CACHE_SIZE_X * BRICK_CACHE_SIZE_Y * BRICK_CACHE_SIZE_Z;

    for (let i = 0; i < n; ++i) {
      const bcIndex = (this.BCUnusedIndex + i) % total; // wrap for now
      const z = Math.floor(bcIndex / (BRICK_CACHE_SIZE_X * BRICK_CACHE_SIZE_Y));
      const rem = bcIndex - z * BRICK_CACHE_SIZE_X * BRICK_CACHE_SIZE_Y;
      const y = Math.floor(rem / BRICK_CACHE_SIZE_X);
      const x = rem % BRICK_CACHE_SIZE_X;

      slots.push({ bcIndex, x, y, z });
    }
    this.BCUnusedIndex = (this.BCUnusedIndex + n) % total;
    return slots;
  }

  /* ------------------------------------------------------------- *
 * 3. Pack PT entry (flags | min | max | bcX | bcY | bcZ)        *
 * ------------------------------------------------------------- */
  _packPT(min, max, bcX, bcY, bcZ) {
    if (min < this.minimumMin) { this.minimumMin = min; console.log('minimumMin', this.minimumMin); }
    if (max > this.maximumMax) { this.maximumMax = max; console.log('maximumMax', this.maximumMax); }
    if (max < this.minimumMax) { this.minimumMax = max; console.log('minimumMax', this.minimumMax); }
    if (min > this.maximumMin) { this.maximumMin = min; console.log('maximumMin', this.maximumMin); }
    // console.log('Raw min/max:', min, max);
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
    /* 4.1 fetch chunk from Zarr */
    const { channel, resolution, x, y, z } = this._ptToZarr(ptCoord.x, ptCoord.y, ptCoord.z);
    // console.log('resolution', resolution);
    // console.log('channel', channel);
    // console.log('zarrX', x);
    // console.log('zarrY', y);
    // console.log('zarrZ', z);
    const chunk = await this.loadZarrChunk(0, channel, z, y, x, resolution);
    // console.log('chunk', chunk);
    /* 4.2 compute min/max (uint8 so this is fast) */
    let min = 255; let
      max = 0;
    for (let i = 0; i < chunk.length; ++i) {
      const v = chunk[i];
      if (v < min) min = v;
      if (v > max) max = v;
    }
    // console.log('min', min);
    // console.log('max', max);

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

    /* 4.4 PT entry upload */
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
    /* 4.5 bookkeeping */
    const now = ++this.timeStamp;
    this.BCTimeStamps[bcSlot.bcIndex] = now;
    this.BCMinMax[bcSlot.bcIndex] = [min, max];
    // console.log('bookkeeping');
  }

  /* ------------------------------------------------------------- *
 * 5. Public: handle a batch of PT requests (array of {x,y,z})   *
 * ------------------------------------------------------------- */
  async handleBrickRequests(ptRequests) {
    // console.log('handleBrickRequests');
    if (ptRequests.length === 0) return;
    // console.log('ptRequests', ptRequests);

    /* <= k requests, allocate same number of bricks */
    const slots = this._allocateBCSlots(ptRequests.length);
    // console.log('slots', slots);

    /* upload each (sequentially or Promise.all if you prefer IO overlap) */
    for (let i = 0; i < ptRequests.length; ++i) {
    // eslint-disable-next-line no-await-in-loop
      await this._uploadBrick(ptRequests[i], slots[i]);
    }
    // console.log('uploaded bricks');

    /* let Three.js know textures changed */
    // this.bcTHREE.needsUpdate = true;
    // this.ptTHREE.needsUpdate = true;
  }
}
