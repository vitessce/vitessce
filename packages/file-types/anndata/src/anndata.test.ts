// import { HTTPStore, NestedArray } from "zarr";
import AnnData, { readZarr } from "./anndata";
import { describe, expect, it } from "vitest";
import * as zarr from "zarrita"
import { get } from "./utils";
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
import { AxisKey, AxisKeyTypes } from "./types";
import SparseArray from "./sparse_array";


type SparseMatrix = {
  indptr: Int32Array,
  indices: Int32Array,
  data: Float32Array
};

function generateDiagonalSparseMatrix(majorSize: number, minorSize: number): SparseMatrix {
  const indptr: number[] = [0];
  const indices: number[] = [];
  const data: number[] = [];
  const middleIndex = Math.floor(majorSize / 2);

  for (let i = 0; i < majorSize; i++) {
    if (i === middleIndex) {
      // Skip the middle row/column
      indptr.push(indices.length);
      continue;
    }

    if (i < minorSize) {
      indices.push(i);
      data.push(i); // Row number as the entry
    }

    indptr.push(indices.length);
  }

  return {
    indices: new Int32Array(indices),
    indptr: new Int32Array(indptr),
    data: new Float32Array(data)
  };
}

function getBufferElementType(buffer: ArrayBufferView): zarr.NumberDataType {
  const name = (buffer as any).__proto__.constructor.name;
  switch (name) {
    case "Int8Array":
      return "int8";
    case "Uint8Array":
      return "uint8";
    case "Int16Array":
      return "int16";
    case "Uint16Array":
      return "uint16";
    case "Int32Array":
      return "int32";
    case "Uint32Array":
      return "uint32";
    case "Float32Array":
      return "float32";
  }

  throw new Error(`Unsupported buffer type ${name}`);
}

async function genSparse(grp: zarr.Group<Map<any, any>>, shape: number[], type: "csc" | "csr") {
  const majorAxisSize = shape[Number(type === "csc")]
  const minorAxisSize = shape[(Number(type === "csc") - 1) % 1]
  const sparseMatrixArgs = generateDiagonalSparseMatrix(majorAxisSize, minorAxisSize)
  const sparseArrays = await Promise.all(Object.entries(sparseMatrixArgs).map(async ([name, array]) => {
    const dtype = getBufferElementType(array)
    const zarrArray = await zarr.create(grp.resolve(name), {
      shape,
      chunk_shape: shape,
      data_type: dtype,
    });
    const chunk = {
      data: array,
      shape: [array.length],
      stride: [1],
    } as zarr.Chunk<typeof dtype>;
    await zarr.set(zarrArray, null, chunk);
    return zarrArray
  }));
  return new SparseArray(sparseArrays[0], sparseArrays[1], sparseArrays[2], shape, type);
}

async function genDense(grp: zarr.Group<Map<any, any>>, shape: number[]) {
  const arr = await zarr.create(grp, {
    shape,
    chunk_shape: shape,
    data_type: "float32",
  });
  const data = new Float32Array(shape.reduce((a, b) => a * b, 1))
  for (let i = 0; i < data.length; i += 1) {
    data[i] = i
  }
  const chunk = {
    data,
    shape,
    stride: [shape[0], 1],
  } as zarr.Chunk<"float32">;
  await zarr.set(arr, null, chunk);
  return arr
}


async function genAnnData(keys: AxisKey[], n_obs: number, n_var: number, X_type?: "csc" | "csr" | "dense") {
  const shape = [n_obs, n_var]
  const adataInit = {} as AxisKeyTypes<Readable, zarr.NumberDataType>
  let root = zarr.root(new Map());
  let grp = await zarr.create(root);
  await Promise.all(keys.map(async key => {
    if (key === "X") {
      const X = await zarr.create(grp.resolve(key));
      if (X_type == "dense") {
        adataInit["X"] = await genDense(X, shape)
      } else if (X_type === "csc" || X_type === "csr") {
        adataInit["X"] = await genSparse(X, shape, X_type)
      }
    }
  }))
}

function test_io(fixture: [string, string][], type: "dense" | "csc" | "csr", version: number) {
  describe(`AnnData ${type} X v${version}`, async () => {
    const store = createStoreFromMapContents(fixture);
    const adata = await readZarr(store as Readable);
    it("obs column", async () => {
      const ids = await adata.obs.get("leiden");
      expect(Array.from((await get(ids, [null])).data)).toEqual(["1", "1", "2"]);
      expect(Array.from((await get(ids, [zarr.slice(0, 2)])).data)).toEqual(["1", "1"]);
      expect(await get(ids, [0])).toEqual("1");
      expect(await adata.obs.has("not_a_column")).toEqual(false);
      expect(async () => await adata.obs.get("not_a_column")).rejects.toThrow('obs has no key: \"not_a_column\"');
    });
    it("obs index", async () => {
      const ids = await adata.obsNames();
      expect(Array.from((await get(ids, [null])).data)).toEqual(["CTG", "GCA", "CTG"]);
      expect(Array.from((await get(ids, [zarr.slice(0, 2)])).data)).toEqual(["CTG", "GCA"]);
      expect(await get(ids, [0])).toEqual("CTG");
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
      if (data === undefined) {
        return;
      }
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
      expect(await get(data, [1, 1])).toEqual(1);
    });
  });
}

describe("AnnData i/o", () => {
  Object.entries({ 0.7: anndata_0_7_DenseFixture, 0.8: anndata_0_8_DenseFixture, 0.9: anndata_0_9_DenseFixture, '0.10': anndata_0_10_DenseFixture }).forEach(([version, fixture]) => {
    test_io(fixture, "dense", version)
  })
  Object.entries({ 0.7: anndata_0_7_CscFixture, 0.8: anndata_0_8_CscFixture, 0.9: anndata_0_9_CscFixture, '0.10': anndata_0_10_CscFixture }).forEach(([version, fixture]) => {
    test_io(fixture, "csc", version)
  })
  Object.entries({ 0.7: anndata_0_7_CsrFixture, 0.8: anndata_0_8_CsrFixture, 0.9: anndata_0_9_CsrFixture, '0.10': anndata_0_10_CsrFixture }).forEach(([version, fixture]) => {
    test_io(fixture, "csr", version)
  })
})