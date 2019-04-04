import React from 'react';
import ReactDOM from 'react-dom';
import { Responsive, WidthProvider } from 'react-grid-layout';

import { LayerManagerPublisher } from './components/layermanager';
import { StatusSubscriber } from './components/status';
import { TsneSubscriber } from './components/tsne';
import { HeatmapSubscriber } from './components/heatmap';
import { SpatialSubscriber } from './components/spatial';
import { GenesSubscriber } from './components/genes';
import { FactorsSubscriber } from './components/factors';

import './css/index.css';
import '../node_modules/react-grid-layout/css/styles.css';
import '../node_modules/react-resizable/css/styles.css';

import { SCROLL_CARD, LIGHT_CARD } from './components/classNames';
import TitleInfo from './components/TitleInfo';

import { makeGridLayout } from './layoutUtils';
import { listConfig, getConfig } from './api';

function renderComponent(react, id) {
  ReactDOM.render(react, document.getElementById(id));
}

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

function renderWelcome(id) {
  document.getElementById(id).innerHTML = `
    <div class="container-fluid d-flex flex-column align-items-end">
      <div class="${LIGHT_CARD}" style="width: 100%; max-width: 330px; margin: auto;" >
        <form method="GET">
          <h1>🚄  Vitessce</h1>
          <div>
            <p>
              This is a demo of key concepts for a visual integration tool for exploration
              of (spatial) single-cell experiment data.
              This demo focusses on scalable, linked visualizations that support both
              spatial and non-spatial representation of cell-level and molecule-level data.
            </p>
            Select a data set below:
          </div>
          <div class="py-2" id="dataset-list"></div>
        </form>
      </div>
      <div class="${LIGHT_CARD}" style="width: 100%;">
        <p>
          Vitessce is supported by the NIH Common Fund, through the
          <a href="https://commonfund.nih.gov/HuBMAP">Human BioMolecular Atlas Program (HuBMAP)</a>,
          Integration, Visualization & Engagement (HIVE) Initiative,
          RFA-RM-18-001.
        </p>
      </div>
    </div>
  `;
  renderComponent(<DatasetList configs={listConfig()} />, 'dataset-list');
}

function VitessceGrid(props) {
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

export default function renderApp(id) {
  const datasetId = new URLSearchParams(window.location.search).get('dataset');
  if (datasetId) {
    const config = getConfig(datasetId);
    renderComponent(<VitessceGrid {...config} />, id);
  } else {
    renderWelcome(id);
  }
}
