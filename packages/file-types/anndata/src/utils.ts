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
  array: LazyCategoricalArray<K, D, S> | any
): array is LazyCategoricalArray<K, D, S> {
  return (array as LazyCategoricalArray<K, D, S>).categories !== undefined;
}

function isSparseArray<K extends zarr.NumberDataType>(
  array: SparseArray<K> | any
): array is SparseArray<K> {
  return (array as SparseArray<K>).indptr !== undefined;
}

export async function get<K extends zarr.NumberDataType, D extends zarr.DataType, S extends Readable>(
  array: LazyCategoricalArray<K, D, S> | zarr.Array<D, S> | SparseArray<K>, selection: AxisSelection | FullSelection = null
): Promise<zarr.Chunk<D | K>> {
  if (isLazyCategoricalArray(array)) {
    const codes = await zarr.get(array.codes, null);
    const categories = await zarr.get(array.categories, null); //
    const data = new Array(codes.data.length); // TODO(ilan-gold): better string array choice, how to construct from categories?
    Array.from(codes.data).forEach((val: number | bigint, ind: number) => {
      const category = Number(val)
      data[ind] = (categories.data as any)[category]; // TODO: what is up with this??
    });
    return { ...codes, data: (data as typeof categories.data) };
  }
  if (isSparseArray(array)) {
    if (!(selection instanceof Array)) {
      return array.get([selection, null])
    } else if (selection.length == 1) {
      return array.get([selection[0], null])
    }
    return array.get(selection)
  }
  return zarr.get(array, null);
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