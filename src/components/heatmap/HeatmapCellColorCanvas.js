import React from 'react';

export default class HeatmapCellColorCanvas extends React.Component {
  shouldComponentUpdate(nextProps) {
    return !!nextProps.clusters && !!nextProps.cellColors;
  }

  componentDidUpdate() {
    const ctx = this.canvasRef.getContext('2d');

    const { clusters, cellColors } = this.props;
    const width = clusters.cols.length;
    const height = 1;

    const imageData = ctx.createImageData(width, height);
    clusters.cols.forEach((cellId, x) => {
      const offset = x * 4;
      const cellColor = cellColors[cellId];

      /* eslint-disable prefer-destructuring */
      imageData.data[offset + 0] = cellColor[0];
      imageData.data[offset + 1] = cellColor[1];
      imageData.data[offset + 2] = cellColor[2];
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
