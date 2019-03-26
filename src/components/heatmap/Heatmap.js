import React from 'react';
import HeatmapDataCanvas from './HeatmapDataCanvas';
import HeatmapCellSelectionCanvas from './HeatmapCellSelectionCanvas';
import HeatmapCellColorCanvas from './HeatmapCellColorCanvas';

export default function Heatmap(props) {
  const { clusters, selectedCellIds, cellColors } = props;
  const defaultStyle = { outline: 'lightgrey 1px solid' };
  return (
    <React.Fragment>
      <HeatmapCellSelectionCanvas
        clusters={clusters}
        selectedCellIds={selectedCellIds}
        style={{ height: '10%', ...defaultStyle }}
      />
      <div style={{ height: '5%' }} />
      <HeatmapCellColorCanvas
        clusters={clusters}
        cellColors={cellColors}
        style={{ height: '10%', ...defaultStyle }}
      />
      <div style={{ height: '5%' }} />
      <HeatmapDataCanvas
        clusters={clusters}
        style={{ height: '70%', ...defaultStyle }}
      />
    </React.Fragment>
  );
}
