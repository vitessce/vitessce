import { extent } from 'd3-array';


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
      totalValuesLength += setColorValues[channelIndex]?.obsIndex?.length || 0;
      totalColorsLength += (setColorValues[channelIndex]?.setColors?.length || 0) * 3;
    } else {
      totalValuesLength += multiFeatureValues[channelIndex]?.length || 0;
    }
  });

  const valueTexHeight = Math.max(2, Math.ceil(totalValuesLength / texSize));
  const colorTexHeight = Math.max(2, Math.ceil(totalColorsLength / texSize));

  if (valueTexHeight > texSize) {
    console.error('Error: length of concatenated quantitative feature values larger than maximum texture size');
  }
  if (colorTexHeight > texSize) {
    console.error('Error: length of concatenated quantitative feature values larger than maximum texture size');
  }
  // Array for texture containing color indices.
  const totalData = new Uint8Array(texSize * valueTexHeight);
  // Assume there are the same number of items in each matrixObsIndex as in the corresponding data.
  const totalIndices = new Uint8Array(texSize * valueTexHeight);
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
    if(!bitmaskValueIsIndex) {
      // We cannot assume that the values in the bitmask correspond to the values in the matrixObsIndex.
      // We instead need to use the bitmask values to look up the index of the corresponding ID in the matrixObsIndex or the setColorValues[].obsIndex.

    }
    if (isSetColorMode) {
      const { setColorIndices, setColors, obsIndex } = setColorValues[channelIndex] || {};
      if (setColorIndices && setColors && obsIndex) {
        for (let i = 0; i < obsIndex.length; i++) {
          // We add one here to account for i being 0-based but the pixel values being 1-based
          // (to account for zero indicating the background of the segmentation bitmask).
          const colorIndex = setColorIndices.get(String(i + 1));
          // Add one to the color index, so that we can use zero to indicate a "null" set color.
          totalData[indexOffset + i] = colorIndex === undefined ? 0 : colorIndex + 1;
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
      
      // TODO: are these values always already normalized?
      totalData.set(normalize(featureArr), indexOffset);
      // TODO: also need to pass in a texture which contains an (implicit) mapping from obsId to obsI (the index in the matrixObsIndex),
      // since the pixel values may not correspond directly to the obsI.
      // TODO: Also need to pass in the flag indicating whether to use this texture or not since it will reduce performance.
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
