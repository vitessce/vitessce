const BYTES_PER_ELEMENT: Record<string, number> = {
  bool: 1,
  int8: 1,
  uint8: 1,
  int16: 2,
  uint16: 2,
  int32: 4,
  uint32: 4,
  float16: 2,
  float32: 4,
  int64: 8,
  uint64: 8,
  float64: 8,
};

/**
 * Bytes per element of an array data type.
 * @param dtype A zarrita dtype ('uint16', 'float32'), a Zarr v2 dtype code
 * ('<u2', '|u1', '|b1'), or a viv dtype name ('Uint16', 'Float32').
 * @returns Bytes per element; 8 (conservative) when unknown.
 */
export function getBytesPerElement(dtype: string): number {
  const name = String(dtype).toLowerCase();
  if (name in BYTES_PER_ELEMENT) {
    return BYTES_PER_ELEMENT[name];
  }
  // Zarr v2 codes give the size in bytes.
  const [, bytes] = name.match(/^[<>|=][biuf](\d+)$/) ?? [];
  return bytes ? Number(bytes) : 8;
}
