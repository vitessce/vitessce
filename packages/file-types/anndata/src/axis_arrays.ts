import * as zarr from "zarrita";
import { LazyCategoricalArray, readSparse } from "./utils";

import type { AxisKey, BackedArray, IntType } from "./types";
import { Readable } from "@zarrita/storage";
import SparseArray from "./sparse_array";

export default class AxisArrays<S extends Readable> {
  public root: zarr.Location<S>;
  private cache: Map<string, BackedArray>

  public constructor(root: zarr.Group<S>, axisKey: AxisKey) {
    this.root = root.resolve(axisKey);
    this.cache = new Map();
  }

  public async get(key: string): Promise<BackedArray> {
    if (!this.cache.has(key)) {
      // categories needed for backward compat
      const keyRoot = this.root.resolve(key);
      const keyNode = await zarr.open(keyRoot);
      const { categories, "encoding-type": encodingType } =
        (await keyNode.attrs) as any;
      if (categories != undefined) {
        const cats = await zarr.open(this.root.resolve(categories), { kind: "array" });
        this.cache.set(key, new LazyCategoricalArray((keyNode as zarr.Array<IntType, S>), cats))
      }
      else if (encodingType === "categorical") {
        const cats = await zarr.open(keyRoot.resolve('categories'), { kind: "array" });
        const codes = await zarr.open(keyRoot.resolve('codes'), { kind: "array" }) as zarr.Array<IntType, Readable>;
        this.cache.set(key, new LazyCategoricalArray(codes, cats))
      }
      else if (["csc_format", "csr_format"].includes(encodingType)) {
        this.cache.set(key, await readSparse(keyNode as zarr.Group<Readable>))
      } else {
        this.cache.set(key, (keyNode as zarr.Array<zarr.DataType, S>));
      }
    }
    const val = this.cache.get(key)
    if (val === undefined) {
      throw new Error("See https://github.com/microsoft/TypeScript/issues/13086 for why this will never happen")
    }
    return val
  }
}
