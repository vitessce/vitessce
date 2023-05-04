import { FetchError } from "node-fetch";
import FetchStore from "zarrita/storage/fetch";
import { Group, get_group } from "zarrita/v2";
import * as zarr from "zarrita/v2";
import { LazyCategoricalArray, get } from "./utils";

import type { AxisKey } from "./types";

export default class AxisArrays<CustomRemoteStore extends FetchStore> {
  private groupPromise: Promise<Group<CustomRemoteStore>>;

  public constructor(rootStore: CustomRemoteStore, axisKey: AxisKey) {
    this.groupPromise = get_group(rootStore, `/${axisKey}`, "r");
  }

  public async get(key: string) {
    // categories needed for backward compat
    const grp = await this.groupPromise;
    const keyNode = await zarr.get(grp, key);
    const { categories, "encoding-type": encodingType } =
      (await keyNode.attrs()) as any;
    if (categories) {
      const cats = await zarr.get(grp, categories);
      const codes = keyNode;
      return new LazyCategoricalArray(codes, cats);
    }
    if (encodingType === "categorical") {
      const cats = await zarr.get(grp, `${key}/categories`);
      const codes = await zarr.get(grp, `${key}/codes`);
      return new LazyCategoricalArray(codes, cats);
    }
    return zarr.get(grp, `${key}`);
  }
}
