import * as zarr from 'zarrita';

export const AxisKeys = ["obs", "var", "obsm", "varm", "X"] as const;
export type AxisKey = (typeof AxisKeys)[number]
export type Slice = ReturnType<typeof zarr.slice>
export type AxisSelection = (number | Slice | null)
export type FullSelection = AxisSelection[]