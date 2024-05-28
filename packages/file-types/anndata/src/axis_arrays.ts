import * as zarr from "zarrita";
import { LazyCategoricalArray, readSparse } from "./utils";

import type { AxisKey, IntType } from "./types";
import { Readable } from "@zarrita/storage";
import SparseArray from "./sparse_array";

export default class AxisArrays<S extends Readable> {
  public root: zarr.Location<S>;

  public constructor(root: zarr.Group<S>, axisKey: AxisKey) {
    this.root = root.resolve(axisKey);
  }

  public async get(key: string): Promise<zarr.Array<zarr.DataType, Readable> | SparseArray<zarr.NumberDataType> | LazyCategoricalArray<IntType, zarr.DataType, Readable>> {
    // categories needed for backward compat
    const keyRoot = this.root.resolve(key);
    const keyNode = await zarr.open(keyRoot);
    const { categories, "encoding-type": encodingType } =
      (await keyNode.attrs) as any;
    if (categories != undefined) {
      const cats = await zarr.open(this.root.resolve(categories), { kind: "array" });
      return new LazyCategoricalArray((keyNode as zarr.Array<IntType, S>), cats);
    }
    if (encodingType === "categorical") {
      const cats = await zarr.open(keyRoot.resolve('categories'), { kind: "array" });
      const codes = await zarr.open(keyRoot.resolve('codes'), { kind: "array" }) as zarr.Array<IntType, Readable>;
      return new LazyCategoricalArray(codes, cats);
    }
    if (["csc_format", "csr_format"].includes(encodingType)) {
      return readSparse(keyNode as zarr.Group<Readable>)
    }
    return (keyNode as zarr.Array<zarr.DataType, S>);
  }
}
