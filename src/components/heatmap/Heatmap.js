import React from 'react';
import HeatmapDataCanvas from './HeatmapDataCanvas';
import HeatmapCellSelectionCanvas from './HeatmapCellSelectionCanvas';
import HeatmapCellColorCanvas from './HeatmapCellColorCanvas';

export default function Heatmap(props) {
  const {
    clusters, selectedCellIds, cellColors, clearPleaseWait,
  } = props;
  if (clearPleaseWait && clusters) {
    clearPleaseWait('clusters');
  }
  return (
    <React.Fragment>
      <HeatmapCellColorCanvas
        clusters={clusters}
        cellColors={cellColors}
        height="15%"
      />
      <HeatmapCellSelectionCanvas
        clusters={clusters}
        selectedCellIds={selectedCellIds}
        height="15%"
      />
      <HeatmapDataCanvas
        clusters={clusters}
        height="70%"
      />
    </React.Fragment>
  );
}
