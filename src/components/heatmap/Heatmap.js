import React from 'react';
import HeatmapDataCanvas from './HeatmapDataCanvas';
import HeatmapCellSelectionCanvas from './HeatmapCellSelectionCanvas';
import HeatmapCellColorCanvas from './HeatmapCellColorCanvas';

export default function Heatmap(props) {
  const { clusters, selectedCellIds, cellColors } = props;
  const canvasStyle = { height: '15%' };
  return (
    <React.Fragment>
      <HeatmapCellColorCanvas
        clusters={clusters}
        cellColors={cellColors}
        style={canvasStyle}
      />
      <HeatmapCellSelectionCanvas
        clusters={clusters}
        selectedCellIds={selectedCellIds}
        style={canvasStyle}
      />
      <HeatmapDataCanvas
        clusters={clusters}
        style={{ ...canvasStyle, height: '70%' }}
      />
    </React.Fragment>
  );
}
