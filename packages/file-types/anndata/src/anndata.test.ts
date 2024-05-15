// import { HTTPStore, NestedArray } from "zarr";
import { readZarr } from "./anndata";
import { describe, expect, it } from "vitest";
import { get } from "./utils";
import * as zarr from "zarrita";
import { createStoreFromMapContents } from '@vitessce/zarr-utils';

import anndata_0_7_DenseFixture from "../../zarr/src/json-fixtures/anndata-0.7/anndata-dense.json";

// describe("anndata", () => {
describe("AnnData v0.7", () => {
  it("adata obs column", async () => {
    const store = createStoreFromMapContents(anndata_0_7_DenseFixture);
    const adata = await readZarr(store);
    const ids = await adata.obs.get("leiden");
    expect(Array.from((await get(ids)))).toEqual(["1", "1", "2"]);
  });

  // it("adata var index", async () => {
  //   const store = new StringOverrideFetchStore(
  //     "http://localhost:51204/@fixtures/zarr/anndata-0.7/anndata-dense.zarr"
  //   );
  //   const adata = new AnnData(store);
  //   const ids = await adata.var.var_names;
  //   expect(ids).toEqual(
  //     new NestedArray([...new Array(15).keys()].map((k: number) => `gene_${k}`))
  //   );
  // });

  // it("adata obs index", async () => {
  //   const store = new HTTPStore(
  //     "http://localhost:51204/@fixtures/zarr/anndata-0.7/anndata-dense.zarr"
  //   );
  //   const adata = new AnnData(store);
  //   const names = await adata.obs.obs_names;
  //   expect(names).toEqual(new NestedArray(["CTG", "GCA", "CTG"]));
  // });

  // it("adata obsm", async () => {
  //   const store = new StringOverrideFetchStore(
  //     "http://localhost:51204/@fixtures/zarr/anndata-0.7/anndata-dense.zarr"
  //   );
  //   const adata = new AnnData(store);
  //   const data = await adata.obsm.get("X_umap");
  //   expect(get(data)).toEqual([]);
  // });
});

// describe("AnnData v0.8", () => {
//   it("adata obs column", async () => {
//     const store = new HTTPStore(
//       "http://localhost:51204/@fixtures/zarr/anndata-0.8/anndata-dense.zarr"
//     );
//     const adata = new AnnData(store);
//     const ids = await adata.obs["leiden"];
//     expect(ids).toEqual(new NestedArray(["1", "1", "2"]));
//   });

//   it("adata var index", async () => {
//     const store = new HTTPStore(
//       "http://localhost:51204/@fixtures/zarr/anndata-0.8/anndata-dense.zarr"
//     );
//     const adata = new AnnData(store);
//     const ids = await adata.var.var_names;
//     expect(ids).toEqual(
//       new NestedArray([...new Array(15).keys()].map((k: number) => `gene_${k}`))
//     );
//   });

//   it("adata obs index", async () => {
//     const store = new HTTPStore(
//       "http://localhost:51204/@fixtures/zarr/anndata-0.8/anndata-dense.zarr"
//     );
//     const adata = new AnnData(store);
//     const names = await adata.obs.obs_names;
//     expect(names).toEqual(new NestedArray(["CTG", "GCA", "CTG"]));
//   });

//   it("adata obsm", async () => {
//     const store = new HTTPStore(
//       "http://localhost:51204/@fixtures/zarr/anndata-0.7/anndata-dense.zarr"
//     );
//     const adata = new AnnData(store);
//     const data = await adata.obsm["X_umap"];
//     expect(data).toEqual(
//       new NestedArray(new Uint32Array([-1, -1, 0, 0, 1, 1]), [2, 3], "<i4")
//     );
//   });
// });
