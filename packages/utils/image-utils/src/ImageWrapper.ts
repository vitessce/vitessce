
import type { LoadOmeTiffReturnValue } from './ome-tiff-types';
import type { LoadOmeZarrReturnValue } from './ome-zarr-types';
import {
  coordinateTransformationsToMatrix,
  getNgffAxes,
  getNgffAxesForTiff,
  physicalSizeToMatrix,
} from '@vitessce/spatial-utils';


type VivLoaderType<S extends string[]> = LoadOmeTiffReturnValue<S> | LoadOmeZarrReturnValue<S>;
type ImageOptions = {
  coordinateTransformations?: number[];
  offsetsUrl?: string;
};

type ChannelObject = {
  name: string;
  defaultColor?: number[];
  defaultWindow?: [number, number];
};


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
        && PhysicalSizeYUnit
      );
    }
    // This is the OME-Zarr case.
    // OME-Zarr is required to have coordinateTransformations.
    return true;
  }

  getData() {
    return this.vivLoader.data;
  }

  getTransformMatrix(): number[] {
    const { coordinateTransformations: coordinateTransformationsFromOptions } = this.options;
    if('multiscales' in this.vivLoader.metadata) {
      // OME-Zarr case.
      const {
        multiscales: [
          {
            coordinateTransformations,
            axes,
          }
        ]
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
    if('omero' in this.vivLoader.metadata){
      // This is the OME-Zarr case.
      const {
        omero: {
          name,
        },
      } = this.vivLoader.metadata;
      result = name;
    }
    if(!result) {
      // Fallback to a default name.
      result = 'Image';
    }
    return result;
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
      return channels.map(c => c.label);
    }
    return [];
  }

  getChannelObjects(): ChannelObject[] {
    // TODO
  }

}
