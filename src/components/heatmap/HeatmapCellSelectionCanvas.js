import React from 'react';

import { setImageDataRGBA, getImageRendering, onHeatmapMouseMove } from './utils';

function hasRequiredProps(props) {
  return !!props.clusters && !!props.selectedCellIds;
}

function paintCanvas(canvasRef, props) {
  if (!canvasRef || !hasRequiredProps(props)) {
    return;
  }
  const ctx = canvasRef.getContext('2d');

  const { clusters, selectedCellIds } = props;
  const width = clusters.cols.length;
  const height = 1;

  const imageData = ctx.createImageData(width, height);
  clusters.cols.forEach((cellId, x) => {
    const offset = x * 4;
    const selected = selectedCellIds.has(cellId);
    setImageDataRGBA(imageData, offset, 128, 128, 128, selected ? 255 : 0);
  });
  ctx.putImageData(imageData, 0, 0);
}

export default function HeatmapCellSelectionCanvas(props) {
  const { height } = props;
  let { clusters } = props;
  if (!clusters) {
    clusters = { rows: [], cols: [], matrix: [] };
  }
  const imageRendering = getImageRendering();
  return (
    <canvas
      style={{ height, imageRendering }}
      ref={c => paintCanvas(c, props)}
      width={clusters.cols.length}
      height={1}
      onMouseMove={e => onHeatmapMouseMove(e, props)}
    />
  );
}
