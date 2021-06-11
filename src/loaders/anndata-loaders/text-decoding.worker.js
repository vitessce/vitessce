
const readFloat32FromUint8 = (bytes) => {
  if (bytes.length !== 4) {
    throw new Error('readFloat32 only takes in length 4 byte buffers');
  }
  return new Int32Array(bytes.buffer)[0];
};

const HEADER_LENGTH = 4;

/**
   * Method for decoding text arrays from zarr.
   * Largerly a port of https://github.com/zarr-developers/numcodecs/blob/2c1aff98e965c3c4747d9881d8b8d4aad91adb3a/numcodecs/vlen.pyx#L135-L178
   * @returns {string[]} An array of strings.
   */
function parseVlenUtf8(buffer) {
  const decoder = new TextDecoder();
  let data = 0;
  const dataEnd = data + buffer.length;
  const length = readFloat32FromUint8(buffer.slice(data, HEADER_LENGTH));
  if (buffer.length < HEADER_LENGTH) {
    throw new Error('corrupt buffer, missing or truncated header');
  }
  data += HEADER_LENGTH;
  const output = new Array(length);
  for (let i = 0; i < length; i += 1) {
    if (data + 4 > dataEnd) {
      throw new Error('corrupt buffer, data seem truncated');
    }
    const l = readFloat32FromUint8(buffer.slice(data, data + 4));
    data += 4;
    if (data + l > dataEnd) {
      throw new Error('corrupt buffer, data seem truncated');
    }
    output[i] = decoder.decode(buffer.slice(data, data + l));
    data += l;
  }
  return [output, null];
}

/**
 * Worker message passing logic.
 */
if (typeof self !== "undefined") {
  const nameToFunction = {
    parseVlenUtf8,
  };

  self.addEventListener("message", (event) => {
    try {
      const [name, args] = event.data;
      const [message, transfers] = nameToFunction[name](args);
      self.postMessage(message, transfers);
    } catch (e) {
      console.warn(e);
    }
  });
}
