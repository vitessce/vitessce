import React from 'react';
import ReactDOM from 'react-dom';
import VitessceGrid from 'vitessce-grid';

import '../css/index.css';
import '../../node_modules/react-grid-layout/css/styles.css';
import '../../node_modules/react-resizable/css/styles.css';

import { DatasetList } from './components';
import { LayerManagerPublisher } from '../components/layermanager';

import { LIGHT_CARD } from '../components/classNames';

import { listConfig, getConfig } from './api';
import getComponent from './componentRegistry';

function renderComponent(react, id) {
  ReactDOM.render(react, document.getElementById(id));
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

export default function renderApp(id) {
  const datasetId = new URLSearchParams(window.location.search).get('dataset');
  if (datasetId) {
    const config = getConfig(datasetId);
    renderComponent(
      <React.Fragment>
        <LayerManagerPublisher layers={config.layers} />
        <VitessceGrid
          layout={config.responsiveLayout}
          getComponent={getComponent}
        />,
      </React.Fragment>,
      id,
    );
  } else {
    renderWelcome(id);
  }
}
