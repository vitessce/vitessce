import * as zarr from "zarrita";
import { Readable } from "@zarrita/storage";
import SparseArray from "./sparse_array";
import { AxisSelection, FullSelection } from "./types";

// TODO: K should only be a uint probably but this makes working with things a bitmore challenging?
export class LazyCategoricalArray<K extends zarr.DataType, D extends zarr.DataType, S extends Readable> {
  public codes: zarr.Array<K, S>;

  public categories: zarr.Array<D, S>;

  constructor(
    codes: zarr.Array<K, S>,
    categories: zarr.Array<D, S>
  ) {
    this.codes = codes;
    this.categories = categories;
  }
}

function isLazyCategoricalArray<K extends zarr.DataType, D extends zarr.DataType, S extends Readable>(
  arr: LazyCategoricalArray<K, D, S> | any
): arr is LazyCategoricalArray<K, D, S> {
  return (arr as LazyCategoricalArray<K, D, S>).categories !== undefined;
}

function isSparseArray<K extends zarr.NumberDataType>(
  arr: SparseArray<K> | any
): arr is SparseArray<K> {
  return (arr as SparseArray<K>).indptr !== undefined;
}

export async function get<K extends zarr.NumberDataType, D extends zarr.DataType, S extends Readable>(
  arr: LazyCategoricalArray<K, D, S> | zarr.Array<D, S> | SparseArray<K>, sel: AxisSelection | FullSelection = null
): Promise<zarr.Chunk<D | K>> {
  if (isLazyCategoricalArray(arr)) {
    const codes = await zarr.get(arr.codes, null);
    const categories = await zarr.get(arr.categories, null); //
    const data = new Array(codes.data.length); // TODO(ilan-gold): better string array choice, how to construct from categories?
    Array.from(codes.data).forEach((val: number | bigint, ind: number) => {
      const cat = Number(val)
      data[ind] = (categories.data as any)[cat]; // TODO: what is up with this??
    });
    return { ...codes, data: (data as typeof categories.data) };
  }
  if (isSparseArray(arr)) {
    if (!(sel instanceof Array)) {
      return arr.get([sel, null])
    } else if (sel.length == 1) {
      return arr.get([sel[0], null])
    }
    return arr.get(sel)
  }
  return zarr.get(arr, null);
}



export async function has<S extends Readable>(root: zarr.Group<S>, path: string) {
  try {
    await zarr.open(root.resolve(path));
  } catch (error) {
    if (error instanceof zarr.NodeNotFoundError) {
      return false;
    }
    return true;
  }
}

export async function readSparse<S extends Readable, D extends zarr.NumberDataType>(elem: zarr.Group<S>): Promise<SparseArray<D>> {
  const grp = await zarr.open(elem, { kind: "group" });
  const shape = grp.attrs['shape'] as number[];
  const format = (grp.attrs['encoding-type'] as string).slice(0, 3) as "csc" | "csr";
  const indptr = await zarr.open(grp.resolve("indptr"), { kind: "array" }) as zarr.Array<"int32", S> // todo: allow 64
  const indices = await zarr.open(grp.resolve("indices"), { kind: "array" }) as zarr.Array<"int32", S> // todo: allow 64
  const data = await zarr.open(grp.resolve("data"), { kind: "array" }) as zarr.Array<D, S>
  return new SparseArray(indices, indptr, data, shape, format)
}