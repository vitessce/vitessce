import React from 'react';

import TitleInfo from '../components/TitleInfo';
import StatusSubscriber from '../components/status/StatusSubscriber';
import ScatterplotSubscriber from '../components/scatterplot/ScatterplotSubscriber';
import SpatialSubscriber from '../components/spatial/SpatialSubscriber';
import FactorsSubscriber from '../components/factors/FactorsSubscriber';
import GenesSubscriber from '../components/genes/GenesSubscriber';
import CellSetsManagerSubscriber from '../components/user-defined-sets/CellSetsManagerSubscriber';
import HeatmapSubscriber from '../components/heatmap/HeatmapSubscriber';
import HoverableScatterplotSubscriber from '../components/scatterplot/HoverableScatterplotSubscriber';
import HoverableSpatialSubscriber from '../components/spatial/HoverableSpatialSubscriber';
import HoverableHeatmapSubscriber from '../components/heatmap/HoverableHeatmapSubscriber';

class Description extends React.Component {
  componentDidMount() {
    const { onReady } = this.props;
    onReady();
  }

  render() {
    const { description } = this.props;
    return (
      <TitleInfo title="Data Set" isScroll>
        <p className="details">{description}</p>
      </TitleInfo>
    );
  }
}

const registry = {
  Description,
  StatusSubscriber,
  ScatterplotSubscriber,
  SpatialSubscriber,
  FactorsSubscriber,
  GenesSubscriber,
  CellSetsManagerSubscriber,
  HeatmapSubscriber,
  HoverableScatterplotSubscriber,
  HoverableSpatialSubscriber,
  HoverableHeatmapSubscriber,
};

export default function getComponent(name) {
  return registry[name];
}
