/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unknown-property */
/* eslint-disable no-nested-ternary */
/* eslint-disable max-len */
/* eslint-disable no-console */
/* eslint-disable prefer-destructuring */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Vitessce } from '@vitessce/all';
import { createOnDrop } from '@vitessce/vit-s';
import { generateConfigAlt as generateConfig, parseUrls } from '@vitessce/config';
import {
  TextField,
  Button,
  Typography,
  Card, CardContent,
  Accordion, AccordionSummary, AccordionDetails,
  ExpandMore,
} from '@vitessce/styles';
import clsx from 'clsx';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { QueryParamProvider } from 'use-query-params';
import { useSetHashParams } from './use-hash-param.js';
import { useHashOrQueryParam } from './use-query-or-hash-param.js';
import { useStyles } from './launcher-styles.js';

function logConfigUpgrade(prevConfig, nextConfig) {
  // eslint-disable-next-line no-console
  console.log(`Upgrade view config schema from ${prevConfig.version} to ${nextConfig.version}`);
  // eslint-disable-next-line no-console
  console.log(prevConfig);
  // eslint-disable-next-line no-console
  console.log(nextConfig);
}


export function LauncherStart(props) {
  const {
    setIsEditing,
    setIsUsingLocalFiles,
    configUrl,
    setConfigUrl,
    sourceUrlArr,
    setSourceUrlArr,
    setValidConfigFromDroppedData,
    setStoresFromDroppedData,
    setViewConfigFromDroppedConfig,
  } = props;
  const { classes } = useStyles();

  const [spotlightCard, setSpotlightCard] = useState(null);

  // Single dropzone for both data files/folders and config files.
  const dropzoneRef = useRef(null);
  const localDataInputFoldersRef = useRef(null);
  const localDataInputFilesRef = useRef(null);
  const localConfigInputRef = useRef(null);

  const onDropHandler = useMemo(() => createOnDrop(
    { setViewConfig: setValidConfigFromDroppedData, setStores: setStoresFromDroppedData },
    false, // isFileInput
    true, // isConfigInput
  ), [setValidConfigFromDroppedData, setStoresFromDroppedData]);
  const onFileInputHandler = useMemo(() => createOnDrop(
    { setViewConfig: setValidConfigFromDroppedData, setStores: setStoresFromDroppedData },
    true, // isFileInput
    true, // isConfigInput
  ), [setValidConfigFromDroppedData, setStoresFromDroppedData]);

  // Effect for setting up drag-and-drop event listeners for data file/folder input.
  useEffect(() => {
    // TODO: just make the entire Launcher a dropzone,
    // and then determine whether the dropped file(s) are config or data files
    // (e.g., if a single .json file, assume config; else data).

    const zone = dropzoneRef.current;
    const zoneDataInput1 = localDataInputFoldersRef.current;
    const zoneDataInput2 = localDataInputFilesRef.current;
    const zoneConfigInput = localConfigInputRef.current;

    const onDragEnter = (e) => {
      e.preventDefault();
      setSpotlightCard('data-local');
    };
    const onDragLeave = () => {
      setSpotlightCard(null);
    };
    const onDragOver = (e) => {
      e.preventDefault();
    };
    const onDrop = async (e) => {
      e.preventDefault();

      setIsEditing(false);
      // Clear the other field values.
      setConfigUrl(undefined);
      setSourceUrlArr(undefined);

      // Call onDrop handler passed in from parent of <VitS/Vitessce/> via prop.
      await onDropHandler(e);
      setIsUsingLocalFiles(true);

      setSpotlightCard(null);
    };

    const onDataInputChange = async (e) => {
      // Reference: https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/File_drag_and_drop
      e.preventDefault();

      setIsEditing(false);
      setSpotlightCard('data-local');
      // Clear the other field values.
      setConfigUrl(undefined);
      setSourceUrlArr(undefined);

      await onFileInputHandler(e);

      setIsUsingLocalFiles(true);
      setSpotlightCard(null);
    };

    const onConfigInputChange = async (e) => {
      // Reference: https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/File_drag_and_drop
      e.preventDefault();

      setIsEditing(false);
      setSpotlightCard('config-local');
      // Clear the other field values.
      setConfigUrl(undefined);
      setSourceUrlArr(undefined);

      await onFileInputHandler(e);

      setIsUsingLocalFiles(true);
      setSpotlightCard(null);
    };

    // The dragenter event happens at the moment you drag something in to the target element,
    // and then it stops.
    // The dragover event happens during the time you are dragging something until you drop it.
    zone.addEventListener('dragenter', onDragEnter);
    zone.addEventListener('dragleave', onDragLeave);
    zone.addEventListener('dragover', onDragOver);
    zone.addEventListener('drop', onDrop);
    zoneDataInput1.addEventListener('change', onDataInputChange);
    zoneDataInput2.addEventListener('change', onDataInputChange);
    zoneConfigInput.addEventListener('change', onConfigInputChange);

    return () => {
      zone.removeEventListener('dragenter', onDragEnter);
      zone.removeEventListener('dragleave', onDragLeave);
      zone.removeEventListener('dragover', onDragOver);
      zone.removeEventListener('drop', onDrop);
      zoneDataInput1.removeEventListener('change', onDataInputChange);
      zoneDataInput2.removeEventListener('change', onDataInputChange);
      zoneConfigInput.removeEventListener('change', onConfigInputChange);
    };
  }, [dropzoneRef, localDataInputFoldersRef, localDataInputFilesRef,
    onDropHandler, setIsUsingLocalFiles, setIsEditing, setSpotlightCard,
    onFileInputHandler, setConfigUrl, setSourceUrlArr,
  ]);

  return (
    <div className={classes.launcher} ref={dropzoneRef}>
      <div className={classes.launcherRow}>
        <div className={clsx({ [classes.cardDim]: spotlightCard && (spotlightCard === 'config-local' || spotlightCard === 'config-remote') })}>
          <Typography variant="h5">Begin with data</Typography>
          {/* TODO: generalize to support both "begin with data" and "add data" flows? */}
          <p>Let Vitessce <a href="https://vitessce.io/docs/default-config-json/">infer an initial configuration</a> based on the contents of your <a href="https://vitessce.io/docs/data-types-file-types/">data files.</a></p>
          {/* TODO: eventually, link to tutorials/videos showing how to use each of the Begin with... options */}
        </div>
        <div className={classes.launcherCardRow}>
          <Card className={clsx(classes.launcherCard, { [classes.cardDim]: spotlightCard && spotlightCard !== 'data-local' })}>
            <span className={classes.cardDashed}>
              <CardContent className={classes.cardContent}>
                <Typography variant="h6">Local data <br />(Drag and drop)</Typography>
                <p>Select or drop local files (or folders) to view them in Vitessce. Vitessce launches with a default configuration (based on file extensions and contents). Files remain local; no upload occurs.</p>
                <div className={classes.buttonSpacer} />
                <div className={classes.dataButtonGroup}>
                  <Button component="label" for="data-local-input-directory" variant="outlined" fullWidth>
                    <span>Select folder(s)</span>
                    <input
                      id="data-local-input-directory"
                      type="file"
                      ref={localDataInputFoldersRef}
                      className={classes.hiddenFileInput}
                      multiple
                      directory="true"
                      webkitdirectory="true"
                      mozdirectory="true"
                    />
                  </Button>
                  &nbsp;
                  <Button component="label" for="data-local-input-files" variant="outlined" fullWidth>
                    <span>Select file(s)</span>
                    <input
                      id="data-local-input-files"
                      type="file"
                      ref={localDataInputFilesRef}
                      className={classes.hiddenFileInput}
                      multiple
                    />
                  </Button>
                </div>
                <div className={classes.buttonSpacer} />
              </CardContent>
            </span>
          </Card>
          <Card className={clsx(classes.launcherCard, { [classes.cardDim]: spotlightCard && spotlightCard !== 'data-remote' })}>
            <CardContent>
              <Typography variant="h6">Remote data <br /> (Load from URL)</Typography>
              <p>
                Enter file (or folder) URLs to view them in Vitessce. Vitessce launches with a default configuration (based on file types and contents). See our <a href="https://vitessce.io/docs/data-hosting/">data hosting</a> documentation for assistance in making your data accessible to Vitessce.&nbsp;
                {/* <span className="select-examples">
                  <label>Try an example:&nbsp;</label>
                  <select>
                    <option>TODO</option>
                  </select>
                </span> */}
              </p>
              <div className={classes.textareaAndButton}>
                <TextField
                  multiline
                  label="Data URL(s)"
                  placeholder="One or more file URLs (semicolon-separated)"
                  minRows={2}
                  className={classes.dataUrlTextarea}
                  value={sourceUrlArr ? sourceUrlArr.join(';') : ''}
                  onChange={(e) => {
                    // Clear existing state.
                    setConfigUrl(undefined);
                    setSourceUrlArr(e.target.value);
                  }}
                  onBlur={() => setSpotlightCard(null)}
                  onFocus={() => {
                    setSpotlightCard('data-remote');
                    // We need to set isEditing, otherwise the launcher UI will disappear
                    // as soon as there is a non-empty sourceUrlArr value.
                    setIsEditing(true);
                  }}
                />
                <Button
                  variant="outlined"
                  onClick={() => {
                    setIsEditing(false);
                  }}
                >Visualize
                </Button>
              </div>
              <Accordion disableGutters style={{ marginTop: '5px' }}>
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  aria-controls="panel1-content"
                  id="panel1-header"
                >Specifying file extensions
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2">
                    Vitessce automatically tries to infer the file type based on the file extension.
                    For URLs with non-standard extensions, the file type can be specified by appending <code><b>$</b>FILE_TYPE</code> to the URL.
                    For example, to specify that a folder at <code>https://example.com/my_data.zarr</code> is in SpatialData format, use the URL <code>https://example.com/my_data.zarr<b>$</b>spatialdata.zarr</code>.
                    See our <a href="https://vitessce.io/docs/data-types-file-types/">data types and file types documentation</a> for a list of supported file types.
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className={classes.launcherRow}>
        <div className={clsx({ [classes.cardDim]: spotlightCard && (spotlightCard === 'data-local' || spotlightCard === 'data-remote') })}>
          <Typography variant="h5">Begin with configuration</Typography>
          <p>Use the options below to supply a Vitessce <a href="https://vitessce.io/docs/view-config-json/">configuration in JSON format.</a></p>
        </div>
        <div className={classes.launcherCardRow}>
          {/* <div className={classes.launcherCard}>
            <h3>Config Editor</h3>
            <p>Use the online configuration editor to paste, create, or edit a Vitessce configuration using JSON or JS API syntax.</p>
            <button>Launch JSON editor</button>&nbsp;
            <button>Launch JS editor</button>&nbsp;
            <button>Launch Python editor</button>
          </div> */}
          <Card className={clsx(classes.launcherCard, { [classes.cardDim]: spotlightCard && spotlightCard !== 'config-local' })}>
            <span className={classes.cardDashed}>
              <CardContent className={classes.cardContent}>
                <Typography variant="h6">Local config file <br /> (Drag and drop)</Typography>
                <p>View a configured Vitessce visualization by selecting or dropping a local JSON file.</p>
                <div className={classes.buttonSpacer} />
                <Button component="label" variant="outlined" fullWidth>
                  <span>Select file</span>
                  <input
                    type="file"
                    ref={localConfigInputRef}
                    className={classes.hiddenFileInput}
                    accept=".json,application/json"
                  />
                </Button>
                <div className={classes.buttonSpacer} />
              </CardContent>
            </span>
          </Card>
          <Card className={clsx(classes.launcherCard, { [classes.cardDim]: spotlightCard && spotlightCard !== 'config-remote' })}>
            <CardContent>
              <Typography variant="h6">Remote config file <br /> (Load from URL)</Typography>
              <p>
                View a configured Vitessce visualization by specifying a URL to a JSON config file. See our <a href="https://vitessce.io/docs/data-hosting/">data hosting</a> documentation for assistance in making your config file accessible to Vitessce.&nbsp;
                {/* <span className="select-examples">
                  <label>Try an example:&nbsp;</label>
                  <select>
                    <option>TODO</option>
                  </select>
                </span> */}
              </p>
              <div className={classes.textareaAndButton}>
                {/* TODO: add another textField in case the user wants to paste JSON and view it via a data URI? */}
                <TextField
                  multiline
                  label="Config URL"
                  placeholder="Enter a URL"
                  minRows={2}
                  className={classes.dataUrlTextarea}
                  value={configUrl || ''}
                  onChange={(e) => {
                    // Clear existing state.
                    setSourceUrlArr(undefined);
                    setConfigUrl(e.target.value);
                  }}
                  onBlur={() => setSpotlightCard(null)}
                  onFocus={() => {
                    setSpotlightCard('config-remote');
                    // We need to set isEditing, otherwise the launcher UI will disappear
                    // as soon as there is a non-empty configUrl value.
                    setIsEditing(true);
                  }}
                />
                <Button
                  variant="outlined"
                  onClick={() => {
                    setIsEditing(false);
                  }}
                >Visualize
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* TODO: finish implementing the below row once a sidebar is available that allows for adding data post-launching */}
        {/* <div className={classes.launcherRow}>
          <Typography variant="h5">Begin with a view type</Typography>
          <p>Select a view type to get started with configuring a new visualization.</p>
        </div> */}
      </div>
    </div>
  );
}

export function ControlledLauncherInner(props) {
  const {
    isEditing = true,
    setIsEditing,
    setIsUsingLocalFiles,
    configUrl,
    setConfigUrl,
    sourceUrlArr,
    setSourceUrlArr,
    marginTop = 0,
  } = props;

  const { classes } = useStyles();

  const [validConfigFromDroppedData, setValidConfigFromDroppedData] = useState(null);
  const [storesFromDroppedData, setStoresFromDroppedData] = useState(null);

  // Not necessarily valid since coming from user-provided file.
  // JSON may not conform to schema, or may not even be valid JSON.
  const [viewConfigFromDroppedConfig, setViewConfigFromDroppedConfig] = useState(null);

  const configUrlQueryEnabled = !!configUrl;
  const configUrlResult = useQuery({
    enabled: configUrlQueryEnabled,
    queryKey: ['config-from-url', configUrl],
    queryFn: async () => {
      const resp = await fetch(configUrl);
      if (!resp.ok) {
        throw new Error(`Failed to fetch config from URL: ${resp.status} ${resp.statusText}`);
      }
      const configJson = await resp.json();
      return configJson;
    },
  });

  const sourceUrlQueryEnabled = Array.isArray(sourceUrlArr) && sourceUrlArr.length > 0;
  const sourceUrlResult = useQuery({
    enabled: sourceUrlQueryEnabled,
    queryKey: ['data-metadata-from-urls', sourceUrlArr],
    queryFn: async () => {
      const { config, stores } = await generateConfig(parseUrls(sourceUrlArr));
      return { config, stores };
    },
  });

  let isLoading = false;
  let validConfig = null;
  let stores = null;
  if (configUrlQueryEnabled) {
    isLoading = configUrlResult.isLoading;
    if (configUrlResult.isSuccess) {
      validConfig = configUrlResult.data;
    }
  } else if (sourceUrlQueryEnabled) {
    isLoading = sourceUrlResult.isLoading;
    if (sourceUrlResult.isSuccess) {
      validConfig = sourceUrlResult.data.config.toJSON();
      stores = sourceUrlResult.data.stores;
    }
  } else if (viewConfigFromDroppedConfig) {
    // Let validation happen within Vitessce component.
    validConfig = viewConfigFromDroppedConfig;
  } else if (validConfigFromDroppedData) {
    validConfig = validConfigFromDroppedData;
    stores = storesFromDroppedData;
  }

  // TODO: handle error states from react-query results.


  // Possible states:
  // - needsStart: No URL parameters; Show the launcher UI.
  // - Awaiting URL parameter parsing.
  // - Invalid/unrecognized example ID
  // - Loading config or data/metadata from URL.
  // - Loaded config but was invalid.
  // - Could not identify a valid/supported data format from data file extension(s).
  //   - Suggest to append `$supportedFileType` to source URL(s) to specify the data format if file extension is non-standard.
  // - Failed to load config or data/metadata from URL.
  // - Error if BOTH config and source parameters are provided.
  // - Error if BOTH hash and query parameters are provided.

  const pageMode = false; // TODO
  const PageComponent = null; // TODO
  const isExpanded = true; // TODO

  const onDropHandler = null; // TODO
  const debug = false; // TODO
  const theme = 'light2'; // TODO

  return (isEditing ? (
    <LauncherStart
      setIsEditing={setIsEditing}
      setIsUsingLocalFiles={setIsUsingLocalFiles}
      configUrl={configUrl}
      setConfigUrl={setConfigUrl}
      sourceUrlArr={sourceUrlArr}
      setSourceUrlArr={setSourceUrlArr}

      setValidConfigFromDroppedData={setValidConfigFromDroppedData}
      setStoresFromDroppedData={setStoresFromDroppedData}
      setViewConfigFromDroppedConfig={setViewConfigFromDroppedConfig}
    />
  ) : (validConfig ? (
    <main
      className={clsx(classes.vitessceApp, { 'vitessce-expanded': isExpanded, 'vitessce-page': pageMode })}
      style={{
        height: `calc(100vh - ${marginTop}px)`,
      }}
    >
      {pageMode ? (
        <style>{`
          .vitessce-container {
            height: max(100%,100vh);
            width: 100%;
            overflow: hidden;
            position: relative;
            left: 0;
          }
        `}
        </style>
      ) : (
        <style>{`
          .vitessce-container {
            min-height: calc(100vh - ${marginTop}px);
            width: 100%;
            overflow: hidden;
            position: relative;
            left: 0;
          }
        `}
        </style>
      )}
      <Vitessce
        theme={theme}
        validateOnConfigChange={debug}
        onConfigChange={debug ? console.log : undefined}
        onConfigUpgrade={debug ? logConfigUpgrade : undefined}
        config={validConfig}
        height={isExpanded ? undefined : 800}
        pageMode={pageMode}
        stores={stores}
        onDrop={onDropHandler}
      >
        {pageMode && PageComponent ? (<PageComponent />) : null}
      </Vitessce>
    </main>
  ) : (
    isLoading ? (
      <h2>Loading...</h2>
    ) : (
      <div>Error loading configuration or data from URL parameters.</div>
    )
  )));
}


export function ControlledLauncher(props) {
  const queryClient = useMemo(() => new QueryClient({
    // Reference: https://tanstack.com/query/latest/docs/react/guides/window-focus-refetching
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 2,
      },
    },
  }), []);

  return (
    <QueryClientProvider client={queryClient}>
      <ControlledLauncherInner {...props} />
    </QueryClientProvider>
  );
}


function UncontrolledLauncherInner(props) {
  const {
    marginTop = 0,
    setIsFooterVisible,
  } = props;
  // Logic for managing state and query/hash params.
  const setHashParams = useSetHashParams();

  // TODO: make this a fully "controlled" component.
  // Handle URL param getting/setting in a parent component.
  // Set and get URL parameters via the parent.
  // Use an edit=true flag to indicate whether to still show the launcher component despite having non-empty param values.
  // TODO: style the launcher so that the one relevant card is "spotlighted" when there is a non-empty param value.

  // That way, the launcher could eventually be contained within the <Vitessce /> component, e.g., if there is an empty config.

  const [exampleId, setExampleId, exampleIdParamError] = useHashOrQueryParam('example', undefined, 'string');
  // TODO: support vitessce-link code param
  // const wsCodeValue = useHashOrQueryParam('session', undefined, 'string');
  const [configUrl, setConfigUrl, configUrlParamError] = useHashOrQueryParam('config', undefined, 'string');
  const [sourceUrlArr, setSourceUrlArr, sourceUrlArrParamError] = useHashOrQueryParam('source', undefined, 'string-array');
  const [isEditingParam, setIsEditing, isEditingParamError] = useHashOrQueryParam('edit', undefined, 'boolean');

  // We need this here since the URL param will not indicate whether local data was dropped.
  // TODO: Store in a cookie/localStorage? Store in a URL param?
  // However if the page changes, we will lose the dropped data anyway...
  const [isUsingLocalFiles, setIsUsingLocalFiles] = useState(false);

  // Check for parameter errors (e.g., both hash+query for same value) and conflicting parameters.
  const hasNoParamError = !exampleIdParamError && !configUrlParamError && !sourceUrlArrParamError && !isEditingParamError;
  const hasNoConflictingParams = (
    (exampleId ? 1 : 0)
    + (configUrl ? 1 : 0)
    + (sourceUrlArr && sourceUrlArr.length > 0 ? 1 : 0)
  ) <= 1;
  const needsStart = !exampleId && !configUrl && (!sourceUrlArr || (Array.isArray(sourceUrlArr) && sourceUrlArr.length === 0));

  const isEditing = !isUsingLocalFiles && (isEditingParam === true || needsStart);

  useEffect(() => {
    if (typeof setIsFooterVisible === 'function') {
      setIsFooterVisible(isEditing);
    }
  }, [isEditing, setIsFooterVisible]);

  return (
    <ControlledLauncher
      isEditing={isEditing}
      setIsEditing={setIsEditing}
      isUsingLocalFiles={isUsingLocalFiles}
      setIsUsingLocalFiles={setIsUsingLocalFiles}
      configUrl={configUrl}
      setConfigUrl={setConfigUrl}
      sourceUrlArr={sourceUrlArr}
      setSourceUrlArr={setSourceUrlArr}
      marginTop={marginTop}
    />
  );
}

/**
 *
 * @param {object} props
 * @param {number} [props.marginTop=0] The distance in pixels from the top of the window.
 * This is used to calculate the height of the Vitessce component (100vh minus marginTop).
 * @param {function} [props.setIsFooterVisible] Callback to set whether the footer is visible.
 * Used to hide the footer when Vitessce component is visible.
 * @returns
 */
export function UncontrolledLauncher(props) {
  const {
    // TODO: do we need the parent app to provide this in order to update URL state?
    baseUrl = null,
    // TODO: Optional mapping from example IDs to their full JSON config, and potentially more values such as PageComponent, Plugins, etc.
    // See https://github.com/vitessce/vitessce/blob/main/sites/demo/src/api.js
    exampleConfigs = null,
    marginTop = 0,
    setIsFooterVisible = null,
  } = props;

  // TODO: wrap in MUI themeProvider?
  return (
    <QueryParamProvider>
      <div style={{ display: 'none' }}>
        {/* TEMP: links for quick testing */}
        <a href="/">Reset</a>&nbsp;
        <a href="/?source=https://storage.googleapis.com/vitessce-demo-data/maynard-2021/151673.sdata.zarr">SpatialData Example</a>&nbsp;
        <a href="/#?source=https://uk1s3.embassy.ebi.ac.uk/idr/zarr/v0.4/idr0062A/6001240.zarr$image.ome-zarr">OME-Zarr Example</a>
      </div>
      <UncontrolledLauncherInner
        marginTop={marginTop}
        setIsFooterVisible={setIsFooterVisible}
      />
    </QueryParamProvider>
  );
}
