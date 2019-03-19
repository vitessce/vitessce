import React from 'react';
import { interpolateColors } from '../utils';

export default class HeatmapDataCanvas extends React.Component {
  shouldComponentUpdate(nextProps) {
    return !!nextProps.clusters;
  }

  componentDidUpdate() {
    const ctx = this.canvasRef.getContext('2d');

    const { clusters } = this.props;
    const width = clusters.cols.length;
    const height = clusters.rows.length;

    const imageData = ctx.createImageData(width, height);
    clusters.matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        const offset = (y * width + x) * 4;
        // Math.sqrt is arbitrary, but I wanted to improve the contrast.
        const rgbTriple = interpolateColors(Math.sqrt(value));
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
    const { style } = this.props;
    let { clusters } = this.props;
    if (!clusters) {
      clusters = { rows: [], cols: [], matrix: [] };
    }
    return (
      <React.Fragment>
        <canvas
          className="pixelated"
          style={style}
          ref={(c) => { this.canvasRef = c; }}
          width={clusters.cols.length}
          height={clusters.rows.length}
        />
      </React.Fragment>
    );
  }
}
