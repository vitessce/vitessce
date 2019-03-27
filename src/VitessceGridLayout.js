import React from 'react';
import GridLayout from 'react-grid-layout';

import TitleInfo from './components/TitleInfo';

import { LayerManagerPublisher } from './components/layermanager';
import { StatusSubscriber } from './components/status';
import { TsneSubscriber } from './components/tsne';
import { HeatmapSubscriber } from './components/heatmap';
import { SpatialSubscriber } from './components/spatial';
import { GenesSubscriber } from './components/genes';
import { FactorsSubscriber } from './components/factors';

import { SCROLL_CARD } from './components/classNames';

export default function VitessceGridLayout() {
  // layout is an array of objects, see the demo for more complete usage
  const layout = [
    {
      i: 'description', x: 0, y: 0, w: 3, h: 3, static: true,
    },
    {
      i: 'status', x: 3, y: 0, w: 3, h: 3, static: true,
    },
    {
      i: 'tsne', x: 9, y: 0, w: 3, h: 3, static: true,
    },
    {
      i: 'heatmap', x: 0, y: 3, w: 3, h: 3, static: true,
    },
    {
      i: 'spatial', x: 3, y: 3, w: 3, h: 3, static: true,
    },
    {
      i: 'factors', x: 9, y: 3, w: 3, h: 3, static: true,
    },
    {
      i: 'genes', x: 0, y: 6, w: 3, h: 3, static: true,
    },
  ];
  return (
    <GridLayout className="layout" layout={layout} cols={12} rowHeight={30} width={1200}>
      <Description description={'${name}: ${description}'} key="description" />
      <StatusSubscriber key="status" />
      <TsneSubscriber key="tsne" />
      <HeatmapSubscriber key="heatmap" />
      <SpatialSubscriber key="spatial" />
      <FactorsSubscriber key="factors" />
      <GenesSubscriber key="genes" />
    </GridLayout>
  );
}

function Description(props) {
  const { description } = props;
  return (
    <React.Fragment>
      <TitleInfo title="Data Set" />
      <div className={SCROLL_CARD}>
        <p className="details">{description}</p>
      </div>
    </React.Fragment>
  );
}
