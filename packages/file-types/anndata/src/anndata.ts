// eslint-disable-next-line import/no-unresolved
import * as zarr from "zarrita";
import AxisArrays from "./axis_arrays";
import { FetchStore, Readable } from "@zarrita/storage";
import SparseArray from './sparse_array';
import { AxisKey, AxisKeys } from "./types";
import { readSparse } from "./utils";
interface AxisKeyTypes<S extends Readable, D extends zarr.NumberDataType> {
  obs: AxisArrays<S>, var: AxisArrays<S>, obsm: AxisArrays<S>, varm: AxisArrays<S>, X: SparseArray<D> | zarr.Array<D>, layers: AxisArrays<S>, obsp: AxisArrays<S>, varp: AxisArrays<S>
}

class AnnData<S extends Readable, D extends zarr.NumberDataType> {
  public obs: AxisArrays<S>;
  public var: AxisArrays<S>;
  public obsm: AxisArrays<S>;
  public obsp: AxisArrays<S>;
  public varm: AxisArrays<S>;
  public varp: AxisArrays<S>;
  public X: SparseArray<D> | zarr.Array<D>;
  public layers: AxisArrays<S>

  constructor(data: AxisKeyTypes<S, D>) {
    this.obs = data['obs'];
    this.var = data['var'];
    this.obsm = data['obsm'];
    this.obsp = data['obsm'];
    this.varm = data['varm'];
    this.varp = data['varm'];
    this.X = data['X'];
    this.layers = data['layers'];
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


  const adataInit = {} as AxisKeyTypes<Readable, zarr.NumberDataType>;
  await Promise.all(AxisKeys.map(async (k) => {
    if (k == "X") {
      const x_elem = await zarr.open(root.resolve("X"));
      if (x_elem instanceof zarr.Group) {
        adataInit[k] = await readSparse(x_elem)
      } else {
        adataInit[k] = x_elem as zarr.Array<zarr.NumberDataType>
      }
    } else {
      adataInit[k] = new AxisArrays<Readable>(root, k);
    }
  }))
  return new AnnData(adataInit);
}
