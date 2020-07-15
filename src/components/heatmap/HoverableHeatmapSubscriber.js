/* eslint-disable */
import React from 'react';
import uuidv4 from 'uuid/v4';

import HeatmapSubscriber from './HeatmapSubscriber';
import HeatmapTooltipSubscriber from '../cell-tooltip/HeatmapTooltipSubscriber';

export default function HoverableHeatmapSubscriber(props) {
  // Create a UUID so that hover events
  // know from which element they were generated.
  const uuid = uuidv4();
  return (
    <HeatmapSubscriber {...props} uuid={uuid}>
      <HeatmapTooltipSubscriber {...props} uuid={uuid} />
    </HeatmapSubscriber>
  );
}
