import React from 'react';

import { setImageDataRGBA, getImageRendering, onHeatmapMouseMove } from './utils';


function hasRequiredProps(props) {
  return !!props.clusters && !!props.cellColors;
}

function paintCanvas(canvasRef, props) {
  if (!canvasRef || !hasRequiredProps(props)) {
    return;
  }
  const ctx = canvasRef.getContext('2d');

  const { clusters, cellColors } = props;
  const width = clusters.cols.length;
  const height = 1;

  const imageData = ctx.createImageData(width, height);
  clusters.cols.forEach((cellId, x) => {
    const offset = x * 4;
    const cellColor = cellColors[cellId] || [0, 0, 0];
    setImageDataRGBA(imageData, offset, ...cellColor, 255);
  });
  ctx.putImageData(imageData, 0, 0);
}

export default function HeatmapCellColorCanvas(props) {
  const { height } = props;
  let { clusters } = props;
  if (!clusters) {
    clusters = { rows: [], cols: [], matrix: [] };
  }
  const imageRendering = getImageRendering();
  return (
    <canvas
      className="pixelated heatmap"
      style={{
        height,
        imageRendering,
      }}
      ref={c => paintCanvas(c, props)}
      width={clusters.cols.length}
      height={1}
      onMouseMove={e => onHeatmapMouseMove(e, props)}
    />
  );
}
