import React from 'react';
import { interpolateViridis } from 'd3-scale-chromatic';

import { rgb } from '../utils';

export default class HeatmapSelectionCanvas extends React.Component {
  shouldComponentUpdate(nextProps) {
    return !!nextProps.clusters;
  }

  componentDidUpdate() {
    const ctx = this.canvasRef.getContext('2d');

    const { clusters } = this.props;
    const width = clusters.cols.length;
    const height = 1;

    const imageData = ctx.createImageData(width, height);
    const row = clusters.matrix[0];
    row.forEach((value, x) => {
      const offset = x * 4;
      // Math.sqrt is arbitrary, but I wanted to improve the contrast.
      const rgbTriple = rgb(interpolateViridis(Math.sqrt(value)));
      /* eslint-disable prefer-destructuring */
      imageData.data[offset + 0] = rgbTriple[0];
      imageData.data[offset + 1] = rgbTriple[1];
      imageData.data[offset + 2] = rgbTriple[2];
      /* eslint-enable */
      imageData.data[offset + 3] = 255;
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
          height={1}
        />
      </React.Fragment>
    );
  }
}
