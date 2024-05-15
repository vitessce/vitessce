// eslint-disable-next-line import/no-unresolved
import * as zarr from "zarrita";
import AxisArrays from "./axis_arrays";
import { has } from "./utils";
import { AxisKeys, AxisKey } from "./types";
import { Listable } from "@zarrita/core";
import { FetchStore, Readable } from "@zarrita/storage";

type AnnDataInit<S extends Readable> = Record<
  AxisKey,
  AxisArrays<S>
>;

class AnnData<S extends Readable> {
  public obs: AxisArrays<S>;
  public var: AxisArrays<S>;
  public obsm: AxisArrays<S>;
  public varm: AxisArrays<S>;
  constructor(data: AnnDataInit<S>) {
    this.obs = data['obs'];
    this.var = data['var'];
    this.obsm = data['obsm'];
    this.varm = data['varm'];
  }

  private async names(grp: zarr.Group<S>) {
    return zarr.open(grp.resolve(String(grp.attrs["_index"] || "_index")), { kind: "array" });
  }

  public async obsNames() {
    const grp = await zarr.open(this.obs.root, { kind: "group" });
    return this.names(grp)
  }

  public async varNames() {
    const grp = await zarr.open(this.var.root, { kind: "group" });
    return this.names(grp)
  }
}

export async function readZarr(path: string | Readable) {
  let root: zarr.Group<Readable>;
  if (typeof path == "string") {
    const store = await zarr.tryWithConsolidated(new FetchStore(path));
    root = await zarr.open(store, { kind: "group" });
  } else {
    root = await zarr.open(path, { kind: "group" });
  }


  const adataInit = {} as AnnDataInit<Readable>;
  AxisKeys.map((k) => {
    adataInit[k] = new AxisArrays<Readable>(root, k);
  })
  return new AnnData(adataInit);
}
