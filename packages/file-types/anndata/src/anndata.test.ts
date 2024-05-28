// import { HTTPStore, NestedArray } from "zarr";
import { readZarr } from "./anndata";
import { describe, expect, it } from "vitest";
import { get } from "./utils";
import * as zarr from "zarrita";
import { createStoreFromMapContents } from '@vitessce/zarr-utils';

import anndata_0_7_DenseFixture from "../../zarr/src/json-fixtures/anndata-0.7/anndata-dense.json";
import anndata_0_8_DenseFixture from "../../zarr/src/json-fixtures/anndata-0.8/anndata-dense.json";
import anndata_0_9_DenseFixture from "../../zarr/src/json-fixtures/anndata-0.9/anndata-dense.json";
import anndata_0_10_DenseFixture from "../../zarr/src/json-fixtures/anndata-0.10/anndata-dense.json";

import anndata_0_7_CscFixture from "../../zarr/src/json-fixtures/anndata-0.7/anndata-csc.json";
import anndata_0_8_CscFixture from "../../zarr/src/json-fixtures/anndata-0.8/anndata-csc.json";
import anndata_0_9_CscFixture from "../../zarr/src/json-fixtures/anndata-0.9/anndata-csc.json";
import anndata_0_10_CscFixture from "../../zarr/src/json-fixtures/anndata-0.10/anndata-csc.json";
import anndata_0_7_CsrFixture from "../../zarr/src/json-fixtures/anndata-0.7/anndata-csr.json";
import anndata_0_8_CsrFixture from "../../zarr/src/json-fixtures/anndata-0.8/anndata-csr.adata.json";
import anndata_0_9_CsrFixture from "../../zarr/src/json-fixtures/anndata-0.9/anndata-csr.adata.json";
import anndata_0_10_CsrFixture from "../../zarr/src/json-fixtures/anndata-0.10/anndata-csr.adata.json";
import { Readable } from "@zarrita/storage";

describe("AnnData", () => {
  Object.entries({ 0.7: anndata_0_7_DenseFixture, 0.8: anndata_0_8_DenseFixture, 0.9: anndata_0_9_DenseFixture, '0.10': anndata_0_10_DenseFixture }).forEach(([version, fixture]) => {
    describe(`AnnData Dense X v${version}`, async () => {
      const store = createStoreFromMapContents(fixture);
      const adata = await readZarr(store as Readable);
      it("obs column", async () => {
        const ids = await adata.obs.get("leiden");
        expect(Array.from((await get(ids, [null])).data)).toEqual(["1", "1", "2"]);
      });
      it("obs index", async () => {
        const ids = await adata.obsNames();
        expect(Array.from((await get(ids, [null])).data)).toEqual(["CTG", "GCA", "CTG"]);
      });
      it("var index", async () => {
        const ids = await adata.varNames();
        expect(Array.from((await get(ids, [null])).data)).toEqual([...new Array(15).keys()].map((k: number) => `gene_${k}`));
      });
      it("obsm", async () => {
        const data = await adata.obsm.get("X_umap");
        expect(await get(data, [null, null])).toEqual(
          {
            data: new Int32Array([-1, -1, 0, 0, 1, 1]),
            shape: [3, 2],
            stride: [2, 1]
          }
        );
      });
      it("X", async () => {
        const data = await adata.X;
        expect(await get(data, [null, null])).toEqual(
          {
            data: new Float32Array(Array.from(Array(45).keys()).map(j => j % 15)),
            shape: [3, 15],
            stride: [15, 1]
          }
        );
        expect(await get(data, [0, null])).toEqual(
          {
            data: new Float32Array(Array.from(Array(15).keys())),
            shape: [15],
            stride: [1]
          }
        );
      });
    });
  })
  Object.entries({ 0.7: anndata_0_7_CscFixture, 0.8: anndata_0_8_CscFixture, 0.9: anndata_0_9_CscFixture, '0.10': anndata_0_10_CscFixture }).forEach(([version, fixture]) => {
    describe(`AnnData CSC X v${version}`, async () => {
      const store = createStoreFromMapContents(fixture);
      const adata = await readZarr(store as Readable);
      it("adata X", async () => {
        const data = adata.X;
        expect(await get(data, [null, null])).toEqual(
          {
            data: new Float32Array(Array.from(Array(45).keys()).map(j => j % 15)),
            shape: [3, 15],
            stride: [15, 1]
          }
        );
        expect(await get(data, [0, null])).toEqual(
          {
            data: new Float32Array(Array.from(Array(15).keys())),
            shape: [15],
            stride: [1]
          }
        );
      });
    });
  })
  Object.entries({ 0.7: anndata_0_7_CsrFixture, 0.8: anndata_0_8_CsrFixture, 0.9: anndata_0_9_CsrFixture, '0.10': anndata_0_10_CsrFixture }).forEach(([version, fixture]) => {
    describe(`AnnData CSR X v${version}`, async () => {
      const store = createStoreFromMapContents(fixture);
      const adata = await readZarr(store as Readable);
      it("adata X", async () => {
        const data = adata.X;
        expect(await get(data, [null, null])).toEqual(
          {
            data: new Float32Array(Array.from(Array(45).keys()).map(j => j % 15)),
            shape: [3, 15],
            stride: [15, 1]
          }
        );
        expect(await get(data, [0, null])).toEqual(
          {
            data: new Float32Array(Array.from(Array(15).keys())),
            shape: [15],
            stride: [1]
          }
        );
      });
    });
  })
})