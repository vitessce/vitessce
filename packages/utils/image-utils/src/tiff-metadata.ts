/* eslint-disable no-underscore-dangle */
// Reads of OME-TIFF metadata that viv does not expose: they go through the
// TIFF directory (IFD) of one plane, which viv's TiffPixelSource returns from
// its private _indexer.

type TiffImage = {
  getTileHeight(): number;
  getTileWidth(): number;
  fileDirectory?: Record<string, unknown>;
};

export type TiffPixelSourceLike = {
  labels: string[];
  _indexer(selection: Record<string, number>): Promise<TiffImage>;
};

// Selection of the first plane, for reading a level's TIFF directory.
function getFirstPlaneSelection(labels: string[]): Record<string, number> {
  return Object.fromEntries(labels
    .filter(axis => axis !== 'y' && axis !== 'x')
    .map(axis => [axis, 0]));
}

/**
 * Tile shape of one OME-TIFF pyramid level, from its own TIFF directory.
 * viv's tileSize is level 0's for every level, but pyramid writers often shrink
 * tiles at coarse levels (e.g. 1024, 928, 464). Stripped (untiled) images give
 * the image width and RowsPerStrip.
 * @param pixelSource viv TiffPixelSource of the level.
 * @returns [tileHeight, tileWidth]
 */
export async function readTiffTileShape(
  pixelSource: TiffPixelSourceLike,
): Promise<[number, number]> {
  const image = await pixelSource._indexer(getFirstPlaneSelection(pixelSource.labels));
  return [image.getTileHeight(), image.getTileWidth()];
}

/**
 * Sample value range of an OME-TIFF, if its writer recorded one: the TIFF
 * SMinSampleValue / SMaxSampleValue tags, or the same keys in the OME-XML
 * original metadata (kept by Bio-Formats conversions). Neither is part of the
 * OME-XML model, and viv's parser drops annotations, so this reads the first IFD.
 * Tags hold one value per sample; this returns the overall range.
 * @param pixelSource viv TiffPixelSource of level 0.
 * @returns [min, max], or null if not recorded.
 */
export async function readTiffSampleRange(
  pixelSource: TiffPixelSourceLike,
): Promise<[number, number] | null> {
  try {
    const image = await pixelSource._indexer(getFirstPlaneSelection(pixelSource.labels));
    const directory = image?.fileDirectory ?? {};
    const fromTag = (value: unknown, reduce: (...values: number[]) => number) => (
      value === undefined || typeof value === 'number'
        ? value as number | undefined
        : reduce(...Array.from(value as ArrayLike<number>))
    );
    let min = fromTag(directory.SMinSampleValue, Math.min);
    let max = fromTag(directory.SMaxSampleValue, Math.max);
    const description = directory.ImageDescription;
    if (!(Number.isFinite(min) && Number.isFinite(max)) && typeof description === 'string') {
      const fromXml = (key: string) => Number(description
        .match(new RegExp(`<Key>${key}</Key>\\s*<Value>([^<]*)</Value>`))?.[1]);
      min = fromXml('SMinSampleValue');
      max = fromXml('SMaxSampleValue');
    }
    return Number.isFinite(min) && Number.isFinite(max) && (max as number) > (min as number)
      ? [min as number, max as number]
      : null;
  } catch (error) {
    return null; // The range is optional metadata.
  }
}
