/* eslint-disable */
import React from 'react';
import uuidv4 from 'uuid/v4';

import HeatmapSubscriber from './HeatmapSubscriber';

export default function HoverableHeatmapSubscriber(props) {
  // Create a UUID so that hover events
  // know from which element they were generated.
  const uuid = uuidv4();

  // TODO: remove this component.

  return (
    <HeatmapSubscriber {...props} uuid={uuid} />
  );
}
