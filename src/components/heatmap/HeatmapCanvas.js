import React from 'react';
import { interpolateViridis } from 'd3-scale-chromatic';

import { rgb } from '../utils';

export default class HeatmapCanvas extends React.Component {
  shouldComponentUpdate(nextProps) {
    return !!nextProps.clusters;
  }

  componentDidUpdate() {
    const ctx = this.canvasRef.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    const { clusters } = this.props;
    const width = clusters.cols.length;
    const height = clusters.rows.length;

    const imageData = ctx.createImageData(width, height);
    clusters.matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        const offset = (y * width + x) * 4;
        // Math.sqrt is arbitrary, but I wanted to improve the contrast.
        const rgbTriple = rgb(interpolateViridis(Math.sqrt(value)));
        /* eslint-disable prefer-destructuring */
        imageData.data[offset + 0] = rgbTriple[0];
        imageData.data[offset + 1] = rgbTriple[1];
        imageData.data[offset + 2] = rgbTriple[2];
        /* eslint-enable */
        imageData.data[offset + 3] = 255;
      });
    });
    ctx.putImageData(imageData, 0, 0);
  }

  render() {
    let { clusters } = this.props;
    if (!clusters) {
      clusters = { rows: [], cols: [] };
    }
    return (
      <canvas
        style={{ height: '100%' }}
        className="pixelated"
        ref={(c) => { this.canvasRef = c; }}
        width={clusters.cols.length}
        height={clusters.rows.length}
      />
    );
  }
}
