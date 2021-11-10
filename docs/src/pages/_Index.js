import React, { useState, useEffect } from 'react';
import { QueryParamProvider, useQueryParam, StringParam, BooleanParam } from 'use-query-params';
import { useHashParam, useSetHashParams } from './_use-hash-param';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Home from './_Home';
import DemoHeader from './_DemoHeader';
import ThemedVitessce from './_ThemedVitessce';
import ViewConfigEditor from './_ViewConfigEditor';
import { baseJs, baseJson } from './_live-editor-examples';

import { configs } from '../../../src/demo/configs';

import styles from './styles.module.css';

function VitessceAppStyles() {
    return (
        <style>{`   
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
        `}</style>
    );
}

function IndexWithHashParams() {
  const setHashParams = useSetHashParams();
  const [demo, setDemo] = useHashParam('dataset', undefined, 'string');
  const [debug, setDebug] = useHashParam('debug', false, 'boolean');
  const [url, setUrl] = useHashParam('url', undefined, 'string');
  const [edit, setEdit] = useHashParam('edit', false, 'boolean');

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

  useEffect(() => {
      let unmounted = false;
      async function processParams() {
        if (url) {
          setLoading(true);
          try {
            const response = await fetch(url);
            if(unmounted) {
              return;
            }
            if(response.ok) {
              const responseText = await response.text();
              if(unmounted) {
                return;
              }
              if(edit) {
                // User wants to edit the URL-based config.
                try {
                  const responseJson = JSON.parse(responseText);
                  setPendingJson(JSON.stringify(responseJson, null, 2));
                } catch(e) {
                  // However, this may be an invalid JSON object
                  // so we can just let the user edit the unformatted string.
                  setPendingJson(responseText);
                }
                setError(null);
              } else {
                try {
                  const responseJson = JSON.parse(responseText);
                  setValidConfig(JSON.stringify(responseJson, null, 2));
                } catch(e) {
                  setError({
                    title: "Error parsing JSON",
                    message: "Error executing JSON.parse",
                  });
                }
              }
              setLoading(false);
            } else {
              setError({
                title: "Fetch response not OK",
                message: response.statusText,
              });
              setLoading(false);
              clearConfigs();
            }
          } catch(e) {
            setError({
              title: "Fetch error",
              message: e.message,
            });
            setLoading(false);
            clearConfigs();
          }
        } else if(demo && configs[demo]) {
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
      url: 'data:,' + encodeURIComponent(JSON.stringify(validConfig)),
      edit: true,
    });
  }

  function setUrlFromEditor(nextUrl) {
    setHashParams({
      url: nextUrl,
      edit: false,
    });
  }
  
  return (edit ? (
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
  ) : validConfig ? (
    <div>
      {demo && Object.keys(configs).includes(demo) ? (
        <DemoHeader
          demo={demo}
          config={configs[demo]}
        />
      ) : null}
      <main className="vitessce-app">
          <VitessceAppStyles />
          <ThemedVitessce
            validateOnConfigChange={debug}
            onConfigChange={debug ? console.log : undefined}
            config={validConfig}
          />
          <div className={styles.vitessceClear}>
            <button
              className={styles.vitessceClearButton}
              onClick={handleEdit}>
              Edit
            </button>
          </div>
      </main>
    </div>
  ) : (!loading ? (
    <Home />
  ) : null));
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
    if(hasQueryParams) {
      const params = (demo ? 'dataset=' + demo : 'url=' + url);
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
