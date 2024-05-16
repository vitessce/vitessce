import { FetchError } from "node-fetch";
import * as zarr from "zarrita";
import { LazyCategoricalArray } from "./utils";

import type { AxisKey } from "./types";
import { Readable } from "@zarrita/storage";

export default class AxisArrays<S extends Readable> {
  public root: zarr.Location<S>;

  public constructor(root: zarr.Group<S>, axisKey: AxisKey) {
    this.root = root.resolve(axisKey);
  }

  public async get<D extends zarr.DataType>(key: string) {
    // categories needed for backward compat
    const keyRoot = this.root.resolve(key);
    const keyNode = await zarr.open(keyRoot);
    const { categories, "encoding-type": encodingType } =
      (await keyNode.attrs) as any;
    if (categories != undefined) {
      const cats = await zarr.open(this.root.resolve(categories), { kind: "array" });
      return new LazyCategoricalArray((keyNode as zarr.Array<D, S>), cats);
    }
    if (encodingType === "categorical") {
      const cats = await zarr.open(keyRoot.resolve('categories'), { kind: "array" });
      const codes = await zarr.open(keyRoot.resolve('codes'), { kind: "array" });
      return new LazyCategoricalArray(codes, cats);
    }
    return (keyNode as zarr.Array<D, S>);
  }
}
