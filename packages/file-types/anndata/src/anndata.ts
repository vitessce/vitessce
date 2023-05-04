// eslint-disable-next-line import/no-unresolved
import FetchStore from "zarrita/storage/fetch";
import AxisArrays from "./axis_arrays";
import { StringOverrideFetchStore } from "./utils";
import { AxisKeys, AxisKey } from "./types";

type AnnDataInit<RemoteStore extends FetchStore> = Record<
  AxisKey,
  AxisArrays<RemoteStore>
>;

class AnnData<RemoteStore extends FetchStore> {
  private data: AnnDataInit<RemoteStore>;
  public obs?: AxisArrays<RemoteStore>;
  public var?: AxisArrays<RemoteStore>;
  public obsm?: AxisArrays<RemoteStore>;
  public varm?: AxisArrays<RemoteStore>;
  constructor(data: AnnDataInit<RemoteStore>) {
    this.data = data;
  }
}

export async function readZarr(path: string) {
  const store = new StringOverrideFetchStore(path);
  const adataInit = {} as AnnDataInit<StringOverrideFetchStore>;
  await Promise.all(
    AxisKeys.map(async (k) => {
      if (await store.has(`/${k}`)) {
        adataInit[k] = new AxisArrays(store, k);
      }
    })
  );
  return new Proxy(new AnnData(adataInit), {
    get(target, prop) {
      if (this.data[prop]) {
        return this.data[prop];
      }
      return target[prop];
    },
  });
}
