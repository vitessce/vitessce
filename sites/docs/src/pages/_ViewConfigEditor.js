/* eslint-disable no-nested-ternary */
import React, { useCallback, useState, useEffect } from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { useDropzone } from 'react-dropzone';

import StudyIdInput from '../components/StudyIdInput.js';
import {
  VitessceConfig,
  generateConfig,
  getHintOptions,
  hconcat,
  vconcat,
  CoordinationLevel,
} from '@vitessce/config';
import {
  CoordinationType, ViewType, DataType, FileType,
} from '@vitessce/constants';
import { upgradeAndParse } from '@vitessce/schemas';
import {
  baseJs, baseJson, exampleJs, exampleJson,
} from './_live-editor-examples.js';
import { JSON_TRANSLATION_KEY } from './_editor-utils.js';
import JsonHighlight from './_JsonHighlight.js';
import styles from './styles.module.css';

const ID_LENGTH = 4;
// To simplify the JS editor, the user only needs to write
// the inner part of the createConfig() function,
// because this code will wrap the user's code to
// return a React component for react-live.
function transformCode(code) {
  return `function vitessceConfigEditor() {
    function createConfig() {
      ${code}
    }
    const vcJson = createConfig();
    return (
      <Highlight json={vcJson} />
    );
  }`;
}

const scope = {
  VitessceConfig,
  hconcat,
  vconcat,
  ViewType,
  DataType,
  FileType,
  CoordinationType,
  vt: ViewType,
  dt: DataType,
  ft: FileType,
  ct: CoordinationType,
  CoordinationLevel,
  CL: CoordinationLevel,
  Highlight: JsonHighlight,
};

export default function ViewConfigEditor(props) {
  console.log('view mounted')
  const {
    pendingJson,
    setPendingJson,
    pendingJs,
    setPendingJs,
    error,
    setError,
    loading,
    setUrl,
  } = props;

  const viewConfigDocsJsUrl = useBaseUrl('/docs/view-config-js/');
  const viewConfigDocsJsonUrl = useBaseUrl('/docs/view-config-json/');
  const defaultViewConfigDocsUrl = useBaseUrl('/docs/default-config-json');

  const [pendingUrl, setPendingUrl] = useState('');
  const [datasetUrls, setDatasetUrls] = useState('');
  const [pendingFileContents, setPendingFileContents] = useState('');
  const [generateConfigError, setGenerateConfigError] = useState(null);
  const [inputURL, setInputURL] = useState('');
  const [studyId, setStudyId] = useState(null);


  const [loadFrom, setLoadFrom] = useState('editor');

  const exampleURL = 'https://assets.hubmapconsortium.org/a4be39d9c1606130450a011d2f1feeff/ometiff-pyramids/processedMicroscopy/VAN0012-RK-102-167-PAS_IMS_images/VAN0012-RK-102-167-PAS_IMS-registered.ome.tif';


  function handleSetStudyId(id) {
    console.log('id', id);
    setStudyId(id);
  }

  function handleInputError(errMessage) {
    setError(errMessage)
  }

  function sanitiseURLs(urls) {
    return urls
      .split(/;/)
      .map(url => url.trim())
      .filter(url => url.match(/^http/g));
  }

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length === 1) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        const { result } = reader;
        setPendingFileContents(result);
        setLoadFrom('file');
      });
      reader.readAsText(acceptedFiles[0]);
    }
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, maxFiles: 1 });


  function validateConfig(nextConfig) {
    let upgradeSuccess;
    let failureReason;
    try {
      failureReason = upgradeAndParse(JSON.parse(nextConfig));
      upgradeSuccess = true;
    } catch (e) {
      upgradeSuccess = false;
      failureReason = e.message;
      console.error(e);
    }
    return [upgradeSuccess, failureReason];
  }

  async function handleEditorGo() {
    if(inputURL === '') {
      setError('No dataset URL is provided');
      return
    }
    let nextUrl;
    if (loadFrom === 'editor') {
      let nextConfig = pendingJson;
      nextUrl = `data:,${encodeURIComponent(nextConfig)}`;
      const [valid, failureReason] = validateConfig(nextConfig);
      if (!valid) {
        setError(failureReason);
        return;
      }
    } else if (loadFrom === 'url') {
      nextUrl = pendingUrl;
    } else if (loadFrom === 'file') {
      nextUrl = `data:,${encodeURIComponent(pendingFileContents)}`;
    }

    if(studyId && studyId !== '' && studyId.length === ID_LENGTH){
      await getLinkId();
      setUrl(nextUrl);
    }
    else {
      setError('Enter a valid Study Id')
    }
   
   
  }

  async function getLinkId() {
    console.log("linkId")
  }

  async function handleConfigGeneration(exampleURL) {
    setInputURL(exampleURL);
    setDatasetUrls(exampleURL);
    const sanitisedUrls = sanitiseURLs(exampleURL);
    if (sanitisedUrls.length === 0) {
      return;
    }
    setGenerateConfigError(null);
    setError(null);
    try {
      const configJson = await generateConfig(sanitisedUrls, 'Basic');
      setPendingJson(() => JSON.stringify(configJson, null, 2));
      setLoadFrom('editor');
    } catch (e) {
      setGenerateConfigError(e.message);
      throw e;
    }
  }

  function handleUrlChange(event) {
    setPendingUrl(event.target.value);
    setLoadFrom('url');
  }

  function handleDatasetUrlChange(newDatasetUrls) {
    console.log("entered")
    setDatasetUrls(newDatasetUrls);
    setInputURL(newDatasetUrls)
    const sanitisedUrls = sanitiseURLs(newDatasetUrls);
    if (sanitisedUrls.length === 0) return;
    try {
      const newHintsOptions = getHintOptions(sanitisedUrls);
      setGenerateConfigError(null);
      setPendingJson(baseJson);
    } catch (e) {
      setGenerateConfigError(e.message);
    }
  }

  function handleSyntaxChange(event) {
    setSyntaxType(event.target.value);
  }

  function tryExample() {
    if (syntaxType === 'JSON') {
      setPendingJson(exampleJson);
    } else {
      setPendingJs(exampleJs);
    }
    setDatasetUrls('');
    setLoadFrom('editor');
  }

  function resetEditor() {
    if (syntaxType === 'JSON') {
      setPendingJson(baseJson);
      setDatasetUrls('');
    } else {
      setPendingJs(baseJs);
    }
    setDatasetUrls('');
  }

  const showReset = (pendingJson !== baseJson);

  return (
    loading ? (
      <pre>Loading...</pre>
    ) : (
      <main className={styles.viewConfigEditorMain}>
        {error && (
          <pre className={styles.vitessceAppLoadError}>{error}</pre>
        )}
        <div className={styles.viewConfigInputs}>
          <div className={styles.viewConfigInputUrlOrFile}>
            <p className={styles.viewConfigInputUrlOrFileText}>
              Enter the URLs to one or more data files
              (semicolon-separated).
              <button
                type="button"
                onClick={() => handleConfigGeneration(exampleURL)}
              >Try an example
              </button>
            </p>
            <div className={styles.viewConfigInputUrlOrFileSplit}>
              <textarea
                type="text"
                className={styles.viewConfigUrlTextarea}
                placeholder="One or more file URLs (semicolon-separated)"
                value={datasetUrls}
                onChange={e => handleDatasetUrlChange(e.target.value)}
              />
              <div className={styles.studyInput}>
                <StudyIdInput
                  idLength={ID_LENGTH}
                  onInputError={handleInputError}
                  onInputChange={handleSetStudyId}
                />
              </div>
            </div>
            <div className={styles.viewConfigInputUrlOrFileSplit}>
              <div></div>
              {/* <div className={`${styles.studyInput} ${styles.viewConfigInputButton}`}> */}
              <div className={styles.goButtonDiv}>
                <button
                  type="button"
                  className={styles.viewConfigGo}
                  onClick={handleEditorGo}
                >Load from {loadFrom}
                </button>
             </div>
            </div>
          </div>
          {datasetUrls !== '' ? (
            generateConfigError ? (
              <pre className={styles.vitessceAppLoadError}>
                {generateConfigError}
              </pre>
            ) : null
          ) : null}
        </div>
        <div className={styles.viewConfigInputs}>
          <div className={styles.viewConfigInputUrlOrFile}>
            <p className={styles.viewConfigInputUrlOrFileText}>
              Alternatively, provide a URL or drag &amp; drop a view config file.
            </p>
            <div className={styles.viewConfigInputUrlOrFileSplit}>
              <input
                type="text"
                className={styles.viewConfigUrlInput}
                placeholder="Enter a URL"
                value={pendingUrl}
                onChange={handleUrlChange}
              />
              <div {...getRootProps()} className={styles.dropzone}>
                <input {...getInputProps()} className={styles.dropzoneInfo} />
                {isDragActive
                  ? <span>Drop the file here ...</span>
                  : (pendingFileContents ? (
                    <span>Successfully read the file.</span>
                  ) : (
                    <span>Drop a file</span>
                  )
                  )}
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  );
}
