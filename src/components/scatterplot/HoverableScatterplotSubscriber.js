import React from 'react';
import uuidv4 from 'uuid/v4';

import ScatterplotSubscriber from './ScatterplotSubscriber';
import CellTooltipSubscriber from '../cell-tooltip/CellTooltipSubscriber';

export default function HoverableScatterplotSubscriber(props) {
  // Create a UUID so that hover events
  // know from which DeckGL element they were generated
  const uuid = uuidv4();
  return (
    <ScatterplotSubscriber {...props} uuid={uuid}>
      <CellTooltipSubscriber {...props} uuid={uuid} />
    </ScatterplotSubscriber>
  );
}
