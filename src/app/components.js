import React from 'react';

import { HiGlassComponent } from 'higlass';

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
  const components = {};
  const positions = {};

  (('layout' in layout) ? layout.layout : layout).forEach(
    (def) => {
      const id = `r${def.x}_c${def.y}`;
      components[id] = {
        component: def.component, props: def.props || {},
      };
      positions[id] = {
        id, x: def.x, y: def.y, w: def.w, h: def.h,
      };
    },
  );

  if ('layout' in layout) {
    Object.entries(layout.columns).forEach(
      ([width, columnXs]) => {
        cols[width] = columnXs[columnXs.length - 1];
        layouts[width] = makeGridLayout(columnXs, positions);
        breakpoints[width] = width;
      },
    );
  } else {
    // static layout
    const id = 'ID';
    const columnCount = 12;
    cols[id] = columnCount;
    layouts[id] = makeGridLayout(range(columnCount + 1), positions);
    breakpoints[id] = 1000;
    // Default has different numbers of columns at different widths,
    // so we do need to override that to ensure the same number of columns,
    // regardless of window width.
  }
  return {
    cols, layouts, breakpoints, components,
  };
}

function Description(props) {
  const { description } = props;
  return (
    <TitleInfo title="Data Set" isScroll>
      <p className="details">{description}</p>
    </TitleInfo>
  );
}

export function VitessceGrid(props) {
  const {
    layers, responsiveLayout, staticLayout,
  } = props;

  const ResponsiveGridLayout = WidthProvider(Responsive);

  const {
    cols, layouts, breakpoints, components,
  } = resolveLayout(responsiveLayout || staticLayout);

  // TODO: Try 'import *' instead? https://github.com/hms-dbmi/vitessce/issues/190
  const componentRegistry = {
    Description,
    StatusSubscriber,
    ScatterplotSubscriber,
    SpatialSubscriber,
    FactorsSubscriber,
    GenesSubscriber,
    HeatmapSubscriber,
    HiGlassComponent,
  };

  const layoutChildren = Object.entries(components).map(([k, v]) => {
    const Component = componentRegistry[v.component];
    const styleLinks = (v.stylesheets || []).map(url => <link rel="stylesheet" href={url} />);
    return (
      <div key={k}>
        {styleLinks}
        <Component {... v.props} />
      </div>
    );
  });

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
        {layoutChildren}
      </ResponsiveGridLayout>
    </React.Fragment>
  );
}
