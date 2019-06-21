import React from 'react';

import { setImageDataRGBA, getImageRendering } from './utils';
import { makeCellStatusMessage } from '../utils';

export default class HeatmapCellSelectionCanvas extends React.Component {
  constructor(props) {
    super(props);
    this.onMouseMove = this.onMouseMove.bind(this);
  }

  paintCanvas() {
    const ctx = this.canvasRef.getContext('2d');

    const { clusters, selectedCellIds } = this.props;
    const width = clusters.cols.length;
    const height = 1;

    const imageData = ctx.createImageData(width, height);
    clusters.cols.forEach((cellId, x) => {
      const offset = x * 4;
      const selected = selectedCellIds[cellId];
      setImageDataRGBA(imageData, offset, 128, 128, 128, selected ? 255 : 0);
    });
    ctx.putImageData(imageData, 0, 0);
  }

  hasRequiredProps(props) { // eslint-disable-line class-methods-use-this
    return !!props.clusters && !!props.selectedCellIds;
  }

  componentDidMount() {
    if (this.hasRequiredProps(this.props)) {
      this.paintCanvas();
    }
  }

  shouldComponentUpdate(nextProps) {
    return this.hasRequiredProps(nextProps);
  }

  componentDidUpdate() {
    this.paintCanvas();
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

  render() {
    const { height } = this.props;
    let { clusters } = this.props;
    if (!clusters) {
      clusters = { rows: [], cols: [], matrix: [] };
    }
    const imageRendering = getImageRendering();
    return (
      <canvas
        style={{ height, imageRendering }}
        ref={(c) => { this.canvasRef = c; }}
        width={clusters.cols.length}
        height={1}
        onMouseMove={this.onMouseMove}
      />
    );
  }
}
