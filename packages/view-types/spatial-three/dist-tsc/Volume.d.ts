export class Volume {
    /**
     * @param {number} xLength Width of the volume
     * @param {number} yLength Length of the volume
     * @param {number} zLength Depth of the volume
     * @param {string} type The type of data (uint8, uint16, ...)
     * @param {ArrayBuffer} arrayBuffer The buffer with volume data
     */
    constructor(xLength: number, yLength: number, zLength: number, type: string, arrayBuffer: ArrayBuffer, ...args: any[]);
    /**
     * @member {Array}  spacing Spacing to apply to the
     * volume from IJK to RAS coordinate system
    */
    spacing: number[];
    /**
     * @member {Array}  offset Offset of the volume in the RAS coordinate system
     */
    offset: number[];
    /**
     * @member {Martrix3} matrix The IJK to RAS matrix
     */
    matrix: Matrix3;
    /**
     * @member {Array} sliceList The list of all the slices associated to this volume
     */
    sliceList: any[];
    /**
     * @member {number} lowerThresholdValue The voxels with values under this
     * threshold won't appear in the slices.
     * If changed, geometryNeedsUpdate is automatically set to true on all
     * the slices associated to this volume
     */
    lowerThresholdValue: number;
    /**
     * @member {number} upperThresholdValue The voxels with values over this
     * threshold won't appear in the slices.
     * If changed, geometryNeedsUpdate is automatically set to true on all
     * the slices associated to this volume
     */
    upperThresholdValue: number;
    /**
     * @member {number} xLength Width of the volume in the IJK coordinate system
     */
    xLength: number | undefined;
    /**
     * @member {number} yLength Height of the volume in the IJK coordinate system
     */
    yLength: number | undefined;
    /**
     * @member {number} zLength Depth of the volume in the IJK coordinate system
   */
    zLength: number | undefined;
    data: Uint8Array | Int8Array | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array | undefined;
    set lowerThreshold(value: number);
    get lowerThreshold(): number;
    set upperThreshold(value: number);
    get upperThreshold(): number;
    /**
     * Shortcut for data[access(i,j,k)]
     * @param {number} i    First coordinate
     * @param {number} j    Second coordinate
     * @param {number} k    Third coordinate
     * @returns {number}  value in the data array
     */
    getData(i: number, j: number, k: number): number;
    /**
     * Compute the index in the data
     * array corresponding to the given coordinates in IJK system
     * @param {number} i    First coordinate
     * @param {number} j    Second coordinate
     * @param {number} k    Third coordinate
     * @returns {number}  index
     */
    access(i: number, j: number, k: number): number;
    /**
     * Retrieve the IJK coordinates of the voxel
     * corresponding of the given index in the data
     * @param {number} index index of the voxel
     * @returns {Array}  [x,y,z]
     */
    reverseAccess(index: number): any[];
    /**
     * Apply a function to all the voxels, be careful,
     * the value will be replaced
     * @param {Function} functionToMap A function to apply to every voxel,
     * will be called with the following parameters:
     * - value of the voxel
     * - index of the voxel
     * - the data (TypedArray)
     * @param {Object} context  You can specify a context in which call the function,
     * default if this Volume
     * @returns {Volume} this
     */
    map(functionToMap: Function, contextParam: any): Volume;
    /**
     * Compute the orientation
     * of the slice and returns all the information relative to the
     * geometry such as sliceAccess,
     * the plane matrix (orientation and position in RAS coordinate)
     * and the dimensions of the plane in both coordinate system.
     * @param {string} axis  the normal axis to the slice 'x' 'y' or 'z'
     * @param {number} index the index of the slice
     * @returns {Object} an object containing all the usefull information
     * on the geometry of the slice
     */
    extractPerpendicularPlane(axis: string, RASIndex: any): Object;
    /**
     * Compute the minimum
     * and the maximum of the data in the volume
     * @returns {Array} [min,max]
     */
    computeMinMax(): any[];
    min: number | undefined;
    max: number | undefined;
}
import { Matrix3 } from 'three';
//# sourceMappingURL=Volume.d.ts.map