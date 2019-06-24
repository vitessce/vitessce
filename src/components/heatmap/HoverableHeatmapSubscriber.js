import React from 'react';
import uuidv4 from 'uuid/v4';

import HeatmapSubscriber from './HeatmapSubscriber';
import CellTooltip1DVerticalSubscriber from '../cell-tooltip/CellTooltip1DVerticalSubscriber';

export default function HoverableHeatmapSubscriber(props) {
  // Create a UUID so that hover events
  // know from which element they were generated.
  const uuid = uuidv4();
  return (
    <HeatmapSubscriber {...props} uuid={uuid}>
      <CellTooltip1DVerticalSubscriber {...props} uuid={uuid} />
    </HeatmapSubscriber>
  );
}
