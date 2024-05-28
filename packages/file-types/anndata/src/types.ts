import * as zarr from 'zarrita';

export const AxisKeys = ["obs", "var", "obsm", "varm", "X", "layers", "obsp", "varp"] as const;
export type AxisKey = (typeof AxisKeys)[number]
export type Slice = ReturnType<typeof zarr.slice>
export type AxisSelection = (number | Slice | null)
export type FullSelection = AxisSelection[]
export type IntType = zarr.Int8 | zarr.Int16 | zarr.Int32
export type ArrayType = Exclude<zarr.DataType, zarr.ObjectType>