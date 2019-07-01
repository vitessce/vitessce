import { makeCellStatusMessage } from '../utils';

export function setImageDataRGBA(imageData, offset, r, g, b, a) {
  /* eslint-disable no-param-reassign */
  imageData.data[offset + 0] = r;
  imageData.data[offset + 1] = g;
  imageData.data[offset + 2] = b;
  imageData.data[offset + 3] = a;
  /* eslint-enable */
}

export function getImageRendering() {
  return /Chrome/.test(navigator.userAgent) ? 'pixelated' : 'crisp-edges';
}

export function onHeatmapMouseMove(event, props, considerGenes) {
  const {
    uuid,
    cells,
    clusters,
    updateCellsHover = (hoverInfo) => {
      console.warn(`onHeatmapMouseMove updateCellsHover: ${hoverInfo}`);
    },
    updateStatus = (message) => {
      console.warn(`onHeatmapMouseMove updateStatus: ${message}`);
    },
    updateGenesHover = (message) => {
      console.warn(`onHeatmapMouseMove updateGenesHover: ${message}`);
    },
  } = props;
  // Compute x position relative to the canvas.
  const rect = event.target.getBoundingClientRect();
  const pixelX = (event.clientX - rect.left);
  const { width } = rect;
  // Cell columns are not exactly equal to individual pixels,
  // so need to scale by number of cells.
  const colX = Math.floor((pixelX / width) * clusters.cols.length);
  // Use the column x-coordinate to look up the cell ID.
  const cellId = clusters.cols[colX];
  if (cellId) {
    // Use the cell ID to look up the cell information object.
    const cellInfo = cells[cellId];
    updateCellsHover({
      cellId,
      mappings: { xy: cellInfo.xy, ...cellInfo.mappings },
      uuid,
      factors: cellInfo.factors,
    });
    updateStatus(makeCellStatusMessage(cellInfo.factors));
  }

  // Compute y position to get gene ID if mouse is moving in HeatmapDataCanvas.
  if (considerGenes) {
    const { height } = rect;
    const pixelY = (event.clientY - rect.top);
    const colY = Math.floor((pixelY / height) * clusters.rows.length);
    const geneId = clusters.rows[colY];
    updateGenesHover({ geneId });
  }
}


export function onHeatmapMouseLeave(event, props) {
  const {
    updateCellsHover = (hoverInfo) => {
      console.warn(`onHeatmapMouseLeave updateCellsHover: ${hoverInfo}`);
    },
    updateGenesHover = (message) => {
      console.warn(`onHeatmapMouseLeave updateGenesHover: ${message}`);
    },
  } = props;
  updateCellsHover(null);
  updateGenesHover(null);
}
