import React from 'react';
import HeatmapDataCanvas from './HeatmapDataCanvas';
import HeatmapCellSelectionCanvas from './HeatmapCellSelectionCanvas';
import HeatmapCellColorCanvas from './HeatmapCellColorCanvas';

export default function Heatmap(props) {
  const {
    uuid,
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
    <div className="heatmap-container">
      <HeatmapCellColorCanvas
        uuid={uuid}
        cells={cells}
        clusters={clusters}
        cellColors={cellColors}
        updateCellsHover={updateCellsHover}
        updateStatus={updateStatus}
        height="15%"
      />
      <HeatmapCellSelectionCanvas
        uuid={uuid}
        cells={cells}
        clusters={clusters}
        selectedCellIds={selectedCellIds}
        updateCellsHover={updateCellsHover}
        updateStatus={updateStatus}
        height="15%"
      />
      <HeatmapDataCanvas
        uuid={uuid}
        cells={cells}
        clusters={clusters}
        updateCellsHover={updateCellsHover}
        updateStatus={updateStatus}
        height="70%"
      />
    </div>
  );
}
