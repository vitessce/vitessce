import React from 'react';
import { interpolateColors } from '../utils';

import { setImageDataRGBA, getImageRendering, onHeatmapMouseMove } from './utils';

function hasRequiredProps(props) {
  return !!props.clusters;
}

function paintCanvas(canvasRef, props) {
  if (!canvasRef || !hasRequiredProps(props)) {
    return;
  }
  const ctx = canvasRef.getContext('2d');

  const { clusters } = props;
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

export default function HeatmapDataCanvas(props) {
  const { height } = props;
  let { clusters } = props;
  if (!clusters) {
    clusters = { rows: [], cols: [], matrix: [] };
  }
  const imageRendering = getImageRendering();
  return (
    <canvas
      className="heatmap"
      style={{
        top: '30%',
        height,
        imageRendering,
      }}
      ref={c => paintCanvas(c, props)}
      width={clusters.cols.length}
      height={clusters.rows.length}
      onMouseMove={event => onHeatmapMouseMove(event, props)}
    />
  );
}
