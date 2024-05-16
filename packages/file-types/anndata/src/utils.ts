import * as zarr from "zarrita";
import { Readable } from "@zarrita/storage";

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
  arr: LazyCategoricalArray<K, D, S> | zarr.Array<D, S>
): arr is LazyCategoricalArray<K, D, S> {
  return (arr as LazyCategoricalArray<K, D, S>).categories !== undefined;
}

export async function get<K extends zarr.DataType, D extends zarr.DataType, S extends Readable>(
  arr: LazyCategoricalArray<K, D, S> | zarr.Array<D, S>
): Promise<zarr.Chunk<D>> {
  if (isLazyCategoricalArray(arr)) {
    const codes = await zarr.get(arr.codes, null);
    const categories = await zarr.get(arr.categories, null); //
    const data = new Array(codes.data.length); // TODO(ilan-gold): better string array choice, how to construct from categories?
    Array.from(codes.data).forEach((val: number | bigint, ind: number) => { // Todo forEach
      const cat = Number(val)
      data[ind] = (categories.data as any)[cat]; // TODO: what is up with this??
    });
    return { ...codes, data: (data as typeof categories.data) };
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