import * as zarr from "zarrita/v2";
import { describe, expect, it } from "vitest";
import { StringOverrideFetchStore } from "./utils";

describe("StringOverrideFetchStore", () => {
  it("overrides .zarray when vlenutf8", async () => {
    const store = new StringOverrideFetchStore(
      "https://s3.amazonaws.com/vitessce-data/0.0.33/main/habib-2017/habib_2017_nature_methods.h5ad.zarr/var/index"
    );
    const zarray = JSON.parse(
      new TextDecoder().decode(await store.get("/.zarray"))
    );
    expect(zarray?.dtype).toEqual("<U8");
  });
  it("does not override .zarray when not vlenutf8", async () => {
    const store = new StringOverrideFetchStore(
      "https://s3.amazonaws.com/vitessce-data/0.0.33/main/habib-2017/habib_2017_nature_methods.h5ad.zarr/X"
    );
    const zarray = JSON.parse(
      new TextDecoder().decode(await store.get("/.zarray"))
    );
    expect(zarray?.dtype).toEqual("<f8");
  });
});

describe("String Arrays", () => {
  it("custom vlenutf8 codecc provides correct results", async () => {
    async function test() {
      const store = new StringOverrideFetchStore(
        "https://s3.amazonaws.com/vitessce-data/0.0.33/main/habib-2017/habib_2017_nature_methods.h5ad.zarr"
      );
      const arr = await zarr.get_array(store, "/var/index");
      const stringIDs = (await arr.get_chunk([0])).data;
      return stringIDs.get(0);
    }

    await expect(test()).resolves.toEqual("APLP1");
  });
});
