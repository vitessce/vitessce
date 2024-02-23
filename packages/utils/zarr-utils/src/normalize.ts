// Adapted from https://github.com/hms-dbmi/vizarr/blob/5b0e3ea6fbb42d19d0e38e60e49bb73d1aca0693/src/utils.ts#L26
import type { Readable } from '@zarrita/storage';
import type { Chunk, ObjectType } from '@zarrita/core';
import { root as zarrRoot, FetchStore, registry } from 'zarrita';
import { ZipFileStore, ReferenceStore } from '@zarrita/storage';

type JsonCodecConfig = {
  encoding: string,
  skipkeys: boolean,
  ensure_ascii: boolean,
  check_circular: boolean,
  allow_nan: boolean,
  sort_keys: boolean,
  indent: number|null,
  separators: [string, string] | null,
  strict: boolean,
};
type EncoderConfig = {
  skipkeys: boolean,
  ensure_ascii: boolean,
  check_circular: boolean,
  allow_nan: boolean,
  sort_keys: boolean,
  indent: number|null,
  separators: [string, string] | null,
};
type DecoderConfig = {
  strict: boolean,
};
class JsonCodec {
  kind = "array_to_bytes";
  _text_encoding: JsonCodecConfig["encoding"];
  separators: null|[string, string];
  _encoder_config: EncoderConfig;
  _decoder_config: DecoderConfig;

  constructor(
    public config: JsonCodecConfig,
  ) {
    const {
      encoding = 'utf-8',
      skipkeys = false,
      ensure_ascii = true,
      check_circular = true,
      allow_nan = true,
      sort_keys = true,
      indent = null,
      strict = true,
    } = config;
    let separators = config.separators;
    // Reference: https://github.com/zarr-developers/numcodecs/blob/0878717a3613d91a453fe3d3716aa9c67c023a8b/numcodecs/json.py#L36
    this._text_encoding = encoding;
    if(!separators) {
      // ensure separators are explicitly specified, and consistent behaviour across
      // Python versions, and most compact representation if indent is None
      if(!indent) {
        separators = [',', ':'];
      } else {
        separators = [', ', ': '];
      }
    }
    this.separators = separators;

    this._encoder_config = {
      skipkeys: skipkeys,
      ensure_ascii: ensure_ascii,
      check_circular: check_circular,
      allow_nan: allow_nan,
      indent: indent,
      separators,
      sort_keys: sort_keys
    };
    // self._encoder = _json.JSONEncoder(**self._encoder_config)
    this._decoder_config = { strict: strict };
    // self._decoder = _json.JSONDecoder(**self._decoder_config)
  }
  static fromConfig(
		configuration: JsonCodecConfig,
	) {
		return new JsonCodec(configuration);
	}

	encode(_chunk: any): Uint8Array {
		throw new Error("Method not implemented.");
	}

	decode(bytes: Uint8Array): any {
		let decoder = new TextDecoder();
    const jsonString = decoder.decode(bytes.buffer);
    const items = JSON.parse(jsonString);
    const shape = items.pop();
    const dtype = items.pop();
    if(!shape) {
      // O-d case?
      throw new Error("0D not implemented for JsonCodec.");
    } else {
      let data = Array(shape.reduce((a: number, h: number) => a*h, 1));
      
    }

		let view = new DataView(bytes.buffer);
		let data = Array(view.getUint32(0, true));

		let pos = 4;
		for (let i = 0; i < data.length; i++) {
			let item_length = view.getUint32(pos, true);
			pos += 4;
			data[i] = decoder.decode(bytes.buffer.slice(pos, pos + item_length));
			pos += item_length;
		}
		return { data, shape: this.#shape, stride: this.#strides };
	}
}

registry.set('json2', JsonCodec)
export async function zarrOpenRoot(url: string, requestInit: RequestInit) {
  let store: Readable;
  if(url.endsWith('.zip')) {
    store = ZipFileStore.fromUrl(url);
  } else if(url.endsWith('.json')) {
    const referenceRes = await fetch(url);
    const referenceSpec = await referenceRes.json();
    console.log(JSON.stringify(referenceSpec).includes('json2'));
    store = await ReferenceStore.fromSpec(referenceSpec);
  } else {
    store = new FetchStore(url, { overrides: requestInit });
  }

  // Wrap remote stores in a cache
  return zarrRoot(store);
}
