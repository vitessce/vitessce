// Dataset description for the volume info panel: source levels as stored, the
// render levels planned from them, and the source levels too large to render.
import { getBytesPerElement } from './volume-zarr.js';

const DTYPE_KINDS = { u: 'uint', i: 'int', f: 'float' };
const BRICK_SIZE = 32;
// Chunk sizes recommended for loading bricks: at least a brick deep, and at
// most this along every axis.
const MAX_RECOMMENDED_CHUNK = 256;
// NGFF units are spelled out; OME-XML ones are already symbols.
const UNIT_SYMBOLS = {
  nanometer: 'nm', micrometer: 'µm', millimeter: 'mm', centimeter: 'cm', meter: 'm',
};

/**
 * @param {string} [unit] E.g. 'micrometer' (NGFF) or 'µm' (OME-XML).
 * @returns {string} The symbol, or '' without a unit.
 */
export function formatUnit(unit) {
  if (!unit) return '';
  return UNIT_SYMBOLS[String(unit).toLowerCase()] ?? String(unit);
}

/**
 * @param {string} dtype As zarrita (uint16, or Zarr v2 codes such as <u2) or viv (Uint16) give it.
 * @returns {string} E.g. 'uint16', 'float32'.
 */
export function formatDtype(dtype) {
  const name = String(dtype).toLowerCase();
  const [, kind, bytes] = name.match(/^[<>|=]?([uif])(\d+)$/) ?? [];
  return kind ? `${DTYPE_KINDS[kind]}${Number(bytes) * 8}` : name;
}

/**
 * How many times its own size one brick at full resolution of a source level
 * reads in source chunks, with bricks aligned to chunks.
 * @param {number[]} shape ZYX.
 * @param {number[]} chunks ZYX.
 * @returns {number}
 */
function getBrickReadFactor(shape, chunks) {
  const brick = shape.map(size => Math.min(BRICK_SIZE, size));
  const read = brick.map((size, i) => Math.min(Math.ceil(size / chunks[i]) * chunks[i], shape[i]));
  const voxels = sizes => sizes.reduce((product, size) => product * size, 1);
  return voxels(read) / voxels(brick);
}

/**
 * @param {object} options
 * @param {object[]} options.sourceArrays Every source level, with shape, chunks, dtype.
 * @param {string[]} options.labels Axis labels of the arrays.
 * @param {object[]} options.levels Render levels from _planLevelsWithinPageTable.
 * @param {number} options.firstSource The finest source level that is rendered.
 * @param {number[]} [options.maxShape] Largest loadable level, ZYX voxels.
 * @param {number[]} options.spacing Level-0 voxel size, ZYX.
 * @param {string} [options.spacingUnit] Unit of the voxel size, as in the metadata.
 * @returns {object} sourceLevels and renderLevels with ZYX shapes; render level
 * sources index sourceLevels. Sizes in bytes are for the one timepoint the view
 * shows: channelBytes for one channel, bytes for all channels. A source level
 * isOverMaxXY (dropped) or isOverMaxZ (binned in Z) when larger than maxShape.
 * brickReadFactor: see getBrickReadFactor.
 */
export function getVolumeInfo({
  sourceArrays, labels, levels, firstSource, maxShape = [Infinity, Infinity, Infinity],
  spacing, spacingUnit,
}) {
  const zyx = values => ['z', 'y', 'x'].map(axis => (
    labels.includes(axis) ? values[labels.indexOf(axis)] : 1
  ));
  const [array0] = sourceArrays;
  const channelCount = labels.includes('c') ? array0.shape[labels.indexOf('c')] : 1;
  const bytesPerElement = getBytesPerElement(array0.dtype);
  return {
    dtype: formatDtype(array0.dtype),
    channelCount,
    spacing,
    spacingUnit: formatUnit(spacingUnit),
    firstSource,
    maxShape,
    sourceLevels: sourceArrays.map((array, index) => {
      const shape = zyx(array.shape);
      const chunks = zyx(array.chunks);
      const channelBytes = shape.reduce((product, size) => product * size, 1) * bytesPerElement;
      return {
        shape,
        chunks,
        brickReadFactor: getBrickReadFactor(shape, chunks),
        channelBytes,
        bytes: channelBytes * channelCount,
        isRendered: index >= firstSource,
        isOverMaxXY: shape[1] > maxShape[1] || shape[2] > maxShape[2],
        isOverMaxZ: shape[0] > maxShape[0],
      };
    }),
    renderLevels: levels.map(level => ({
      source: level.source + firstSource,
      shape: level.dataShape,
      zFactor: level.zFactor,
      zMode: level.zMode,
      // Block mean in XY, for virtual levels below the coarsest stored one.
      xyFactor: Math.max(level.yFactor ?? 1, level.xFactor ?? 1),
    })),
  };
}

/**
 * @param {number} bytes
 * @returns {string} E.g. '512 B', '1.5 MB', '7.5 GB'.
 */
export function formatBytes(bytes) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${unit === 0 ? value : value.toFixed(1)} ${units[unit]}`;
}

/**
 * @param {number[]} zyx
 * @returns {string} X × Y × Z, the order people read image sizes in.
 */
export function formatExtent([z, y, x]) {
  return `${x} × ${y} × ${z}`;
}

/**
 * Warning for channels without a value range in the metadata (OMERO window or
 * min/max, or an OME-TIFF sample range), which the brick cache then stores over
 * a fallback range (see VolumeDataManager._loadBrick).
 * @param {number[]} channels Channel indices without a range.
 * @param {number} channelCount
 * @returns {string|null} Null when every channel has a range.
 */
export function formatRangeWarning(channels, channelCount) {
  if (!channels?.length) return null;
  let which = `channel ${channels.join(', ')}`;
  if (channels.length === channelCount) which = channelCount === 1 ? 'the channel' : 'any channel';
  return `No value range in the metadata for ${which}: stored over the range of its overview ± 100%`;
}

/**
 * Hint for chunks outside the recommended sizes that make every brick read
 * more than it needs, e.g. one-plane chunks or TIFF tiles (32 planes of a whole
 * chunk each). Chunks are compared as clipped to the volume.
 * @param {object} sourceLevel From getVolumeInfo: the finest one rendered.
 * @returns {string|null} Null when the chunks are within the recommended sizes.
 */
export function formatChunkWarning({ shape, chunks, brickReadFactor }) {
  const clipped = chunks.map((size, i) => Math.min(size, shape[i]));
  const isTooShallow = clipped[0] < Math.min(BRICK_SIZE, shape[0]);
  const isTooLarge = clipped.some(size => size > MAX_RECOMMENDED_CHUNK);
  if (brickReadFactor <= 1 || !(isTooShallow || isTooLarge)) return null;
  return `Slow loading: each brick downloads and decodes ${Math.round(brickReadFactor)}×`
    + ` the data it needs (chunks ${formatExtent(chunks)});`
    + ` chunks with Z ≥ ${BRICK_SIZE} and X, Y, Z ≤ ${MAX_RECOMMENDED_CHUNK}, or a lower LOD,`
    + ' load faster';
}
