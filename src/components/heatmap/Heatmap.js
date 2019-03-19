import React from 'react';
import HeatmapDataCanvas from './HeatmapDataCanvas';
import HeatmapCellSelectionCanvas from './HeatmapCellSelectionCanvas';
import HeatmapCellColorCanvas from './HeatmapCellColorCanvas';

export default function Heatmap(props) {
  const { clusters, selectedCellIds, cellColors } = props;
  return (
    <React.Fragment>
      <HeatmapCellSelectionCanvas
        clusters={clusters}
        selectedCellIds={selectedCellIds}
        style={{ height: '10%' }}
      />
      <div style={{ height: '5%' }} />
      <HeatmapCellColorCanvas
        clusters={clusters}
        cellColors={cellColors}
        style={{ height: '10%' }}
      />
      <div style={{ height: '5%' }} />
      <HeatmapDataCanvas
        clusters={clusters}
        style={{ height: '70%' }}
      />
    </React.Fragment>
  );
}
