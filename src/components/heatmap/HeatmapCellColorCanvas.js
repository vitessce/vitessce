import React from 'react';

import { setImageDataRGBA, getImageRendering } from './utils';

export default class HeatmapCellColorCanvas extends React.Component {
  paintCanvas() {
    const ctx = this.canvasRef.getContext('2d');

    const { clusters, cellColors } = this.props;
    const width = clusters.cols.length;
    const height = 1;

    const imageData = ctx.createImageData(width, height);
    clusters.cols.forEach((cellId, x) => {
      const offset = x * 4;
      const cellColor = cellColors[cellId];
      setImageDataRGBA(imageData, offset, ...cellColor, 255);
    });
    ctx.putImageData(imageData, 0, 0);
  }

  hasRequiredProps(props) { // eslint-disable-line class-methods-use-this
    return !!props.clusters && !!props.cellColors;
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

  render() {
    const { height } = this.props;
    let { clusters } = this.props;
    if (!clusters) {
      clusters = { rows: [], cols: [], matrix: [] };
    }
    const imageRendering = getImageRendering();
    return (
      <canvas
        className="pixelated"
        style={{ height, imageRendering }}
        ref={(c) => { this.canvasRef = c; }}
        width={clusters.cols.length}
        height={1}
      />
    );
  }
}
