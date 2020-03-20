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
  const {
    title,
    preformatted,
    unformatted,
    theme,
  } = props;
  return (
    <div className={`vitessce-container vitessce-theme-${theme}`}>
      <div className="warning-layout container-fluid">
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

export function validateAndRender(config, id, rowHeight, theme) {
  if (!config) {
    // If the config value is undefined, show a warning message
    renderComponent(
      <Warning
        title="No such dataset"
        unformatted="The dataset configuration could not be found."
        theme={theme}
      />, id,
    );
    return;
  }
  // NOTE: Remove when this is available in UI.
  console.groupCollapsed('🚄 Vitessce view configuration');
  console.info(`data:,${JSON.stringify(config)}`);
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
        theme={theme}
      />, id,
    );
    return;
  }
  renderComponent(
    <PubSubVitessceGrid
      config={config}
      getComponent={getComponent}
      rowHeight={rowHeight}
      theme={theme}
    />, id,
  );
}

function renderResponse(response, id, theme) {
  if (!response.ok) {
    renderComponent(
      <Warning
        title="Fetch response not OK"
        preformatted={preformattedDetails(response)}
        theme={theme}
      />, id,
    );
  } else {
    response.text().then((text) => {
      try {
        const config = JSON.parse(text);
        validateAndRender(config, id, undefined, theme);
      } catch (e) {
        renderComponent(
          <Warning
            title="Error parsing JSON"
            preformatted={preformattedDetails(response)}
            unformatted={`${e.message}: ${text}`}
            theme={theme}
          />, id,
        );
      }
    });
  }
}

/**
 * Use the theme provided if it is valid, otherwise fall back to the 'dark' theme.
 * @param {string} theme A potentially invalid theme name.
 * @returns {string} A valid theme name.
 */
function validateTheme(theme) {
  return (['light', 'dark'].includes(theme) ? theme : 'dark');
}

export function renderApp(id, rowHeight = null) {
  const urlParams = new URLSearchParams(window.location.search);
  const datasetId = urlParams.get('dataset');
  const datasetUrl = urlParams.get('url');
  const showAll = urlParams.get('show') === 'all';
  const theme = validateTheme(urlParams.get('theme'));

  if (datasetId) {
    const config = getConfig(datasetId);
    validateAndRender(config, id, rowHeight, theme);
  } else if (datasetUrl) {
    fetch(datasetUrl)
      .then(response => renderResponse(response, id, theme))
      .catch(error => renderComponent(
        <Warning
          title="Error fetching"
          unformatted={error.message}
          theme={theme}
        />, id,
      ));
  } else {
    const configs = listConfigs(showAll);
    renderComponent(<Welcome configs={configs} theme={theme} />, id);
  }
}
