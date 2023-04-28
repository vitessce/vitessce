import { UnicodeStringArray } from "zarrita/custom-arrays";
import * as zarr from "zarrita/v2";
import FetchStore from "zarrita/storage/fetch";

import type { Codec } from "numcodecs";

const readFloat32FromUint8 = (bytes: Uint8Array) => {
  if (bytes.length !== 4) {
    throw new Error("readFloat32 only takes in length 4 byte buffers");
  }
  return new Int32Array(bytes.buffer)[0];
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
    const unicodeArr = new UnicodeStringArray(stringArr.length, 32);
    stringArr.forEach((s, ind) => unicodeArr.set(ind, s));
    return unicodeArr;
  },
  encode(bytes: Uint8Array) {
    console.warn("Encode not implemented, returning dummy array");
    return new UnicodeStringArray(1, 32);
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
        ? (zarray.filters)
        : Array([]);
      if (zarray.dtype === "|O" && filters.some((i) => i.id === "vlen-utf8")) {
        zarray.dtype = "<U8";
      }
      return new TextEncoder().encode(JSON.stringify(zarray));
    }
    return res;
  }
}

