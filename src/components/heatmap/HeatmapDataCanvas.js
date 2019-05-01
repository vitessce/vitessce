import React from 'react';
import { interpolateColors } from '../utils';

import { setImageDataRGBA } from './utils';

export default class HeatmapDataCanvas extends React.Component {
  paintCanvas() {
    const ctx = this.canvasRef.getContext('2d');

    const { clusters } = this.props;
    const width = clusters.cols.length;
    const height = clusters.rows.length;

    const imageData = ctx.createImageData(width, height);
    clusters.matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        const offset = (y * width + x) * 4;
        const rgbTriple = interpolateColors(value);
        setImageDataRGBA(imageData, offset, ...rgbTriple, 255);
      });
    });
    ctx.putImageData(imageData, 0, 0);
  }

  hasRequiredProps(props) { // eslint-disable-line class-methods-use-this
    return !!props.clusters;
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
    return (
      <canvas
        className="pixelated"
        style={{ height, imageRendering: 'pixelated' }}
        ref={(c) => { this.canvasRef = c; }}
        width={clusters.cols.length}
        height={clusters.rows.length}
      />
    );
  }
}
