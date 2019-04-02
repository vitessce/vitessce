export function setImageDataRGBA(imageData, offset, r, g, b, a) {
  /* eslint-disable no-param-reassign */
  imageData.data[offset + 0] = r;
  imageData.data[offset + 1] = g;
  imageData.data[offset + 2] = b;
  imageData.data[offset + 3] = a;
  /* eslint-enable */
}
