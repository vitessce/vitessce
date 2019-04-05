import React from 'react';

import { Responsive, WidthProvider } from 'react-grid-layout';

import { LayerManagerPublisher } from '../components/layermanager';
import { StatusSubscriber } from '../components/status';
import { TsneSubscriber } from '../components/tsne';
import { HeatmapSubscriber } from '../components/heatmap';
import { SpatialSubscriber } from '../components/spatial';
import { GenesSubscriber } from '../components/genes';
import { FactorsSubscriber } from '../components/factors';

import { SCROLL_CARD } from '../components/classNames';

import TitleInfo from '../components/TitleInfo';

import { makeGridLayout } from './layoutUtils';


export function DatasetList(props) {
  const { configs } = props;
  const links = configs.map(
    ({ id, name, description }) => (
      <a
        href={`?dataset=${id}`}
        className="list-group-item list-group-item-action flex-column align-items-start bg-black"
        key={id}
      >
        <div className="d-flex w-100 justify-content-between">
          <h5>{name}</h5>
        </div>
        <p>{description}</p>
      </a>
    ),
  );
  return (
    <div className="list-group">
      {links}
    </div>
  );
}

export function VitessceGrid(props) {
  const {
    layers, views, name, description, columnLayout, gridLayout,
  } = props;

  const ResponsiveGridLayout = WidthProvider(Responsive);

  const cols = {};
  const layouts = {};
  const breakpoints = {};

  if (columnLayout) {
    Object.entries(columnLayout.columns).forEach(
      ([width, columnXs]) => {
        cols[width] = columnXs[columnXs.length - 1];
        layouts[width] = makeGridLayout(columnXs, columnLayout.layout);
        breakpoints[width] = width;
      },
    );
  } else {
    const id = 'ID';
    cols[id] = 12;
    layouts[id] = gridLayout;
    breakpoints[id] = 1000; // Arbitrary
  }

  const maxY = Math.max(
    ...Object.values(layouts).map(
      layout => Math.max(
        ...layout.map(xywh => xywh.y + xywh.h),
      ),
    ),
  );

  const padding = 10;
  return (
    <React.Fragment>
      <LayerManagerPublisher layers={layers} />
      <ResponsiveGridLayout
        className="layout"
        cols={cols}
        layouts={layouts}
        breakpoints={breakpoints}
        rowHeight={window.innerHeight / maxY - padding}
        containerPadding={[padding, padding]}
        draggableHandle=".title"
      >
        <div key="description"><Description description={`${name}: ${description}`} /></div>
        <div key="status"><StatusSubscriber /></div>
        <div key="tsne"><TsneSubscriber /></div>
        <div key="spatial"><SpatialSubscriber view={views.spatial} /></div>
        <div key="factors"><FactorsSubscriber /></div>
        <div key="genes"><GenesSubscriber /></div>
        <div key="heatmap"><HeatmapSubscriber /></div>
      </ResponsiveGridLayout>
    </React.Fragment>
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
