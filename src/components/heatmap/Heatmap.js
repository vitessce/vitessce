import React from 'react';
import HeatmapDataCanvas from './HeatmapDataCanvas';
import HeatmapCellSelectionCanvas from './HeatmapCellSelectionCanvas';
import HeatmapCellColorCanvas from './HeatmapCellColorCanvas';

export default function Heatmap(props) {
  const {
    cells,
    clusters,
    selectedCellIds,
    cellColors,
    clearPleaseWait,
    updateCellsHover = (hoverInfo) => {
      console.warn(`Heatmap updateCellsHover: ${hoverInfo.cellId}`);
    },
    updateStatus = (message) => {
      console.warn(`Heatmap updateStatus: ${message}`);
    },
  } = props;
  if (clearPleaseWait && clusters) {
    clearPleaseWait('clusters');
  }
  return (
    <React.Fragment>
      <HeatmapCellColorCanvas
        cells={cells}
        clusters={clusters}
        cellColors={cellColors}
        updateCellsHover={updateCellsHover}
        updateStatus={updateStatus}
        height="15%"
      />
      <HeatmapCellSelectionCanvas
        cells={cells}
        clusters={clusters}
        selectedCellIds={selectedCellIds}
        updateCellsHover={updateCellsHover}
        updateStatus={updateStatus}
        height="15%"
      />
      <HeatmapDataCanvas
        cells={cells}
        clusters={clusters}
        updateCellsHover={updateCellsHover}
        updateStatus={updateStatus}
        height="70%"
      />
    </React.Fragment>
  );
}
