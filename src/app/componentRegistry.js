import React from 'react';

import TitleInfo from '../components/TitleInfo';
import StatusSubscriber from '../components/status/StatusSubscriber';
import ScatterplotSubscriber from '../components/scatterplot/ScatterplotSubscriber';
import SpatialSubscriber from '../components/spatial/SpatialSubscriber';
import FactorsSubscriber from '../components/factors/FactorsSubscriber';
import GenesSubscriber from '../components/genes/GenesSubscriber';
import HeatmapSubscriber from '../components/heatmap/HeatmapSubscriber';

function Description(props) {
  const { description } = props;
  return (
    <TitleInfo title="Data Set" isScroll>
      <p className="details">{description}</p>
    </TitleInfo>
  );
}

const registry = {
  Description,
  StatusSubscriber,
  ScatterplotSubscriber,
  SpatialSubscriber,
  FactorsSubscriber,
  GenesSubscriber,
  HeatmapSubscriber,
  HiGlassComponent: React.lazy(() => import('../vendor/StyledHiGlass.js')),
  HiGlassWrappedComponent: React.lazy(() => import('../vendor/WrappedStyledHiGlass.js')),
  // TODO: Our Higlass demos don't actually need any data layers to load...
  // but when they do, we'll need to resolve https://github.com/hms-dbmi/vitessce/issues/197
};

export function getComponent(name) {
  return registry[name];
}
