// Adapted from https://github.com/hms-dbmi/vizarr/blob/5b0e3ea6fbb42d19d0e38e60e49bb73d1aca0693/src/utils.ts#L308
import type { Array as ZarrArray, DataType as ZarrDataType, Slice } from 'zarrita';
import { slice, get } from 'zarrita';

function getV2DataType(dtype: string) {
  const mapping: Record<string, string> = {
    int8: '|i1',
    uint8: '|u1',
    int16: '<i2',
    uint16: '<u2',
    int32: '<i4',
    uint32: '<u4',
    int64: '<i8',
    uint64: '<u8',
    float32: '<f4',
    float64: '<f8',
  };
  if (!(dtype in mapping)) {
    throw new Error(`Unsupported dtype ${dtype}`);
  }
  return mapping[dtype];
}

type Selection = (number | Omit<Slice, 'indices'> | null)[];

export function createZarrArrayAdapter(arr: ZarrArray<ZarrDataType>): any {
  return new Proxy(arr, {
    get(target, prop) {
      if (prop === 'getRaw') {
        return (selection: Selection) => get(
          target as any,
          selection ? selection.map((s) => {
            if (typeof s === 'object' && s !== null) {
              return slice(s.start, s.stop, s.step);
            }
            return s;
          }) : target.shape.map(() => null),
        );
      }
      if (prop === 'getRawChunk') {
        throw new Error('getRawChunk should not have been called');
        // TODO: match zarr.js handling of dimension ordering
        // Reference: https://github.com/hms-dbmi/vizarr/pull/172#issuecomment-1714497516
        return (
          selection: number[], options: { storeOptions: RequestInit },
        ) => target.getChunk(selection, options.storeOptions);
      }
      if (prop === 'dtype') {
        return getV2DataType(target.dtype);
      }
      return Reflect.get(target, prop);
    },
  });
}
