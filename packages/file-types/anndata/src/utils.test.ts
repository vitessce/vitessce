import * as zarr from "zarrita";
import { FetchStore } from "@zarrita/storage";
import { describe, expect, it } from "vitest";
import { LazyCategoricalArray, get } from "./utils";

describe("String Arrays", () => {
  it("custom vlenutf8 codec provides correct results", async () => {
    async function test() {
      const store = new FetchStore(
        "https://s3.amazonaws.com/vitessce-data/0.0.33/main/habib-2017/habib_2017_nature_methods.h5ad.zarr"
      );
      const grp = await zarr.open(store, { kind: "group" });
      const arr = await zarr.open(grp.resolve("/var/index"), { kind: "array" })
      const stringID = await zarr.get(arr, [0]);
      return stringID;
    }

    await expect(test()).resolves.toEqual("APLP1");
  });
});

describe("Categorical Array Arrays", () => {
  it("custom vlenutf8 codec provides correct results", async () => {
    async function test() {
      const store = new FetchStore(
        "https://s3.amazonaws.com/vitessce-data/0.0.33/main/habib-2017/habib_2017_nature_methods.h5ad.zarr"
      );
      const grp = await zarr.open(store, { kind: "group" });
      const categories = await zarr.open(grp.resolve("/obs/__categories/CellType"), { kind: "array" })
      const codes = await zarr.open(grp.resolve("/obs/CellType"), { kind: "array" })
      const arr = new LazyCategoricalArray(codes, categories);
      const first = await get(arr);
      return first.data[0];
    }

    await expect(test()).resolves.toEqual("exCA1");
  });
});
