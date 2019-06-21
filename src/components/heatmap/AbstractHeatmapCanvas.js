import React from 'react';

import { makeCellStatusMessage } from '../utils';

export default class AbstractHeatmapCanvas extends React.Component {
  constructor(props) {
    super(props);
    this.onMouseMove = this.onMouseMove.bind(this);
  }

  onMouseMove(event) {
    const {
      cells,
      clusters,
      updateCellsHover = (hoverInfo) => {
        console.warn(`HeatmapCellSelectionCanvas updateCellsHover: ${hoverInfo.cellId}`);
      },
      updateStatus = (message) => {
        console.warn(`HeatmapCellSelectionCanvas updateStatus: ${message}`);
      },
    } = this.props;

    // Compute x position relative to the canvas.
    const rect = event.target.getBoundingClientRect();
    const pixelX = (event.clientX - rect.left);
    const { width } = rect;
    // Cell columns are not exactly equal to individual pixels,
    // so need to scale by number of cells.
    const colX = Math.round((pixelX / width) * clusters.cols.length);
    // Use the column x-coordinate too look up the cell ID.
    const cellId = clusters.cols[colX];
    if (cellId) {
      // Use the cell ID to look up the cell information object.
      const cellInfo = cells[cellId];
      updateCellsHover({
        cellId,
        mappings: { xy: cellInfo.xy, ...cellInfo.mappings },
        uuid: true,
        status: makeCellStatusMessage(cellInfo.factors),
      });
      updateStatus(makeCellStatusMessage(cellInfo.factors));
    }
  }
}
