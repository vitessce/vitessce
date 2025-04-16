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
export function multiSetsToTextureData(multiFeatureValues: array[], multiMatrixObsIndex: any, setColorValues: object[], channelIsSetColorMode: boolean[], texSize: number): (number | any[] | Uint8Array)[];
//# sourceMappingURL=bitmask-utils.d.ts.map