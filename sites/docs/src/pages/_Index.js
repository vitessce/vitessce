/* eslint-disable no-nested-ternary */
/* eslint-disable no-console */
import React, { useState, useEffect } from 'react';
import {
  QueryParamProvider, useQueryParam, StringParam,
} from 'use-query-params';
import clsx from 'clsx';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { configs } from '@vitessce/example-configs';
import { useHashParam, useSetHashParams } from './_use-hash-param.js';
import Home from './_Home.js';
import DemoHeader from './_DemoHeader.js';
import ThemedVitessce from './_ThemedVitessce.js';
import ViewConfigEditor from './_ViewConfigEditor.js';
import { baseJs, baseJson } from './_live-editor-examples.js';


function logConfigUpgrade(prevConfig, nextConfig) {
  // eslint-disable-next-line no-console
  console.log(`Upgrade view config schema from ${prevConfig.version} to ${nextConfig.version}`);
  // eslint-disable-next-line no-console
  console.log(prevConfig);
  // eslint-disable-next-line no-console
  console.log(nextConfig);
}

function AppStyles(props) {
  const {
    dimNavbar = false,
  } = props;
  return (
    <style>{`
        .navbar__brand + a.navbar__item.navbar__link {
          color: var(--ifm-navbar-link-hover-color);
          text-decoration: none;
        }
        ${dimNavbar ? (`
        .footer {
          display: none;
        }
        .navbar__item {
          opacity: 0.2;
          transition: opacity 0.25s;
        }
        .navbar:hover .navbar__item {
          opacity: 1;
        }
        `) : ''}
      `}
    </style>
  );
}

function DemoStyles() {
  return (
    <style>{`
         .navbar__brand + a.navbar__item.navbar__link + a.navbar__item.navbar__link {
            color: var(--ifm-navbar-link-hover-color);
            text-decoration: none;
          }
      `}
    </style>
  );
}

function IndexWithHashParams() {
  const setHashParams = useSetHashParams();
  const [demo] = useHashParam('dataset', undefined, 'string');
  const [debug] = useHashParam('debug', false, 'boolean');
  const [url] = useHashParam('url', undefined, 'string');
  const [edit] = useHashParam('edit', false, 'boolean');

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [validConfig, setValidConfig] = useState(null);

  const [pendingJson, setPendingJson] = useState(baseJson);
  const [pendingJs, setPendingJs] = useState(baseJs);

  function clearConfigs() {
    setValidConfig(null);
    setPendingJson(baseJson);
    setPendingJs(baseJs);
  }

  const isDemo = demo && Object.keys(configs).includes(demo);
  // Initialize to collapsed if this is a demo.
  // Otherwise, initialize to expanded.
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setIsExpanded(!isDemo);
  }, [isDemo]);

  useEffect(() => {
    window.dispatchEvent(new Event('resize'));
  }, [isExpanded]);

  useEffect(() => {
    let unmounted = false;
    async function processParams() {
      if (url) {
        setLoading(true);
        try {
          const response = await fetch(url);
          if (unmounted) {
            return;
          }
          if (response.ok) {
            const responseText = await response.text();
            if (unmounted) {
              return;
            }
            if (edit) {
              // User wants to edit the URL-based config.
              try {
                const responseJson = JSON.parse(responseText);
                setPendingJson(JSON.stringify(responseJson, null, 2));
              } catch (e) {
                // However, this may be an invalid JSON object
                // so we can just let the user edit the unformatted string.
                setPendingJson(responseText);
              }
              setError(null);
            } else {
              try {
                const responseJson = JSON.parse(responseText);
                setValidConfig(responseJson);
              } catch (e) {
                setError({
                  title: 'Error parsing JSON',
                  message: 'Error executing JSON.parse',
                });
              }
            }
            setLoading(false);
          } else {
            setError({
              title: 'Fetch response not OK',
              message: response.statusText,
            });
            setLoading(false);
            clearConfigs();
          }
        } catch (e) {
          setError({
            title: 'Fetch error',
            message: e.message,
          });
          setLoading(false);
          clearConfigs();
        }
      } else if (demo && configs[demo]) {
        setValidConfig(configs[demo]);
        setPendingJson(JSON.stringify(configs[demo], null, 2));
        setError(null);
        setLoading(false);
      } else {
        setError(null);
        setLoading(false);
        clearConfigs();
      }
    }
    processParams();
    return () => {
      unmounted = true;
    };
  }, [edit, url, demo]);

  function handleEdit() {
    setHashParams({
      dataset: undefined,
      url: `data:,${encodeURIComponent(JSON.stringify(validConfig))}`,
      edit: true,
    });
  }

  function setUrlFromEditor(nextUrl) {
    setHashParams({
      dataset: undefined,
      url: nextUrl,
      edit: false,
    });
  }

  return (edit ? (
    <>
      <AppStyles />
      <ViewConfigEditor
        pendingJson={pendingJson}
        setPendingJson={setPendingJson}
        pendingJs={pendingJs}
        setPendingJs={setPendingJs}
        error={error}
        setError={setError}
        loading={loading}
        setLoading={setLoading}
        setUrl={setUrlFromEditor}
      />
    </>
  ) : validConfig ? (
    <div>
      {isDemo ? (
        <div className={clsx('demo-header', { 'vitessce-expanded': isExpanded })}>
          <DemoStyles />
          <DemoHeader
            demo={demo}
            config={configs[demo]}
          />
        </div>
      ) : (
        <AppStyles dimNavbar />
      )}
      <div className={clsx('vitessce-and-toolbar', { 'vitessce-expanded': isExpanded })}>
        <div className={clsx('vitessce-toolbar', { 'vitessce-expanded': isExpanded })}>
          <div className={clsx('vitessce-toolbar-buttons', { 'vitessce-expanded': isExpanded })}>
            {isDemo ? (
              <button
                type="button"
                onClick={() => setIsExpanded(prev => !prev)}
              >
                { isExpanded ? 'Collapse' : 'Expand' }
              </button>
            ) : null}
            <button
              type="button"
              onClick={handleEdit}
            >
              Edit
            </button>
          </div>
        </div>
        <main className={clsx('vitessce-app', { 'vitessce-expanded': isExpanded })}>
          <ThemedVitessce
            validateOnConfigChange={debug}
            onConfigChange={debug ? console.log : undefined}
            onConfigUpgrade={debug ? logConfigUpgrade : undefined}
            config={validConfig}
            handleEdit={handleEdit}
            height={isExpanded ? undefined : 800}
          />
        </main>
      </div>
    </div>
  ) : (!loading ? (
    <Home />
  ) : (
    <p>Loading...</p>
  )));
}

function IndexWithQueryParamRedirect() {
  // Determine whether query parameters were used.
  // If so, redirect to the hash parameter equivalent.
  // Reference: https://github.com/vitessce/vitessce/pull/810#discussion_r745842290
  const baseUrl = useBaseUrl('/#?');
  const [demo] = useQueryParam('dataset', StringParam);
  const [url] = useQueryParam('url', StringParam);

  useEffect(() => {
    const hasQueryParams = demo || url;
    if (hasQueryParams) {
      const params = (demo ? `dataset=${demo}` : `url=${url}`);
      window.location.href = baseUrl + params;
    }
  }, [baseUrl, demo, url]);

  return (<IndexWithHashParams />);
}

export default function Index() {
  return (
    <QueryParamProvider>
      <IndexWithQueryParamRedirect />
    </QueryParamProvider>
  );
}
