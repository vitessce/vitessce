import React from 'react';
import uuidv4 from 'uuid/v4';

import SpatialSubscriber from './SpatialSubscriber';
import CellTooltipSubscriber from '../cell-tooltip/CellTooltipSubscriber';

export default function HoverableSpatialSubscriber(props) {
  // Create a UUID so that hover events
  // know from which DeckGL element they were generated
  const uuid = uuidv4();
  return (
    <SpatialSubscriber {...props} uuid={uuid}>
      <CellTooltipSubscriber {...props} uuid={uuid} mapping="xy" />
    </SpatialSubscriber>
  );
}
