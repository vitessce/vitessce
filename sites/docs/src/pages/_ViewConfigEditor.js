/* eslint-disable no-nested-ternary */
import React, { useCallback, useState, useEffect } from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { useDropzone } from 'react-dropzone';


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
import LoadingOverlay from '../components/loadingOverlay.js';
import StudyIdInput from '../components/StudyIdInput.js';
import {
  baseJs, baseJson, exampleJs, exampleJson,
} from './_live-editor-examples.js';

import JsonHighlight from './_JsonHighlight.js';
import styles from './styles.module.css';
// import { getLinkId } from './utils.js';

const ID_LENGTH = 4;
const LINK_ID_URL = 'https://nwe7zm1a12.execute-api.us-east-1.amazonaws.com/link?study_id=';
const NO_DATASET_URL_ERROR = 'No dataset URL is provided';

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

  // const viewConfigDocsJsUrl = useBaseUrl('/docs/view-config-js/');
  // const viewConfigDocsJsonUrl = useBaseUrl('/docs/view-config-json/');
  // const defaultViewConfigDocsUrl = useBaseUrl('/docs/default-config-json');

  const [pendingUrl, setPendingUrl] = useState('');
  const [datasetUrls, setDatasetUrls] = useState('');
  const [pendingFileContents, setPendingFileContents] = useState('');
  const [generateConfigError, setGenerateConfigError] = useState(null);
  const [inputURL, setInputURL] = useState('');
  const [studyId, setStudyId] = useState(null);
  const [loadingOverlay, setLoadingOverlay] = useState(false);
  const [showReset, setShowReset] = useState(null);


  const [loadFrom, setLoadFrom] = useState('editor');

  const exampleURL = 'https://assets.hubmapconsortium.org/a4be39d9c1606130450a011d2f1feeff/ometiff-pyramids/processedMicroscopy/VAN0012-RK-102-167-PAS_IMS_images/VAN0012-RK-102-167-PAS_IMS-registered.ome.tif';


  function handleSetStudyId(id) {
    setStudyId(id);
  }

  function handleInputError(errMessage) {
    setError(errMessage);
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
        setError(null);
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
    console.log(inputURL, error, inputURL === '')
    if (inputURL === '' && error) {
      setError(NO_DATASET_URL_ERROR);
      return;
    }
    let nextUrl;
    if (loadFrom === 'editor') {
      const nextConfig = pendingJson;
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

    if (studyId && studyId !== '' && studyId.length === ID_LENGTH) {
      setLoadingOverlay(true);
      const linkId = await getLinkId();
      console.log(linkId);
      if(linkId)
        setUrl(nextUrl);
    } else {
      setError('Enter a valid Study Id');
    }
  }

  async function getLinkId() {
    const url = `${LINK_ID_URL}${studyId}`;
    try {
      const response = await fetch(url, {
        method: 'GET',
      });
      if (!response.ok) {
        setError(`HTTP error! status: ${response.status}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setLoadingOverlay(false);
      return data;
    } catch (error) {
      setLoadingOverlay(false);
      setError('Error in getting the LinkId');
    }
  }
  

  async function handleConfigGeneration(exampleURL) {
    setInputURL(exampleURL);
    setDatasetUrls(exampleURL);
    setShowReset(true);
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
    const url = event.target.value;
    console.log(url)
    setPendingUrl(url);
    setLoadFrom('url');
    console.log(pendingUrl);
    setInputURL(url)
    const sanitisedUrls = sanitiseURLs(event.target.value);
    if(sanitisedUrls.length === 0) {
      setError('Enter a correct URL');
      return;
    }
    else
      setError(null)
  }

  // const handleInputChange = (e) => {
  //   const { value } = e.target;
  //   console.log(value);
  //   if (value === '') {
  //     setError('Study ID cannot be empty');
  //   } 
  //   else if (!/^\d+$/.test(value)) {
  //     setError('Study ID must be numbers only');
  //   } 
  //   else if (value.length < ID_LENGTH) {
  //         setError(`Study ID must be ${ID_LENGTH} digits`);
  //     }
  //   else 
  //     setStudyId(value);
  // };


  function handleTextAreaURLChange(newDatasetUrls) {
    setDatasetUrls(newDatasetUrls);
    setInputURL(newDatasetUrls);
    const sanitisedUrls = sanitiseURLs(newDatasetUrls);
    console.log("san", sanitiseURLs);
    if (sanitisedUrls.length === 0) {
      // setShowReset(true);
      setError('Incorrect URL');
      return;
    }
    try {
      // const newHintsOptions = getHintOptions(sanitisedUrls);
      setGenerateConfigError(null);
      setPendingJson(baseJson);
    } catch (e) {
      setGenerateConfigError(e.message);
    }
  }

    function resetEditor() {
      setPendingJson(baseJson);
      setDatasetUrls('');
      setInputURL('');
      setError(NO_DATASET_URL_ERROR);
      setShowReset(false);
    }


  // function handleSyntaxChange(event) {
  //   setSyntaxType(event.target.value);
  // }

  // function tryExample() {
  //   if (syntaxType === 'JSON') {
  //     setPendingJson(exampleJson);
  //   } else {
  //     setPendingJs(exampleJs);
  //   }
  //   setDatasetUrls('');
  //   setLoadFrom('editor');
  // }

  // function resetTextArea() {
  //   if (syntaxType === 'JSON') {
  //     setPendingJson(baseJson);
  //     setDatasetUrls('');
  //   } else {
  //     setPendingJs(baseJs);
  //   }
  //   setDatasetUrls('');
  // }

  return (
    loading ? (
      <pre>Loading...</pre>
    ) : (

      <main className={styles.viewConfigEditorMain}>
        <LoadingOverlay isLoading={loadingOverlay} />
        <div className={styles.mainContainer}>
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
                {showReset && <button type="button" onClick={resetEditor}>Reset the editor</button>}
              </p>
              <div className={styles.viewConfigInputUrlOrFileSplit}>
                <textarea
                  type="text"
                  className={styles.viewConfigUrlTextarea}
                  placeholder="One or more file URLs (semicolon-separated)"
                  value={datasetUrls}
                  onChange={e => handleTextAreaURLChange(e.target.value)}
                />
                <div className={styles.studyInput}>
                  <StudyIdInput
                    idLength={ID_LENGTH}
                    onInputError={handleInputError}
                    onInputChange={handleSetStudyId}
                  />
                  {/* <p className={styles.viewConfigInputUrlOrFileText} htmlFor="inputField"> Enter your study id
                    <span className={styles.requiredField}>*</span>
                  </p>
                <input
                    type="text"
                    id="inputField"
                    className={styles.viewConfigUrlInput}
                    placeholder={`${ID_LENGTH}-Digit Id`}
                    onChange={handleInputChange}
                /> */}
                </div>
              </div>
              <div className={styles.viewConfigInputUrlOrFileSplit}>
                <div />
                {/* placeholder to align with the next grid div */}
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
          </div>
          {datasetUrls !== '' ? (
            generateConfigError ? (
              <pre className={styles.vitessceAppLoadError}>
                {generateConfigError}
              </pre>
            ) : null
          ) : null}

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
        </div>
      </main>
    )
  );
}
