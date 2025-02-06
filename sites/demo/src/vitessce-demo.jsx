/* eslint-disable no-console */
import React, {
  useEffect, useRef, useState, useMemo,
} from 'react';
import { Vitessce } from 'vitessce';
import { DEFAULT_LOG_LEVEL, LogLevels } from '@vitessce/globals';
import { getConfig, listConfigs, getPlugins, getStores, getPage } from './api.js';
import { Welcome } from './welcome.jsx';
import { Warning } from './warning.jsx';

import './index.scss';

function AwaitResponse(props) {
  const {
    response,
    theme,
  } = props;
  const [isLoading, setIsLoading] = useState(true);
  const responseRef = useRef();
  useEffect(() => {
    response.then((c) => {
      responseRef.current = c;
      setIsLoading(false);
    });
  }, [response]);
  return (!isLoading ? React.createElement(responseRef.current) : <Warning title="Loading..." theme={theme} />);
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

function logConfigUpgrade(prevConfig, nextConfig) {
  // eslint-disable-next-line no-console
  console.log(`Upgrade view config schema from ${prevConfig.version} to ${nextConfig.version}`);
  // eslint-disable-next-line no-console
  console.log(prevConfig);
  // eslint-disable-next-line no-console
  console.log(nextConfig);
}

function checkResponse(response, theme, debug) {
  if (!response.ok) {
    return Promise.resolve(
      () => (
        <Warning
          title="Fetch response not OK"
          preformatted={preformattedDetails(response)}
          theme={theme}
        />
      ),
    );
  }
  return response.text().then((text) => {
    try {
      const config = JSON.parse(text);
      return Promise.resolve(() => (
        <Vitessce
          config={config}
          theme={theme}
          onConfigChange={debug ? console.log : undefined}
          onConfigUpgrade={debug ? logConfigUpgrade : undefined}
          validateOnConfigChange={debug}
        />
      ));
    } catch (e) {
      return Promise.resolve(() => (
        <Warning
          title="Error parsing JSON"
          preformatted={preformattedDetails(response)}
          unformatted={`${e.message}: ${text}`}
          theme={theme}
        />
      ));
    }
  });
}

/**
 * Use the theme provided if it is valid, otherwise fall back to the 'dark' theme.
 * @param {string} theme A potentially invalid theme name.
 * @returns {string} A valid theme name.
 */
function validateTheme(theme) {
  return (['light', 'dark', 'light2'].includes(theme) ? theme : 'dark');
}

/**
 * Use the debugMode provided if it is valid, otherwise fall back to the
 * 'all' representing surfacing all logs.
 * @param {string} debugMode A potentially invalid value.
 * @returns {string} A valid debugMode value.
 */
function validatedebugMode(debugMode) {
  console.log(debugMode, debugMode || String(debugMode).toLocaleLowerCase() === 'true');
  return (debugMode && String(debugMode).toLocaleLowerCase() === 'true');
}

function validateLogLevel(logLevel) {
  return Object.values(LogLevels).includes(logLevel) ? logLevel : DEFAULT_LOG_LEVEL;
}

export function VitessceDemo() {
  const result = useMemo(() => {
    const { rowHeight = null } = {};
    const urlParams = new URLSearchParams(window.location.search);
    const datasetId = urlParams.get('dataset');
    const debug = urlParams.get('debug') === 'true';
    const datasetUrl = urlParams.get('url');
    const showAll = urlParams.get('show') === 'all';
    const theme = validateTheme(urlParams.get('theme'));
    const isBounded = urlParams.get('isBounded') === 'true';
    const strictMode = urlParams.get('strictMode') === 'true';
    const pageMode = urlParams.get('pageMode') === 'true';
    const debugMode = validatedebugMode(urlParams.get('debugMode'));
    const logLevel = validateLogLevel(urlParams.get('logLevel'));

    const ContainerComponent = strictMode ? React.StrictMode : React.Fragment;

    if (datasetId) {
      const config = getConfig(datasetId);
      const pluginProps = getPlugins(datasetId);
      const stores = getStores(datasetId);
      const PageComponent = getPage(datasetId);
      return (
        <ContainerComponent>
          {!pageMode ? (
            <style>{`
            #root .vitessce-container {
              height: max(100%,100vh);
              width: 100%;
              overflow: hidden;
            }
            `}
            </style>
          ) : null}
          <Vitessce
            config={config}
            rowHeight={rowHeight}
            theme={theme}
            onConfigChange={debug ? console.log : undefined}
            onConfigUpgrade={debug ? logConfigUpgrade : undefined}
            validateOnConfigChange={debug}
            isBounded={isBounded}
            stores={stores}
            {...pluginProps}
            pageMode={pageMode}
            debugMode={debugMode}
            logLevel={logLevel}
          >
            {pageMode ? <PageComponent /> : null}
          </Vitessce>
        </ContainerComponent>
      );
    }
    if (datasetUrl) {
      const responsePromise = fetch(datasetUrl)
        .then(response => checkResponse(response, theme, debug))
        .catch(error => Promise.resolve(() => (
          <Warning
            title="Error fetching"
            unformatted={error.message}
            theme={theme}
          />
        )));
      return (
        <ContainerComponent>
          {!pageMode ? (
            <style>{`
            #root .vitessce-container {
              height: max(100%,100vh);
              width: 100%;
              overflow: hidden;
            }
            `}
            </style>
          ) : null}
          <AwaitResponse response={responsePromise} theme={theme} />
        </ContainerComponent>
      );
    }
    const configs = listConfigs(showAll);
    return (<Welcome configs={configs} theme={theme} />);
  }, [window.location.search]);
  return (
    <>
      <style>{`
      html, body {
        height: 100%;
      }
      body {
        display: flex;
        flex-direction: column;
      }
      #root {
        flex: 1;
      }
      #root .welcome-container {
        font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif;
        height: max(100%, 100vh);
        width: 100%;
        overflow: scroll;
        background-color: #333333;
      }
      `}
      </style>
      {result}
    </>
  );
}
