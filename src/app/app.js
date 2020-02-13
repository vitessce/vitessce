import React from 'react';
import ReactDOM from 'react-dom';
import Ajv from 'ajv';

import datasetSchema from '../schemas/dataset.schema.json';

import { LIGHT_CARD } from '../components/classNames';

import '../css/index.scss';
import '../../node_modules/react-grid-layout/css/styles.css';
import '../../node_modules/react-resizable/css/styles.css';

import Welcome from './Welcome';
import PubSubVitessceGrid from './PubSubVitessceGrid';

import { getConfig, listConfigs } from './api';
import getComponent from './componentRegistry';

function renderComponent(react, id) {
  ReactDOM.render(react, document.getElementById(id));
}

function Warning(props) {
  const { title, preformatted, unformatted } = props;
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className={LIGHT_CARD}>
            <h1>{title}</h1>
            <pre>{preformatted}</pre>
            <div>{unformatted}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function preformattedDetails(response) {
  return `
    ok: ${response.ok}
    status: ${response.status}
    statusText: ${response.statusText}
    redirected: ${response.redirected}
    type: ${response.type}
    url: ${response.url}`; // TODO: headers
}

export function validateAndRender(config, id, rowHeight) {
  if (!config) {
    // If the config value is undefined, show a warning message
    renderComponent(
      <Warning
        title="No such dataset"
        unformatted="The dataset configuration could not be found."
      />, id,
    );
    return;
  }
  // NOTE: Remove when this is available in UI.
  console.groupCollapsed('Vitessce view configuration');
  console.info(JSON.stringify(config, null, 2));
  console.groupEnd();
  const validate = new Ajv().compile(datasetSchema);
  const valid = validate(config);
  if (!valid) {
    const failureReason = JSON.stringify(validate.errors, null, 2);
    renderComponent(
      <Warning
        title="Config validation failed"
        preformatted={failureReason}
      />, id,
    );
    return;
  }
  renderComponent(
    <PubSubVitessceGrid
      config={config}
      getComponent={getComponent}
      rowHeight={rowHeight}
    />, id,
  );
}

function renderResponse(response, id) {
  if (!response.ok) {
    renderComponent(
      <Warning
        title="Fetch response not OK"
        preformatted={preformattedDetails(response)}
      />, id,
    );
  } else {
    response.text().then((text) => {
      try {
        const config = JSON.parse(text);
        validateAndRender(config, id);
      } catch (e) {
        renderComponent(
          <Warning
            title="Error parsing JSON"
            preformatted={preformattedDetails(response)}
            unformatted={`${e.message}: ${text}`}
          />, id,
        );
      }
    });
  }
}

export function renderApp(id, rowHeight = null) {
  const urlParams = new URLSearchParams(window.location.search);
  const datasetId = urlParams.get('dataset');
  const datasetUrl = urlParams.get('url');
  const showAll = urlParams.get('show') === 'all';

  if (datasetId) {
    const config = getConfig(datasetId);
    validateAndRender(config, id, rowHeight);
  } else if (datasetUrl) {
    fetch(datasetUrl)
      .then(response => renderResponse(response, id))
      .catch(error => renderComponent(
        <Warning
          title="Error fetching"
          unformatted={error.message}
        />, id,
      ));
  } else {
    const configs = listConfigs(showAll);
    renderComponent(<Welcome configs={configs} />, id);
  }
}
