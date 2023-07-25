
/* eslint-disable */
import {
  coordinateTransformationsToMatrix,
  getNgffAxes,
  getNgffAxesForTiff,
  physicalSizeToMatrix,
  hexToRgb,
  getSourceFromLoader,
  canLoadResolution,
  getStatsForResolution,
} from '@vitessce/spatial-utils';
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
  defaultColor?: number[];
  defaultWindow?: [number, number];
};

type ResolutionObject = {
  height: number;
  width: number;
  depthDownsampled: number;
  totalBytes: number;
};

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
      }));
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
      .filter((_, resolution) => (loader.data && canLoadResolution(loader.data, resolution)))
      .map((_, resolution) => {
        const {
          height,
          width,
          depthDownsampled,
          totalBytes,
        } = getStatsForResolution(loader.data, resolution);
        return {
          height,
          width,
          depthDownsampled,
          totalBytes,
        };
      });
  }
}
