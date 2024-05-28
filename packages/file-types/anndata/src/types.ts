import { Readable } from '@zarrita/storage';
import * as zarr from 'zarrita';
import SparseArray from './sparse_array';
import { LazyCategoricalArray } from './utils';

export const AxisKeys = ["obs", "var", "obsm", "varm", "X", "layers", "obsp", "varp"] as const;
export type AxisKey = (typeof AxisKeys)[number]
export type Slice = ReturnType<typeof zarr.slice>
export type AxisSelection = (number | Slice | null)
export type FullSelection = AxisSelection[]
export type UIntType = zarr.Uint8 | zarr.Uint16 | zarr.Uint32
export type ArrayType = Exclude<zarr.DataType, zarr.ObjectType>
export type BackedArray = zarr.Array<zarr.DataType, Readable> | SparseArray<zarr.NumberDataType> | LazyCategoricalArray<UIntType, zarr.DataType, Readable>