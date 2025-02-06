/* eslint-disable radix */
/* eslint-disable-next-line camelcase */
import { extent, max as d3_max } from 'd3-array';

import { log } from '@vitessce/globals';

function normalize(arr) {
  const [min, max] = extent(arr);
  const ratio = 255 / (max - min);
  const data = new Uint8Array(
    arr.map(i => Math.floor((i - min) * ratio)),
  );
  return data;
}

/**
 *
 * @param {array[]} multiFeatureValues One array per channel.
 * @param {object[]} setColorValues One object per channel.
 * @param {boolean[]} channelIsSetColorMode Whether the channel
 * colors should use obsSet colors or quantitative feature values.
 * @param {number} texSize The width of the texture; the height
 * will be determined by the length of the concatenated values.
 * @returns
 */
export function multiSetsToTextureData(
  multiFeatureValues, multiMatrixObsIndex, setColorValues, channelIsSetColorMode, texSize,
) {
  let totalValuesLength = 0;
  let totalColorsLength = 0;

  channelIsSetColorMode.forEach((isSetColorMode, channelIndex) => {
    if (isSetColorMode) {
      // totalValuesLength += setColorValues[channelIndex]?.obsIndex?.length || 0;
      totalColorsLength += (setColorValues[channelIndex]?.setColors?.length || 0) * 3;

      // TODO: if we can assume values are monotonically increasing,
      // we can just use the final array value arr[-1] directly as the max.
      totalValuesLength += (
        setColorValues[channelIndex]?.obsIndex
          ? d3_max(setColorValues[channelIndex].obsIndex.map(d => parseInt(d)))
          : 0
      );
    } else {
      // totalValuesLength += multiFeatureValues[channelIndex]?.length || 0;

      // TODO: if we can assume values are monotonically increasing,
      // we can just use the final array value arr[-1] directly as the max.
      totalValuesLength += (
        multiMatrixObsIndex[channelIndex]
          ? d3_max(multiMatrixObsIndex[channelIndex].map(d => parseInt(d)))
          : (multiFeatureValues[channelIndex]?.length || 0)
      );
    }
  });

  const valueTexHeight = Math.max(2, Math.ceil(totalValuesLength / texSize));
  const colorTexHeight = Math.max(2, Math.ceil(totalColorsLength / texSize));

  if (valueTexHeight > texSize) {
    log.error('Error: length of concatenated quantitative feature values larger than maximum texture size');
  }
  if (colorTexHeight > texSize) {
    log.error('Error: length of concatenated quantitative feature values larger than maximum texture size');
  }
  // Array for texture containing color indices.
  const totalData = new Uint8Array(texSize * valueTexHeight);
  // Array for texture containing color RGB values.
  const totalColors = new Uint8Array(texSize * colorTexHeight);

  // Per-channel offsets into the texture arrays.
  const indicesOffsets = [];
  const colorsOffsets = []; // Color offsets need to be multiplied by 3 in the shader.
  let indexOffset = 0;
  let colorOffset = 0;
  // Iterate over the data for each channel.
  channelIsSetColorMode.forEach((isSetColorMode, channelIndex) => {
    const matrixObsIndex = multiMatrixObsIndex[channelIndex];
    // Assume the bitmask values correspond to the values in the matrixObsIndex (off by one).
    const bitmaskValueIsIndex = matrixObsIndex === null;
    if (isSetColorMode) {
      const { setColorIndices, setColors, obsIndex } = setColorValues[channelIndex] || {};
      if (setColorIndices && setColors && obsIndex) {
        for (let i = 0; i < obsIndex.length; i++) {
          let obsId = String(i + 1);
          let obsI = i;
          // TODO: this uses the matrixObsIndex to determine the value of the flag, is that correct?
          if (!bitmaskValueIsIndex) {
            // We cannot assume that the values in the bitmask
            // correspond to the values in the matrixObsIndex.
            obsId = obsIndex[i];
            obsI = parseInt(obsId) - 1;
          }
          // We add one here to account for i being 0-based but the pixel values being 1-based
          // (to account for zero indicating the background of the segmentation bitmask).
          const colorIndex = setColorIndices.get(obsId);
          // Add one to the color index, so that we can use zero to indicate a "null" set color.
          totalData[indexOffset + obsI] = colorIndex === undefined ? 0 : colorIndex + 1;
        }
        for (let i = 0; i < setColors.length; i++) {
          const { color: [r, g, b] } = setColors[i];
          totalColors[(colorOffset + i) * 3 + 0] = r;
          totalColors[(colorOffset + i) * 3 + 1] = g;
          totalColors[(colorOffset + i) * 3 + 2] = b;
        }
      }
      indicesOffsets.push(indexOffset);
      colorsOffsets.push(colorOffset);
      indexOffset += (obsIndex?.length || 0);
      colorOffset += (setColors?.length || 0);
    } else {
      const featureArr = multiFeatureValues[channelIndex];
      const normalizedFeatureArr = normalize(featureArr);

      if (!bitmaskValueIsIndex && matrixObsIndex) {
        // We cannot assume that the values in the bitmask
        // correspond to the values in the matrixObsIndex.
        for (let i = 0; i < matrixObsIndex.length; i++) {
          const obsId = matrixObsIndex[i];
          const obsI = parseInt(obsId) - 1;
          totalData[indexOffset + obsI] = normalizedFeatureArr[i];
        }
      } else {
        // TODO: are these values always already normalized?
        totalData.set(normalizedFeatureArr, indexOffset);
      }
      indicesOffsets.push(indexOffset);
      indexOffset += featureArr.length;
      // Add a color offset so that the number of offsets still equals the number of channels.
      colorsOffsets.push(colorOffset);
    }
  });

  return [
    totalData,
    valueTexHeight,
    indicesOffsets,
    totalColors,
    colorTexHeight,
    colorsOffsets,
  ];
}
