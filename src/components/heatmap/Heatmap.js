import React from 'react';
import HeatmapCanvas from './HeatmapCanvas';

export default function Heatmap(props) {
  const { clusters } = props;
  return (
    <HeatmapCanvas clusters={clusters} />
  );
}
