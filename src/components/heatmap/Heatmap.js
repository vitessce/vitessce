import React from 'react';
import HeatmapDataCanvas from './HeatmapDataCanvas';
import HeatmapSelectionCanvas from './HeatmapSelectionCanvas';

export default function Heatmap(props) {
  const { clusters } = props;
  return (
    <React.Fragment>
      <HeatmapSelectionCanvas clusters={clusters} style={{ height: '10%' }} />
      <HeatmapDataCanvas clusters={clusters} style={{ height: '90%' }} />
    </React.Fragment>
  );
}
