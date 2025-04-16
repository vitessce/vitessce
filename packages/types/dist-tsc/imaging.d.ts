import type { LoadOmeTiffReturnValue } from './ome-tiff-types.js';
import type { LoadOmeZarrReturnValue } from './ome-zarr-types.js';
export type VivLoaderType = LoadOmeTiffReturnValue<string[]> | LoadOmeZarrReturnValue<string[]>;
export type VivLoaderDataType = VivLoaderType['data'];
export type ImageOptions = {
    coordinateTransformations?: object[];
    offsetsUrl?: string;
};
export type ChannelObject = {
    name: string;
    defaultColor?: number[];
    defaultWindow?: [number, number];
    autoDefaultColor?: number[];
};
export type ResolutionObject = {
    height: number;
    width: number;
    depthDownsampled: number;
    totalBytes: number;
    canLoad: boolean;
};
export type BoundingCube = [
    [
        number,
        number
    ],
    [
        number,
        number
    ],
    [
        number,
        number
    ]
];
export interface AbstractImageWrapper {
    getType(): 'ome-tiff' | 'ome-zarr';
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
    getAutoTargetResolution(): number | null;
    getBoundingCube(): BoundingCube;
    isInterleaved(): boolean;
}
//# sourceMappingURL=imaging.d.ts.map