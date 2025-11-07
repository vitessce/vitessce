/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unknown-property */
/* eslint-disable max-len */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createOnDrop } from '@vitessce/vit-s';
import {
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ExpandMore,
} from '@vitessce/styles';
import clsx from 'clsx';
import { useStyles } from './launcher-styles.js';


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
