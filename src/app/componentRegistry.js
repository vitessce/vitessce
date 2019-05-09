import React from 'react';

import TitleInfo from '../components/TitleInfo';

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
  StatusSubscriber: React.lazy(() => import('../components/status/StatusSubscriber.js')),
  ScatterplotSubscriber: React.lazy(() => import('../components/scatterplot/ScatterplotSubscriber.js')),
  SpatialSubscriber: React.lazy(() => import('../components/spatial/SpatialSubscriber.js')),
  FactorsSubscriber: React.lazy(() => import('../components/factors/FactorsSubscriber.js')),
  GenesSubscriber: React.lazy(() => import('../components/genes/GenesSubscriber.js')),
  HeatmapSubscriber: React.lazy(() => import('../components/heatmap/HeatmapSubscriber.js')),
  HiGlassComponent: React.lazy(() => import('../external-components/StyledHiGlass.js')),
  HiGlassWrappedComponent: React.lazy(() => import('../external-components/WrappedStyledHiGlass.js')),
};

export function getComponent(name) {
  return registry[name];
}
