import { UnicodeStringArray } from "zarrita/custom-arrays";
import * as zarr from "zarrita/v2";
import { get as getZarrita } from "zarrita/ops";
import FetchStore from "zarrita/storage/fetch";

import type { Codec } from "numcodecs";
import type { DataType } from "zarrita";
const readFloat32FromUint8 = (bytes: Uint8Array) => {
  if (bytes.length !== 4) {
    throw new Error("readFloat32 only takes in length 4 byte buffers");
  }
  return new Int32Array(bytes.buffer)[0];
};
const NUM_CHARS = 32;

UnicodeStringArray.prototype.subarray = function subarray(
  start: number,
  end: number
): UnicodeStringArray {
  return new UnicodeStringArray(
    this._data.subarray(start, end).buffer,
    NUM_CHARS
  );
};

UnicodeStringArray.prototype.set = function set(value, idx) {
  if (typeof value == "string") {
    const offset = this.chars * idx;
    const view = this._data.subarray(offset, offset + this.chars);
    view.fill(0);
    view.set(this.encode(value));
  } else {
    const offset = this.chars * idx;
    Array.from(value).forEach((v, ind) => {
      const view = this._data.subarray(
        offset + ind * this.chars,
        offset + (ind + 1) * this.chars
      );
      view.fill(0);
      view.set(this.encode(v));
    });
  }
};

const HEADER_LENGTH = 4;

/**
 * Method for decoding text arrays from zarr.
 * Largerly a port of https://github.com/zarr-developers/numcodecs/blob/2c1aff98e965c3c4747d9881d8b8d4aad91adb3a/numcodecs/vlen.pyx#L135-L178
 * @returns {string[]} An array of strings.
 */
function parseVlenUtf8(buffer: Uint8Array): string[] {
  const decoder = new TextDecoder();
  let data = 0;
  const dataEnd = data + buffer.length;
  const length = readFloat32FromUint8(buffer.slice(data, HEADER_LENGTH));
  if (buffer.length < HEADER_LENGTH) {
    throw new Error("corrupt buffer, missing or truncated header");
  }
  data += HEADER_LENGTH;
  const output = new Array(length);
  for (let i = 0; i < length; i += 1) {
    if (data + 4 > dataEnd) {
      throw new Error("corrupt buffer, data seem truncated");
    }
    const l = readFloat32FromUint8(buffer.slice(data, data + 4));
    data += 4;
    if (data + l > dataEnd) {
      throw new Error("corrupt buffer, data seem truncated");
    }
    output[i] = decoder.decode(buffer.slice(data, data + l));
    data += l;
  }
  return output;
}

const vLenUtf8Codec = {
  decode(bytes: Uint8Array) {
    const stringArr = parseVlenUtf8(bytes);
    const unicodeArr = new UnicodeStringArray(stringArr.length, NUM_CHARS);
    stringArr.forEach((s, ind) => unicodeArr.set(s, ind));
    return unicodeArr;
  },
  encode(bytes: Uint8Array) {
    console.warn("Encode not implemented, returning dummy array");
    return new UnicodeStringArray(1, NUM_CHARS);
  },
};

async function getCodec() {
  return {
    fromConfig: () => vLenUtf8Codec as Codec,
  };
}

zarr.registry.set("vlen-utf8", () => getCodec());

export class StringOverrideFetchStore extends FetchStore {
  public async get(
    key: `/${string}`,
    opts?: RequestInit | undefined
  ): Promise<Uint8Array | undefined> {
    const res = await super.get(key, opts);
    if (key.includes("/.zarray")) {
      const str = new TextDecoder().decode(res);
      const zarray = JSON.parse(str);
      const filters = Array.isArray(zarray.filters)
        ? zarray.filters
        : Array([]);
      if (zarray.dtype === "|O" && filters.some((i) => i.id === "vlen-utf8")) {
        zarray.dtype = "<U8";
      }
      return new TextEncoder().encode(JSON.stringify(zarray));
    }
    return res;
  }
}

export class LazyCategoricalArray {
  public codes: zarr.Array<"<U4", StringOverrideFetchStore>;

  public categories: zarr.Array<"<U4", StringOverrideFetchStore>;

  constructor(
    codes: zarr.Array<"<U4", StringOverrideFetchStore>,
    categories: zarr.Array<"<U4", StringOverrideFetchStore>
  ) {
    this.codes = codes;
    this.categories = categories;
  }
}

function isLazyCategoricalArray<D extends DataType>(
  arr: LazyCategoricalArray | zarr.Array<D, StringOverrideFetchStore>
): arr is LazyCategoricalArray {
  return (arr as LazyCategoricalArray).categories !== undefined;
}

export async function get<D extends DataType>(
  arr: LazyCategoricalArray | zarr.Array<D, StringOverrideFetchStore>
) {
  if (isLazyCategoricalArray(arr)) {
    const codes = await getZarrita(arr.codes);
    const categories = await getZarrita(arr.categories);
    const unicodeArr = new UnicodeStringArray(codes.data.length, NUM_CHARS);
    codes.data.forEach((val, ind) => {
      unicodeArr.set(categories.data.get(val), ind);
    });
    return unicodeArr;
  }
  return getZarrita(arr);
}
