import React from 'react';
import HeatmapDataCanvas from './HeatmapDataCanvas';
import HeatmapCellSelectionCanvas from './HeatmapCellSelectionCanvas';
import HeatmapCellColorCanvas from './HeatmapCellColorCanvas';

export default function Heatmap(props) {
  const { clusters, selectedCellIds, cellColors } = props;
  const canvasStyle = { height: '10%', outline: 'lightgrey 1px solid' };
  const spacerStyle = { height: '5%' };
  return (
    <React.Fragment>
      <HeatmapCellSelectionCanvas
        clusters={clusters}
        selectedCellIds={selectedCellIds}
        style={canvasStyle}
      />
      <div style={spacerStyle} />
      <HeatmapCellColorCanvas
        clusters={clusters}
        cellColors={cellColors}
        style={canvasStyle}
      />
      <div style={spacerStyle} />
      <HeatmapDataCanvas
        clusters={clusters}
        style={{ ...canvasStyle, height: '70%' }}
      />
    </React.Fragment>
  );
}
