import {
  coordinateTransformationsToMatrix,
  getNgffAxes,
  getNgffAxesForTiff,
  physicalSizeToMatrix,
  hexToRgb,
  getSourceFromLoader,
  canLoadResolution,
  getStatsForResolution,
  getBoundingCube,
  isInterleaved as isInterleavedUtil,
} from '@vitessce/spatial-utils';
import { VIEWER_PALETTE } from '@vitessce/utils';
import type { LoadOmeTiffReturnValue } from './ome-tiff-types.js';
import type { LoadOmeZarrReturnValue } from './ome-zarr-types.js';


type VivLoaderType<S extends string[]> = LoadOmeTiffReturnValue<S> | LoadOmeZarrReturnValue<S>;
type VivLoaderDataType<S extends string[]> = VivLoaderType<S>['data'];
type ImageOptions = {
  coordinateTransformations?: object[]; // TODO: stricter type
  offsetsUrl?: string;
};

type ChannelObject = {
  name: string;
  // Defaults that originate from image file contents
  // (takes precedence over automatic defaults below)
  defaultColor?: number[];
  defaultWindow?: [number, number];
  // Defaults for automatic initialization
  // (if defaults above are null or not provided).
  // TODO: should autoDefaultColor be exposed as a separate value?
  // or just set as the value of defaultColor when applicable?
  autoDefaultColor?: number[];
};

type ResolutionObject = {
  height: number;
  width: number;
  depthDownsampled: number;
  totalBytes: number;
  canLoad: boolean;
};

type BoundingCube = [
  [number, number],
  [number, number],
  [number, number]
];

/**
 * A wrapper around the Viv loader, to provide a common interface for
 * all image file types.
 */
export default class ImageWrapper<S extends string[]> {
  vivLoader: VivLoaderType<S>;

  options: ImageOptions;

  constructor(vivLoader: VivLoaderType<S>, options: ImageOptions) {
    this.options = options || {};
    this.vivLoader = vivLoader;

    this.vivLoader.data.forEach((data: any) => {
      const oldIndexer = data._indexer;
      data._indexer = async (selection: any) => {
        const image = await oldIndexer(selection);
        image.fileDirectory.SampleFormat = Uint16Array.from([1]);
        image.fileDirectory.BitsPerSample = Uint16Array.from([16]);
        return image;
      };
    });

  }

  getType(): 'ome-tiff' | 'ome-zarr' {
    if ('Pixels' in this.vivLoader.metadata) {
      return 'ome-tiff';
    }
    if ('omero' in this.vivLoader.metadata) {
      return 'ome-zarr';
    }
    throw new Error('Unknown image type.');
  }

  hasPhysicalSize(): boolean {
    if ('Pixels' in this.vivLoader.metadata) {
      // This is the OME-TIFF case.
      const {
        Pixels: {
          PhysicalSizeX,
          PhysicalSizeXUnit,
          PhysicalSizeY,
          PhysicalSizeYUnit,
        },
      } = this.vivLoader.metadata;
      return Boolean(
        PhysicalSizeX
        && PhysicalSizeXUnit
        && PhysicalSizeY
        && PhysicalSizeYUnit,
      );
    }
    // This is the OME-Zarr case.
    // OME-Zarr is required to have coordinateTransformations.
    return true;
  }

  getData(): VivLoaderDataType<S> {
    return this.vivLoader.data;
  }

  getModelMatrix(): number[] {
    // The user can always provide an additional transform matrix
    // via the file definition options property.
    const { coordinateTransformations: coordinateTransformationsFromOptions } = this.options;
    // We combine any user-provided transform matrix with the one
    // from the image file.
    if ('multiscales' in this.vivLoader.metadata) {
      // OME-Zarr case.
      const {
        multiscales: [
          {
            coordinateTransformations,
            axes,
          },
        ],
      } = this.vivLoader.metadata;
      // Axes in v0.4 format.
      const ngffAxes = getNgffAxes(axes);
      const transformMatrixFromOptions = coordinateTransformationsToMatrix(
        coordinateTransformationsFromOptions, ngffAxes,
      );
      const transformMatrixFromFile = coordinateTransformationsToMatrix(
        coordinateTransformations, ngffAxes,
      );
      const transformMatrix = transformMatrixFromFile.multiplyLeft(transformMatrixFromOptions);
      return transformMatrix;
    }
    if ('Pixels' in this.vivLoader.metadata) {
      // OME-TIFF case.
      const {
        Pixels: {
          PhysicalSizeX,
          PhysicalSizeXUnit,
          PhysicalSizeY,
          PhysicalSizeYUnit,
          PhysicalSizeZ,
          PhysicalSizeZUnit,
          DimensionOrder,
        },
      } = this.vivLoader.metadata;

      const ngffAxes = getNgffAxesForTiff(DimensionOrder);
      const transformMatrixFromOptions = coordinateTransformationsToMatrix(
        coordinateTransformationsFromOptions, ngffAxes,
      );
      // For the OME-TIFF case, we convert the size and unit information
      // to a transformation matrix.
      const transformMatrixFromFile = physicalSizeToMatrix(
        PhysicalSizeX, PhysicalSizeY, PhysicalSizeZ,
        PhysicalSizeXUnit, PhysicalSizeYUnit, PhysicalSizeZUnit,
      );
      const transformMatrix = transformMatrixFromFile.multiplyLeft(transformMatrixFromOptions);
      return transformMatrix;
    }
    throw new Error('Unknown image type.');
  }

  getDefaultTargetT(): number {
    if ('omero' in this.vivLoader.metadata) {
      // OME-Zarr case.
      const {
        omero: {
          rdefs: {
            defaultT,
          },
        },
      } = this.vivLoader.metadata;
      return defaultT || 0;
    }
    return 0;
  }

  getDefaultTargetZ(): number {
    if ('omero' in this.vivLoader.metadata) {
      // OME-Zarr case.
      const {
        omero: {
          rdefs: {
            defaultZ,
          },
        },
      } = this.vivLoader.metadata;
      return defaultZ || 0;
    }
    return 0;
  }

  getName(): string {
    let result;
    if ('Pixels' in this.vivLoader.metadata) {
      // This is the OME-TIFF case.
      const {
        Name,
      } = this.vivLoader.metadata;
      result = Name;
    }
    if ('omero' in this.vivLoader.metadata) {
      // This is the OME-Zarr case.
      const {
        omero: {
          name,
        },
      } = this.vivLoader.metadata;
      result = name;
    }
    if (!result) {
      // Fallback to a default name.
      result = 'Image';
    }
    return result;
  }

  getNumChannels(): number {
    if ('Pixels' in this.vivLoader.metadata) {
      const {
        Pixels: {
          Channels,
        },
      } = this.vivLoader.metadata;
      return Channels.length;
    }
    if ('omero' in this.vivLoader.metadata) {
      const {
        omero: {
          channels,
        },
      } = this.vivLoader.metadata;
      return channels.length;
    }
    // SpatialData case: should be temporary code path,
    // References:
    // - https://github.com/ome/ngff/issues/192
    // - https://github.com/ome/ome-zarr-py/pull/261
    if ('channels_metadata' in this.vivLoader.metadata) {
      const {
        channels_metadata: channelsMetadata,
      } = this.vivLoader.metadata;
      return channelsMetadata?.channels.length || 0;
    }
    if ('image-label' in this.vivLoader.metadata) {
      // As far as I can tell, SpatialData labels
      // are always single-channel bitmasks (as of 2023-09-20).
      return 1;
    }
    return 0;
  }

  getChannelNames(): string[] {
    if ('Pixels' in this.vivLoader.metadata) {
      const {
        Pixels: {
          Channels,
        },
      } = this.vivLoader.metadata;
      return Channels.map((channel, i) => channel.Name || `Channel ${i}`);
    }
    if ('omero' in this.vivLoader.metadata) {
      const {
        omero: {
          channels,
        },
      } = this.vivLoader.metadata;
      return channels.map((channel, i) => channel.label || `Channel ${i}`);
    }
    if ('channels_metadata' in this.vivLoader.metadata) {
      const {
        channels_metadata: channelsMetadata,
      } = this.vivLoader.metadata;
      if (channelsMetadata && Array.isArray(channelsMetadata?.channels)) {
        return channelsMetadata.channels.map(channel => `Channel ${channel.label}`);
      }
    }
    return [];
  }

  getChannelObjects(): ChannelObject[] {
    if ('omero' in this.vivLoader.metadata) {
      // This is the OME-Zarr case.
      const {
        omero: {
          channels,
        },
      } = this.vivLoader.metadata;
      return channels.map((channel, i) => ({
        name: channel.label || `Channel ${i}`,
        defaultColor: channel.color
          ? hexToRgb(channel.color)
          : undefined,
        defaultWindow: channel.window
          ? [channel.window.start, channel.window.end]
          : undefined,
        autoDefaultColor: VIEWER_PALETTE[i % VIEWER_PALETTE.length],
      }));
    }
    if ('Pixels' in this.vivLoader.metadata) {
      const {
        Pixels: {
          Channels,
        },
      } = this.vivLoader.metadata;
      return Channels.map((channel, i) => ({
        name: channel.Name || `Channel ${i}`,
        defaultColor: channel.Color
          ? channel.Color
          : undefined,
        defaultWindow: undefined, // TODO: does OME-TIFF support this?
        autoDefaultColor: VIEWER_PALETTE[i % VIEWER_PALETTE.length],
      }));
    }
    if ('channels_metadata' in this.vivLoader.metadata) {
      const {
        channels_metadata: channelsMetadata,
      } = this.vivLoader.metadata;
      if (channelsMetadata && Array.isArray(channelsMetadata?.channels)) {
        return channelsMetadata.channels.map((channel, i) => ({
          name: `Channel ${channel.label}`,
          defaultColor: undefined,
          defaultWindow: undefined,
          autoDefaultColor: VIEWER_PALETTE[i % VIEWER_PALETTE.length],
        }));
      }
    }
    return [];
  }

  getDtype(): string | undefined {
    const loader = this.vivLoader;
    const source = getSourceFromLoader(loader) as any;
    if ('dtype' in source) {
      return source.dtype as string;
    }
    return undefined;
  }

  hasZStack(): boolean {
    const loader = this.vivLoader;
    const { labels, shape } = Array.isArray(loader.data) ? loader.data[0] : loader.data;
    const hasZStack = shape[labels.indexOf('z')] > 1;
    return hasZStack;
  }

  hasTStack(): boolean {
    const loader = this.vivLoader;
    const { labels, shape } = Array.isArray(loader.data) ? loader.data[0] : loader.data;
    const hasTStack = shape[labels.indexOf('t')] > 1;
    return hasTStack;
  }

  getNumZ(): number {
    const loader = this.vivLoader;
    const { labels, shape } = Array.isArray(loader.data) ? loader.data[0] : loader.data;
    return shape[labels.indexOf('z')];
  }

  getNumT(): number {
    const loader = this.vivLoader;
    const { labels, shape } = Array.isArray(loader.data) ? loader.data[0] : loader.data;
    return shape[labels.indexOf('t')];
  }

  isMultiResolution(): boolean {
    const loader = this.vivLoader;
    const hasViewableResolutions = Boolean(
      Array.from({
        length: loader.data.length,
      }).filter((_, resolution) => canLoadResolution(loader.data, resolution)).length,
    );
    return hasViewableResolutions;
  }

  getMultiResolutionStats(): ResolutionObject[] {
    const loader = this.vivLoader;
    return Array.from({ length: loader.data.length })
      .fill(0)
      // eslint-disable-next-line no-unused-vars
      .map((_, resolution) => {
        const {
          height,
          width,
          depthDownsampled,
          totalBytes,
        } = getStatsForResolution(loader.data, resolution);
        return {
          canLoad: canLoadResolution(loader.data, resolution),
          height,
          width,
          depthDownsampled,
          totalBytes,
        };
      });
  }

  /**
   * Compute an index of an array element returned by getMultiResolutionStats()
   * which corresponds to a "good" automatic target resolution to select.
   * In the future, we could make this more sophisticated, for example
   * to take into account the network speed.
   */
  getAutoTargetResolution(): number|null {
    const multiResStats = this.getMultiResolutionStats();
    if (multiResStats.length === 0) {
      return null;
    }
    let nextTargetResolution = -1;
    let totalBytes = Infinity;
    do {
      nextTargetResolution += 1;
      // eslint-disable-next-line prefer-destructuring
      totalBytes = multiResStats[nextTargetResolution].totalBytes;
    } while (totalBytes > 5e7 && nextTargetResolution < multiResStats.length - 1);
    return nextTargetResolution;
  }

  getBoundingCube(): BoundingCube {
    const loader = this.vivLoader;
    const { labels, shape } = Array.isArray(loader.data) ? loader.data[0] : loader.data;

    const physicalSizeScalingMatrix = this.getModelMatrix();
    const xSlice: [number, number] = [0, physicalSizeScalingMatrix[0] * shape[labels.indexOf('x')]];
    const ySlice: [number, number] = [0, physicalSizeScalingMatrix[5] * shape[labels.indexOf('y')]];
    const zSlice: [number, number] = [
      0,
      physicalSizeScalingMatrix[10] * shape[labels.indexOf('z')],
    ];
    return [xSlice, ySlice, zSlice];
  }

  isInterleaved(): boolean {
    const loader = this.vivLoader;
    const { shape } = Array.isArray(loader.data) ? loader.data[0] : loader.data;
    return isInterleavedUtil(shape);
  }
}
