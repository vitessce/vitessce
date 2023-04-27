/* eslint-disable no-restricted-globals */

/**
 * Map a gene expression matrix onto multiple square array tiles,
 * taking into account the ordering/selection of cells.
 * @param {object} params
 * @param {string} params.curr The current task uuid.
 * @param {Map} params.cellColors
 * @param {ArrayBuffer} params.data The array buffer.
 * Need to transfer back to main thread when done.
 * @returns {array} [message, transfers]
 */
function getColors({
  curr,
  cellColors,
  data,
}) {
  // TODO: always fill the entire array with the default color,
  // to clear any previous color settings.
  const { size } = cellColors;
  if (typeof size === 'number') {
    const cellIds = cellColors.keys();
    const view = new Uint8Array(data);
    /*
    // TODO: do this in the main thread.
    data = new Uint8Array(color.height * color.width * 3).fill(
      defaultColor[0],
    );
    */
    // 0th cell id is the empty space of the image i.e black color.
    view[0] = 0;
    view[1] = 0;
    view[2] = 0;
    // eslint-disable-next-line no-restricted-syntax
    for (const id of cellIds) {
      if (id > 0) {
        const cellColor = cellColors.get(id);
        if (cellColor) {
          view.set(cellColor.slice(0, 3), Number(id) * 3);
        }
      }
    }
  }
  return [{ buffer: data, curr }, [data]];
}

/**
 * Worker message passing logic.
 */
if (typeof self !== 'undefined') {
  const nameToFunction = {
    getColors,
  };

  self.addEventListener('message', (event) => {
    try {
      if (Array.isArray(event.data)) {
        const [name, args] = event.data;
        const [message, transfers] = nameToFunction[name](args);
        self.postMessage(message, transfers);
      }
    } catch (e) {
      console.warn(e);
    }
  });
}
