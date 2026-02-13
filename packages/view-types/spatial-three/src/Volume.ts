/**
 * This class had been written to handle the output of the NRRD loader.
 * It contains a volume of data and informations about it.
 * For now it only handles 3 dimensional data.
 * See the webgl_loader_nrrd.html example and the loaderNRRD.js
 * file to see how to use this class.
 * @author Valentin Demeusy / https://github.com/stity
 */

import {
  Matrix3,
  Matrix4,
  Vector3,
} from 'three';
import type { TypedArray } from './types.js';

interface DirectionVector extends Vector3 {
  argVar?: string;
}

export class Volume {
  spacing: [number, number, number] = [1, 1, 1];

  offset: [number, number, number] = [0, 0, 0];

  matrix: Matrix3 = new Matrix3().identity();

  sliceList: Array<{ geometryNeedsUpdate: boolean }> = [];

  lowerThresholdValue = -Infinity;

  upperThresholdValue = Infinity;

  xLength = 1;

  yLength = 1;

  zLength = 1;

  data!: TypedArray;

  RASDimensions?: number[];

  inverseMatrix?: Matrix4;

  min?: number;

  max?: number;

  constructor(
    xLength?: number,
    yLength?: number,
    zLength?: number,
    type?: string,
    arrayBuffer?: ArrayBuffer,
  ) {
    if (xLength !== undefined) {
      this.xLength = Number(xLength) || 1;
      this.yLength = Number(yLength) || 1;
      this.zLength = Number(zLength) || 1;

      switch (type) {
        case 'Uint8':
        case 'uint8':
        case 'uchar':
        case 'unsigned char':
        case 'uint8_t':
          this.data = new Uint8Array(arrayBuffer!);
          break;
        case 'Int8':
        case 'int8':
        case 'signed char':
        case 'int8_t':
          this.data = new Int8Array(arrayBuffer!);
          break;
        case 'Int16':
        case 'int16':
        case 'short':
        case 'short int':
        case 'signed short':
        case 'signed short int':
        case 'int16_t':
          this.data = new Int16Array(arrayBuffer!);
          break;
        case 'Uint16':
        case 'uint16':
        case 'ushort':
        case 'unsigned short':
        case 'unsigned short int':
        case 'uint16_t':
          this.data = new Uint16Array(arrayBuffer!);
          break;
        case 'Int32':
        case 'int32':
        case 'int':
        case 'signed int':
        case 'int32_t':
          this.data = new Int32Array(arrayBuffer!);
          break;
        case 'Uint32':
        case 'uint32':
        case 'uint':
        case 'unsigned int':
        case 'uint32_t':
          this.data = new Uint32Array(arrayBuffer!);
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
          this.data = new Float32Array(arrayBuffer!);
          break;
        case 'Float64':
        case 'float64':
        case 'double':
          this.data = new Float64Array(arrayBuffer!);
          break;
        default:
          this.data = new Uint8Array(arrayBuffer!);
      }

      if (this.data.length !== this.xLength * this.yLength * this.zLength) {
        throw new Error('lengths are not matching arrayBuffer size');
      }
    }
  }

  get lowerThreshold() {
    return this.lowerThresholdValue;
  }

  set lowerThreshold(value: number) {
    this.lowerThresholdValue = value;
    this.sliceList.forEach((slice) => {
      // eslint-disable-next-line no-param-reassign
      slice.geometryNeedsUpdate = true;
    });
  }

  get upperThreshold() {
    return this.upperThresholdValue;
  }

  set upperThreshold(value: number) {
    this.upperThresholdValue = value;
    this.sliceList.forEach((slice) => {
      // eslint-disable-next-line no-param-reassign
      slice.geometryNeedsUpdate = true;
    });
  }

  getData(i: number, j: number, k: number): number {
    return this.data[k * this.xLength * this.yLength + j * this.xLength + i];
  }

  access(i: number, j: number, k: number): number {
    return k * this.xLength * this.yLength + j * this.xLength + i;
  }

  reverseAccess(index: number): [number, number, number] {
    const z = Math.floor(index / (this.yLength * this.xLength));
    const y = Math.floor(
      (index - z * this.yLength * this.xLength
      ) / this.xLength,
    );
    const x = index - z * this.yLength * this.xLength - y * this.xLength;
    return [x, y, z];
  }

  // eslint-disable-next-line max-len
  map(functionToMap: (value: number, index: number, data: TypedArray) => number, contextParam?: any): this {
    const { length } = this.data;
    const context = contextParam || this;

    for (let i = 0; i < length; i++) {
      this.data[i] = functionToMap.call(context, this.data[i], i, this.data);
    }
    return this;
  }

  extractPerpendicularPlane(axis: string, RASIndex: number) {
    const planeMatrix = (new Matrix4()).identity();
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const volume = this;
    let firstSpacing: number;
    let secondSpacing: number;
    let positionOffset: number;
    let IJKIndex: Vector3 | number;

    const axisInIJK: DirectionVector = new Vector3();
    const firstDirection: DirectionVector = new Vector3();
    const secondDirection: DirectionVector = new Vector3();

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
        positionOffset = (volume.RASDimensions![0] - 1) / 2;
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
        positionOffset = (volume.RASDimensions![1] - 1) / 2;
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

        positionOffset = (volume.RASDimensions![2] - 1) / 2;
        planeMatrix.setPosition(new Vector3(0, 0, RASIndex - positionOffset));
        break;
    }

    firstDirection.applyMatrix4(volume.inverseMatrix!).normalize();
    firstDirection.argVar = 'i';
    secondDirection.applyMatrix4(volume.inverseMatrix!).normalize();
    secondDirection.argVar = 'j';
    axisInIJK.applyMatrix4(volume.inverseMatrix!).normalize();
    const iLength = Math.floor(Math.abs(firstDirection.dot(dimensions)));
    const jLength = Math.floor(Math.abs(secondDirection.dot(dimensions)));
    const planeWidth = Math.abs(iLength * firstSpacing);
    const planeHeight = Math.abs(jLength * secondSpacing);

    IJKIndex = Math.abs(
      Math.round((IJKIndex as Vector3).applyMatrix4(volume.inverseMatrix!).dot(axisInIJK)),
    );
    const base = [new Vector3(1, 0, 0), new Vector3(0, 1, 0), new Vector3(0, 0, 1)];
    const iDirection = ([firstDirection, secondDirection, axisInIJK] as DirectionVector[])
      .find(x => Math.abs(x.dot(base[0])) > 0.9)!;
    const jDirection = ([firstDirection, secondDirection, axisInIJK] as DirectionVector[])
      .find(x => Math.abs(x.dot(base[1])) > 0.9)!;
    const kDirection = ([firstDirection, secondDirection, axisInIJK] as DirectionVector[])
      .find(x => Math.abs(x.dot(base[2])) > 0.9)!;

    // Reference: https://github.com/pmndrs/three-stdlib/blob/0a5de570f8f0f61ea2603b6fc99d73c7b59070a7/src/misc/Volume.js#L322
    function sliceAccess(i: number, j: number) {
      // eslint-disable-next-line no-nested-ternary
      const si = iDirection === axisInIJK
        ? IJKIndex as number : iDirection.argVar === 'i' ? i : j;
      // eslint-disable-next-line no-nested-ternary
      const sj = jDirection === axisInIJK
        ? IJKIndex as number : jDirection.argVar === 'i' ? i : j;
      // eslint-disable-next-line no-nested-ternary
      const sk = kDirection === axisInIJK
        ? IJKIndex as number : kDirection.argVar === 'i' ? i : j;

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

  computeMinMax(): [number, number] {
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
