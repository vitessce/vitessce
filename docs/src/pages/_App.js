import React, { useCallback, useEffect, useState, useReducer } from 'react';
import { useQueryParam, StringParam, BooleanParam, QueryParamProvider } from 'use-query-params';
import Layout from '@theme/Layout';
import useThemeContext from '@theme/hooks/useThemeContext';
import { useDropzone } from 'react-dropzone';
import { ControlledEditor } from '@monaco-editor/react';
import { Vitessce } from '../../../dist/umd/production/index.min.js';
import styles from './styles.module.scss';
import '../../../dist/umd/production/static/css/index.css';

const baseConfig = `{
  "version": "1.0.0",
  "name": "My config",
  "description": "",
  "datasets": [
    {
      "uid": "D1",
      "name": "Dries",
      "files": [
        {
          "url": "https://s3.amazonaws.com/vitessce-data/0.0.31/master_release/dries/dries.cells.json",
          "type": "cells",
          "fileType": "cells.json"
        },
        {
          "url": "https://s3.amazonaws.com/vitessce-data/0.0.31/master_release/dries/dries.cell-sets.json",
          "type": "cell-sets",
          "fileType": "cell-sets.json"
        }
      ]
    }
  ],
  "coordinationSpace": {
    "dataset": {
      "A": "D1"
    },
    "embeddingType": {
      "A": "UMAP",
      "B": "t-SNE"
    },
    "embeddingZoom": {
      "A": 2.5
    }
  },
  "layout": [
    {
      "component": "scatterplot",
      "coordinationScopes": {
        "dataset": "A",
        "embeddingType": "A",
        "embeddingZoom": "A"
      },
      "x": 6,
      "y": 0,
      "w": 6,
      "h": 6
    },
    {
      "component": "scatterplot",
      "coordinationScopes": {
        "dataset": "A",
        "embeddingType": "B",
        "embeddingZoom": "A"
      },
      "x": 0,
      "y": 0,
      "w": 6,
      "h": 6
    },
    {
      "component": "cellSets",
      "coordinationScopes": {
        "dataset": "A"
      },
      "x": 0,
      "y": 6,
      "w": 6,
      "h": 6
    },
    {
      "component": "cellSetSizes",
      "coordinationScopes": {
        "dataset": "A"
      },
      "x": 6,
      "y": 6,
      "w": 6,
      "h": 6
    }
  ],
  "initStrategy": "auto"
}`;

function ThemedControlledEditor(props) {
  const { isDarkTheme } = useThemeContext();
  return <ControlledEditor
    {...props}
    theme={(isDarkTheme ? "dark" : "GitHub")}
  />
}

function ThemedVitessce(props) {
    const { isDarkTheme } = useThemeContext();
    return (
        <Vitessce
            theme={isDarkTheme ? "dark" : "light"}
            {...props}
        />
    );
}

function App() {
  const [debug, setDebug] = useQueryParam('debug', BooleanParam);
  const [url, setUrl] = useQueryParam('url', StringParam);
  const [edit, setEdit] = useQueryParam('edit', BooleanParam);
  const [i, increment] = useReducer(v => v+1, 1);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [validConfig, setValidConfig] = useState(null);
  
  const [pendingConfig, setPendingConfig] = useState(baseConfig);
  const [pendingUrl, setPendingUrl] = useState('');
  const [pendingFileContents, setPendingFileContents] = useState('');

  const onDrop = useCallback(acceptedFiles => {
    if(acceptedFiles.length === 1) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        const { result } = reader;
        setPendingFileContents(result);
      });
      reader.readAsText(acceptedFiles[0]);
    }
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, maxFiles: 1});

  useEffect(() => {
    async function processParams() {
      if (url) {
        setLoading(true);
        try {
          const response = await fetch(url);
          if(response.ok) {
            const responseText = await response.text();
            if(edit) {
              // User wants to edit the URL-based config.
              try {
                // Ideally, this is valid JSON and we can
                // use JSON.stringify to add nice indentation.
                const responseJson = JSON.parse(responseText);
                setPendingConfig(JSON.stringify(responseJson, null, 2));
                setValidConfig(null);
              } catch(e) {
                // However, this may be an invalid JSON object
                // so we can just let the user edit the unformatted string.
                setPendingConfig(responseText);
                setValidConfig(null);
              }
              setError(null);
            } else {
              try {
                const responseJson = JSON.parse(responseText);
                // TODO: validate here.
                setPendingConfig(responseJson);
                setValidConfig(responseJson);
                setError(null);
              } catch(e) {
                setError({
                  title: "Error parsing JSON",
                  message: e.message,
                });
                setPendingConfig(responseText);
                setValidConfig(null);
              }
            }
            setLoading(false);
          } else {
            setError({
              title: "Fetch response not OK",
              message: response.statusText,
            });
            setLoading(false);
            setPendingConfig('{}');
            setValidConfig(null);
          }
        } catch(e) {
          setError({
            title: "Fetch error",
            message: e.message,
          });
          setLoading(false);
          setPendingConfig('{}');
          setValidConfig(null);
        }
      } else {
        setPendingConfig(baseConfig);
        setValidConfig(null);
        setError(null);
        setLoading(false);
      }
    }
    processParams();
  }, [url, edit]);

  function handleEditorGo() {
    setEdit(false, 'pushIn');
    setUrl('data:,' + encodeURIComponent(pendingConfig), 'replace');
    increment();
  }

  function handleUrlGo() {
    setEdit(false, 'pushIn');
    setUrl(pendingUrl, 'replace');
    increment();
  }

  function handleFileGo() {
    setEdit(false, 'pushIn');
    setUrl('data:,' + encodeURIComponent(pendingFileContents), 'replace');
    increment();
  }

  function handleClear() {
    setEdit(true, 'pushIn');
    increment();
  }

  function handleUrlChange(event) {
    setPendingUrl(event.target.value);
  }

  return (
    <Layout
      noFooter
      title="App"
      description="Use Vitessce with a custom configuration.">
      {loading ? (
        <pre>Loading...</pre>
      ) : (!validConfig ? (
        <main>
          {error && <pre className={styles.vitessceAppLoadError}>{JSON.stringify(error)}</pre>}
          <div {...getRootProps()} className={styles.dropzone}>
            <input {...getInputProps()} className={styles.dropzoneInfo} />
            {isDragActive ?
              <p>Drop the file here ...</p> :
              (pendingFileContents ? (
                <p>Successfully read the file.</p>
              ) : (
              <p>Drag &amp; drop a view config as a JSON file</p>
              )
            )}
          </div>
          <button className={styles.viewConfigGo} onClick={handleFileGo}>Load from File</button>
          <div className={styles.dropzoneOr}>OR</div>
          <div>
            <input
              type="text"
              className={styles.viewConfigUrlInput}
              placeholder="Specify the URL to a view config JSON file"
              value={pendingUrl}
              onChange={handleUrlChange}
            />
            <button className={styles.viewConfigGo} onClick={handleUrlGo}>Load from URL</button>
          </div>
          <div className={styles.dropzoneOr}>OR</div>
          <div className={styles.viewConfigEditor}>
            <p className={styles.viewConfigEditorInfo}>Use the JSON view config editor below</p>
            <ThemedControlledEditor
              value={pendingConfig}
              onChange={(event, value) => setPendingConfig(value)}
              height="50vh"
              language="json"
              options={{
                fontSize: 14,
                minimap: {
                  enabled: false,
                },
                contextmenu: false,
              }}
            />
          </div>
          <div className={styles.viewConfigEditorFooter}>
            <button className={styles.viewConfigGo} onClick={handleEditorGo}>Load from editor</button>
          </div>
        </main>
      ) : (
        <main className={'vitessce-app'}>
          <ThemedVitessce
            validateOnConfigChange={debug}
            config={validConfig}
          />
          <div className={styles.vitessceClear}>
            <button
              className={styles.vitessceClearButton}
              onClick={handleClear}
            >
              Edit
            </button>
          </div>
        </main>
      ))}
    </Layout>
  );
}

function WrappedApp() {
  return(
    <QueryParamProvider>
        <App/>
    </QueryParamProvider>
  );
}

export default WrappedApp;
