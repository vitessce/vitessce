import React from 'react';

import { Responsive, WidthProvider } from 'react-grid-layout';

import { LayerManagerPublisher } from '../components/layermanager';
import { StatusSubscriber } from '../components/status';
import { ScatterplotSubscriber } from '../components/scatterplot';
import { HeatmapSubscriber } from '../components/heatmap';
import { SpatialSubscriber } from '../components/spatial';
import { GenesSubscriber } from '../components/genes';
import { FactorsSubscriber } from '../components/factors';

import TitleInfo from '../components/TitleInfo';

import { makeGridLayout, range, getMaxRows } from './layoutUtils';


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

export function resolveLayout(layout) {
  const cols = {};
  const layouts = {};
  const breakpoints = {};

  if ('layout' in layout) {
    Object.entries(layout.columns).forEach(
      ([width, columnXs]) => {
        cols[width] = columnXs[columnXs.length - 1];
        layouts[width] = makeGridLayout(columnXs, layout.layout);
        breakpoints[width] = width;
      },
    );
  } else {
    // static layout
    const id = 'ID';
    const columnCount = 12;
    cols[id] = columnCount;
    layouts[id] = makeGridLayout(range(columnCount + 1), layout);
    breakpoints[id] = 1000;
    // Default has different numbers of columns at different widths,
    // so we do need to override that to ensure the same number of columns,
    // regardless of window width.
  }
  return { cols, layouts, breakpoints };
}

export function VitessceGrid(props) {
  const {
    layers, name, description, responsiveLayout, staticLayout,
  } = props;

  const ResponsiveGridLayout = WidthProvider(Responsive);

  const { cols, layouts, breakpoints } = resolveLayout(responsiveLayout || staticLayout);

  const maxRows = getMaxRows(layouts);

  const padding = 10;
  return (
    <React.Fragment>
      <LayerManagerPublisher layers={layers} />
      <ResponsiveGridLayout
        className="layout"
        cols={cols}
        layouts={layouts}
        breakpoints={breakpoints}
        rowHeight={window.innerHeight / maxRows - padding}
        containerPadding={[padding, padding]}
        draggableHandle=".title"
      >
        <div key="description"><Description description={`${name}: ${description}`} /></div>
        <div key="status"><StatusSubscriber /></div>
        <div key="scatterplot-tsne"><ScatterplotSubscriber /></div>
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
    <TitleInfo title="Data Set" isScroll>
      <p className="details">{description}</p>
    </TitleInfo>
  );
}
