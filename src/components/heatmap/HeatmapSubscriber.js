import React from 'react';
import GeneHeatmapSubscriber from './GeneHeatmapSubscriber';

/**
 * An alias for GeneHeatmapSubscriber.
 * Deprecated, instead use GeneHeatmapSubscriber or PeakHeatmapSubscriber explicitly.
 * @param {object} props
 */
export default function HeatmapSubscriber(props) {
  return (
    <GeneHeatmapSubscriber
      {...props}
    />
  );
}
