import React from 'react';

export default class HeatmapCanvas extends React.Component {
  shouldComponentUpdate(nextProps) {
    return !!nextProps.clusters;
  }

  componentDidUpdate() {
    const ctx = this.canvasRef.getContext('2d');
    ctx.fillStyle = 'green';
    ctx.fillRect(0, 0, 4839, 33);
    ctx.fillStyle = 'red';
    ctx.fillRect(100, 10, 4639, 13);
  }

  render() {
    let { clusters } = this.props;
    if (!clusters) {
      clusters = { rows: [], cols: [] };
    }
    return (
      <canvas
        ref={(c) => { this.canvasRef = c; }}
        width={clusters.cols.length}
        height={clusters.rows.length}
      />
    );
  }
}
