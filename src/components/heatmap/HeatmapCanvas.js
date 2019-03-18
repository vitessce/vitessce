import React from 'react';

export default class HeatmapCanvas extends React.Component {
  componentDidMount() {
    this.updateCanvas();
  }

  updateCanvas() {
    const ctx = this.canvasRef.getContext('2d');
    ctx.fillRect(0, 0, 100, 100);
  }

  render() {
    return (
      <canvas
        ref={(c) => { this.canvasRef = c; }}
        width={300}
        height={300}
      />
    );
  }
}
