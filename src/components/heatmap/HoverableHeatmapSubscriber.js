import React from 'react';
import uuidv4 from 'uuid/v4';

import HeatmapSubscriber from './HeatmapSubscriber';
import CellTooltipVerticalSubscriber from '../cell-tooltip/CellTooltipVerticalSubscriber';

export default function HoverableHeatmapSubscriber(props) {
  // Create a UUID so that hover events
  // know from which element they were generated.
  const uuid = uuidv4();
  return (
    <HeatmapSubscriber {...props} uuid={uuid}>
      <CellTooltipVerticalSubscriber {...props} uuid={uuid} />
    </HeatmapSubscriber>
  );
}
