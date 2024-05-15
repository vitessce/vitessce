import * as zarr from "zarrita";
import { AbsolutePath, Readable, Readable } from "@zarrita/storage";
import { Listable } from "@zarrita/core";

// const readFloat32FromUint8 = (bytes: Uint8Array) => {
//   if (bytes.length !== 4) {
//     throw new Error("readFloat32 only takes in length 4 byte buffers");
//   }
//   return new Int32Array(bytes.buffer)[0];
// };
const NUM_CHARS = 32;

// UnicodeStringArray.prototype.subarray = function subarray(
//   start: number,
//   end: number
// ): UnicodeStringArray {
//   return new UnicodeStringArray(
//     this.#data.subarray(start, end).buffer,
//     NUM_CHARS
//   );
// };

// UnicodeStringArray.prototype.set = function set(value, idx) {
//   if (typeof value == "string") {
//     const offset = this.chars * idx;
//     const view = this.#data.subarray(offset, offset + this.chars);
//     view.fill(0);
//     view.set(this.encode(value));
//   } else {
//     const offset = this.chars * idx;
//     Array.from(value).forEach((v, ind) => {
//       const view = this.#data.subarray(
//         offset + ind * this.chars,
//         offset + (ind + 1) * this.chars
//       );
//       view.fill(0);
//       view.set(this.encode(v));
//     });
//   }
// };

// const HEADER_LENGTH = 4;

// /**
//  * Method for decoding text arrays from zarr.
//  * Largerly a port of https://github.com/zarr-developers/numcodecs/blob/2c1aff98e965c3c4747d9881d8b8d4aad91adb3a/numcodecs/vlen.pyx#L135-L178
//  * @returns {string[]} An array of strings.
//  */
// function parseVlenUtf8(buffer: Uint8Array): string[] {
//   const decoder = new TextDecoder();
//   let data = 0;
//   const dataEnd = data + buffer.length;
//   const length = readFloat32FromUint8(buffer.slice(data, HEADER_LENGTH));
//   if (buffer.length < HEADER_LENGTH) {
//     throw new Error("corrupt buffer, missing or truncated header");
//   }
//   data += HEADER_LENGTH;
//   const output = new Array(length);
//   for (let i = 0; i < length; i += 1) {
//     if (data + 4 > dataEnd) {
//       throw new Error("corrupt buffer, data seem truncated");
//     }
//     const l = readFloat32FromUint8(buffer.slice(data, data + 4));
//     data += 4;
//     if (data + l > dataEnd) {
//       throw new Error("corrupt buffer, data seem truncated");
//     }
//     output[i] = decoder.decode(buffer.slice(data, data + l));
//     data += l;
//   }
//   return output;
// }

// const vLenUtf8Codec = {
//   decode(bytes: Uint8Array) {
//     const stringArr = parseVlenUtf8(bytes);
//     const unicodeArr = new UnicodeStringArray(stringArr.length, NUM_CHARS);
//     stringArr.forEach((s, ind) => unicodeArr.set(s, ind));
//     return unicodeArr;
//   },
//   encode(bytes: Uint8Array) {
//     console.warn("Encode not implemented, returning dummy array");
//     return new UnicodeStringArray(1, NUM_CHARS);
//   },
// };

// async function getCodec() {
//   return {
//     fromConfig: () => vLenUtf8Codec as Codec,
//   };
// }

// zarr.registry.set("vlen-utf8", () => getCodec());

// export class StringOverrideReadable extends Readable {
//   public async get(
//     key: `/${string}`,
//     opts?: RequestInit | undefined
//   ): Promise<Uint8Array | undefined> {
//     const res = await super.get(key, opts);
//     if (key.includes("/.zarray")) {
//       const str = new TextDecoder().decode(res);
//       const zarray = JSON.parse(str);
//       const filters = Array.isArray(zarray.filters)
//         ? zarray.filters
//         : Array([]);
//       if (zarray.dtype === "|O" && filters.some((i: any) => i.id === "vlen-utf8")) {
//         zarray.dtype = "<U8";
//       }
//       return new TextEncoder().encode(JSON.stringify(zarray));
//     }
//     return res;
//   }
// }

// TODO: K should only be a uint probably but this makes working with things a bitmore challenging?
export class LazyCategoricalArray<K extends zarr.DataType, D extends zarr.DataType, S extends Readable> {
  public codes: zarr.Array<K, S>;

  public categories: zarr.Array<D, S>;

  constructor(
    codes: zarr.Array<K, S>,
    categories: zarr.Array<D, S>
  ) {
    this.codes = codes;
    this.categories = categories;
  }
}

function isLazyCategoricalArray<K extends zarr.DataType, D extends zarr.DataType, S extends Readable>(
  arr: LazyCategoricalArray<K, D, S> | zarr.Array<D, S>
): arr is LazyCategoricalArray<K, D, S> {
  return (arr as LazyCategoricalArray<K, D, S>).categories !== undefined;
}

export async function get<K extends zarr.DataType, D extends zarr.DataType, S extends Readable>(
  arr: LazyCategoricalArray<K, D, S> | zarr.Array<D, S>
): Promise<any[]> {
  if (isLazyCategoricalArray(arr)) {
    const codes = await zarr.get(arr.codes, null);
    const categories = await zarr.get(arr.categories, null); //
    const data = new Array(codes.data.length); // TODO(ilan-gold): better string array choice, how to construct from categories?
    Array.from(codes.data).forEach((val: number | bigint, ind: number) => { // Todo forEach
      const cat = Number(val)
      data[ind] = (categories.data as any)[cat]; // TODO: what is up with this??
    });
    return data;
  }
  const { data } = await zarr.get(arr, null);
  return (data as any[]);
}



export async function has<S extends Readable>(root: zarr.Group<S>, path: string) {
  try {
    await zarr.open(root.resolve(path));
  } catch (error) {
    if (error instanceof zarr.NodeNotFoundError) {
      return false;
    }
    return true;
  }
}