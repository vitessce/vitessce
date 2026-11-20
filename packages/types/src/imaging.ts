import type { LoadOmeTiffReturnValue } from './ome-tiff-types.js';
import type { LoadOmeZarrReturnValue } from './ome-zarr-types.js';

export type VivLoaderType = LoadOmeTiffReturnValue<string[]> | LoadOmeZarrReturnValue<string[]>;
export type VivLoaderDataType = VivLoaderType['data'];

export type ImageOptions = {
  coordinateSystem?: string;
  coordinateTransformations?: object[]; // TODO: stricter type
  offsetsUrl?: string;
};

export type ChannelObject = {
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

export type ResolutionObject = {
  height: number;
  width: number;
  depth: number;
  depthDownsampled: number;
  totalBytes: number;
  canLoad: boolean;
  dims: Record<string, number>;
};

/**
 * One resolution level of an image, as stored.
 * chunks are the Zarr chunk shape, or for OME-TIFF the level's own TIFF tile
 * (one plane deep), in the order of labels.
 */
export type ResolutionLevel = {
  shape: number[];
  labels: string[];
  chunks: number[];
  // viv dtype name, e.g. 'Uint16'.
  dtype: string;
  // OME-Zarr: the scale of the level's multiscales dataset, in the order of
  // labels. Undefined when the metadata has none (and for OME-TIFF).
  scale?: number[];
  // What reads the level: the zarrita array (OME-Zarr)
  // or the viv TiffPixelSource (OME-TIFF).
  data: unknown;
};

export type ChannelWindow = [number, number] | undefined;

export type BoundingCube = [
  [number, number],
  [number, number],
  [number, number]
];

/**
 * The format of an image. Radiology images (DICOM and NIfTI) have synthesized
 * OME-NGFF metadata, but are not backed by Zarr arrays.
 */
export type ImageType = 'ome-tiff' | 'ome-zarr' | 'radiology';

export interface AbstractImageWrapper {

  getType(): ImageType;

  hasPhysicalSize(): boolean;

  getData(): VivLoaderDataType;

  getModelMatrix(): number[];

  getDefaultTargetT(): number;

  getDefaultTargetZ(): number;

  getName(): string;

  getNumChannels(): number;

  getChannelNames(): string[];

  getChannelObjects(): ChannelObject[];

  getDtype(): string | undefined;

  hasZStack(): boolean;

  hasTStack(): boolean;

  getNumZ(): number;

  getNumT(): number;

  isMultiResolution(): boolean;

  getMultiResolutionStats(): ResolutionObject[];

  /**
   * Compute an index of an array element returned by getMultiResolutionStats()
   * which corresponds to a "good" automatic target resolution to select.
   * In the future, we could make this more sophisticated, for example
   * to take into account the network speed.
   */
  getAutoTargetResolution(): number|null;

  getBoundingCube(): BoundingCube;

  isInterleaved(): boolean;

  getSpatialUnit(): string | null;

  getSceneMetersPerUnit(): number | null;

  getVoxelSpacing(): [number, number, number];

  getResolutionLevels(): Promise<ResolutionLevel[]>;

  getChannelWindows(): Promise<ChannelWindow[]>;
}
