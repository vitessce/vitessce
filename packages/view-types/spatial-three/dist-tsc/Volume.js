/**
 * This class had been written to handle the output of the NRRD loader.
 * It contains a volume of data and informations about it.
 * For now it only handles 3 dimensional data.
 * See the webgl_loader_nrrd.html example and the loaderNRRD.js
 * file to see how to use this class.
 * @author Valentin Demeusy / https://github.com/stity
 */
import { Matrix3, Matrix4, Vector3, } from 'three';
export class Volume {
    /**
     * @param {number} xLength Width of the volume
     * @param {number} yLength Length of the volume
     * @param {number} zLength Depth of the volume
     * @param {string} type The type of data (uint8, uint16, ...)
     * @param {ArrayBuffer} arrayBuffer The buffer with volume data
     */
    constructor(xLength, yLength, zLength, type, arrayBuffer) {
        /**
         * @member {Array}  spacing Spacing to apply to the
         * volume from IJK to RAS coordinate system
        */
        this.spacing = [1, 1, 1];
        /**
         * @member {Array}  offset Offset of the volume in the RAS coordinate system
         */
        this.offset = [0, 0, 0];
        /**
         * @member {Martrix3} matrix The IJK to RAS matrix
         */
        this.matrix = new Matrix3();
        this.matrix.identity();
        /**
         * @member {Array} sliceList The list of all the slices associated to this volume
         */
        this.sliceList = [];
        /**
         * @member {number} lowerThresholdValue The voxels with values under this
         * threshold won't appear in the slices.
         * If changed, geometryNeedsUpdate is automatically set to true on all
         * the slices associated to this volume
         */
        this.lowerThresholdValue = -Infinity;
        /**
         * @member {number} upperThresholdValue The voxels with values over this
         * threshold won't appear in the slices.
         * If changed, geometryNeedsUpdate is automatically set to true on all
         * the slices associated to this volume
         */
        this.upperThresholdValue = Infinity;
        if (arguments.length > 0) {
            /**
             * @member {number} xLength Width of the volume in the IJK coordinate system
             */
            this.xLength = Number(xLength) || 1;
            /**
             * @member {number} yLength Height of the volume in the IJK coordinate system
             */
            this.yLength = Number(yLength) || 1;
            /**
             * @member {number} zLength Depth of the volume in the IJK coordinate system
           */
            this.zLength = Number(zLength) || 1;
            /**
             * @member {TypedArray} data Data of the volume
             */
            switch (type) {
                case 'Uint8':
                case 'uint8':
                case 'uchar':
                case 'unsigned char':
                case 'uint8_t':
                    this.data = new Uint8Array(arrayBuffer);
                    break;
                case 'Int8':
                case 'int8':
                case 'signed char':
                case 'int8_t':
                    this.data = new Int8Array(arrayBuffer);
                    break;
                case 'Int16':
                case 'int16':
                case 'short':
                case 'short int':
                case 'signed short':
                case 'signed short int':
                case 'int16_t':
                    this.data = new Int16Array(arrayBuffer);
                    break;
                case 'Uint16':
                case 'uint16':
                case 'ushort':
                case 'unsigned short':
                case 'unsigned short int':
                case 'uint16_t':
                    this.data = new Uint16Array(arrayBuffer);
                    break;
                case 'Int32':
                case 'int32':
                case 'int':
                case 'signed int':
                case 'int32_t':
                    this.data = new Int32Array(arrayBuffer);
                    break;
                case 'Uint32':
                case 'uint32':
                case 'uint':
                case 'unsigned int':
                case 'uint32_t':
                    this.data = new Uint32Array(arrayBuffer);
                    break;
                case 'longlong':
                case 'long long':
                case 'long long int':
                case 'signed long long':
                case 'signed long long int':
                case 'int64':
                case 'int64_t':
                case 'ulonglong':
                case 'unsigned long long':
                case 'unsigned long long int':
                case 'uint64':
                case 'uint64_t':
                    throw new Error('uint64_t type is not supported in JavaScript');
                case 'Float32':
                case 'float32':
                case 'float':
                    this.data = new Float32Array(arrayBuffer);
                    break;
                case 'Float64':
                case 'float64':
                case 'double':
                    this.data = new Float64Array(arrayBuffer);
                    break;
                default:
                    this.data = new Uint8Array(arrayBuffer);
            }
            if (this.data.length !== this.xLength * this.yLength * this.zLength) {
                throw new Error('lengths are not matching arrayBuffer size');
            }
        }
    }
    get lowerThreshold() {
        return this.lowerThresholdValue;
    }
    set lowerThreshold(value) {
        this.lowerThresholdValue = value;
        this.sliceList.forEach((slice) => {
            // eslint-disable-next-line no-param-reassign
            slice.geometryNeedsUpdate = true;
        });
    }
    get upperThreshold() {
        return this.upperThresholdValue;
    }
    set upperThreshold(value) {
        this.upperThresholdValue = value;
        this.sliceList.forEach((slice) => {
            // eslint-disable-next-line no-param-reassign
            slice.geometryNeedsUpdate = true;
        });
    }
    /**
     * Shortcut for data[access(i,j,k)]
     * @param {number} i    First coordinate
     * @param {number} j    Second coordinate
     * @param {number} k    Third coordinate
     * @returns {number}  value in the data array
     */
    getData(i, j, k) {
        return this.data[k * this.xLength * this.yLength + j * this.xLength + i];
    }
    /**
     * Compute the index in the data
     * array corresponding to the given coordinates in IJK system
     * @param {number} i    First coordinate
     * @param {number} j    Second coordinate
     * @param {number} k    Third coordinate
     * @returns {number}  index
     */
    access(i, j, k) {
        return k * this.xLength * this.yLength + j * this.xLength + i;
    }
    /**
     * Retrieve the IJK coordinates of the voxel
     * corresponding of the given index in the data
     * @param {number} index index of the voxel
     * @returns {Array}  [x,y,z]
     */
    reverseAccess(index) {
        const z = Math.floor(index / (this.yLength * this.xLength));
        const y = Math.floor((index - z * this.yLength * this.xLength) / this.xLength);
        const x = index - z * this.yLength * this.xLength - y * this.xLength;
        return [x, y, z];
    }
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
    map(functionToMap, contextParam) {
        const { length } = this.data;
        const context = contextParam || this;
        for (let i = 0; i < length; i++) {
            this.data[i] = functionToMap.call(context, this.data[i], i, this.data);
        }
        return this;
    }
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
    extractPerpendicularPlane(axis, RASIndex) {
        const planeMatrix = (new Matrix4()).identity();
        const volume = this;
        let firstSpacing;
        let secondSpacing;
        let positionOffset;
        let IJKIndex;
        const axisInIJK = new Vector3();
        const firstDirection = new Vector3();
        const secondDirection = new Vector3();
        const dimensions = new Vector3(this.xLength, this.yLength, this.zLength);
        switch (axis) {
            case 'x':
                axisInIJK.set(1, 0, 0);
                firstDirection.set(0, 0, -1);
                secondDirection.set(0, -1, 0);
                // eslint-disable-next-line prefer-destructuring
                firstSpacing = this.spacing[2];
                // eslint-disable-next-line prefer-destructuring
                secondSpacing = this.spacing[1];
                IJKIndex = new Vector3(RASIndex, 0, 0);
                planeMatrix.multiply((new Matrix4()).makeRotationY(Math.PI / 2));
                positionOffset = (volume.RASDimensions[0] - 1) / 2;
                planeMatrix.setPosition(new Vector3(RASIndex - positionOffset, 0, 0));
                break;
            case 'y':
                axisInIJK.set(0, 1, 0);
                firstDirection.set(1, 0, 0);
                secondDirection.set(0, 0, 1);
                // eslint-disable-next-line prefer-destructuring
                firstSpacing = this.spacing[0];
                // eslint-disable-next-line prefer-destructuring
                secondSpacing = this.spacing[2];
                IJKIndex = new Vector3(0, RASIndex, 0);
                planeMatrix.multiply((new Matrix4()).makeRotationX(-Math.PI / 2));
                positionOffset = (volume.RASDimensions[1] - 1) / 2;
                planeMatrix.setPosition(new Vector3(0, RASIndex - positionOffset, 0));
                break;
            case 'z':
            default:
                axisInIJK.set(0, 0, 1);
                firstDirection.set(1, 0, 0);
                secondDirection.set(0, -1, 0);
                // eslint-disable-next-line prefer-destructuring
                firstSpacing = this.spacing[0];
                // eslint-disable-next-line prefer-destructuring
                secondSpacing = this.spacing[1];
                IJKIndex = new Vector3(0, 0, RASIndex);
                positionOffset = (volume.RASDimensions[2] - 1) / 2;
                planeMatrix.setPosition(new Vector3(0, 0, RASIndex - positionOffset));
                break;
        }
        firstDirection.applyMatrix4(volume.inverseMatrix).normalize();
        firstDirection.argVar = 'i';
        secondDirection.applyMatrix4(volume.inverseMatrix).normalize();
        secondDirection.argVar = 'j';
        axisInIJK.applyMatrix4(volume.inverseMatrix).normalize();
        const iLength = Math.floor(Math.abs(firstDirection.dot(dimensions)));
        const jLength = Math.floor(Math.abs(secondDirection.dot(dimensions)));
        const planeWidth = Math.abs(iLength * firstSpacing);
        const planeHeight = Math.abs(jLength * secondSpacing);
        IJKIndex = Math.abs(Math.round(IJKIndex.applyMatrix4(volume.inverseMatrix).dot(axisInIJK)));
        const base = [new Vector3(1, 0, 0), new Vector3(0, 1, 0), new Vector3(0, 0, 1)];
        const iDirection = [firstDirection, secondDirection, axisInIJK]
            .find(x => Math.abs(x.dot(base[0])) > 0.9);
        const jDirection = [firstDirection, secondDirection, axisInIJK]
            .find(x => Math.abs(x.dot(base[1])) > 0.9);
        const kDirection = [firstDirection, secondDirection, axisInIJK]
            .find(x => Math.abs(x.dot(base[2])) > 0.9);
        // Reference: https://github.com/pmndrs/three-stdlib/blob/0a5de570f8f0f61ea2603b6fc99d73c7b59070a7/src/misc/Volume.js#L322
        function sliceAccess(i, j) {
            // eslint-disable-next-line no-nested-ternary
            const si = iDirection === axisInIJK
                ? IJKIndex : iDirection.arglet === 'i' ? i : j;
            // eslint-disable-next-line no-nested-ternary
            const sj = jDirection === axisInIJK
                ? IJKIndex : jDirection.arglet === 'i' ? i : j;
            // eslint-disable-next-line no-nested-ternary
            const sk = kDirection === axisInIJK
                ? IJKIndex : kDirection.arglet === 'i' ? i : j;
            // invert indices if necessary
            const accessI = iDirection.dot(base[0]) > 0
                ? si : volume.xLength - 1 - si;
            const accessJ = jDirection.dot(base[1]) > 0
                ? sj : volume.yLength - 1 - sj;
            const accessK = kDirection.dot(base[2]) > 0
                ? sk : volume.zLength - 1 - sk;
            return volume.access(accessI, accessJ, accessK);
        }
        return {
            iLength,
            jLength,
            sliceAccess,
            matrix: planeMatrix,
            planeWidth,
            planeHeight,
        };
    }
    /**
     * Compute the minimum
     * and the maximum of the data in the volume
     * @returns {Array} [min,max]
     */
    computeMinMax() {
        let min = Infinity;
        let max = -Infinity;
        // buffer the length
        const datasize = this.data.length;
        let i = 0;
        for (i = 0; i < datasize; i++) {
            if (!Number.isNaN(this.data[i])) {
                const value = this.data[i];
                min = Math.min(min, value);
                max = Math.max(max, value);
            }
        }
        this.min = min;
        this.max = max;
        return [min, max];
    }
}
