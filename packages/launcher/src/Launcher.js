import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { makeStyles } from '@vitessce/styles';
import { createOnDrop } from '@vitessce/all';
import { generateConfigAlt as generateConfig, parseUrls } from '@vitessce/config';
import clsx from 'clsx';
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query';
import {
  QueryParamProvider, useQueryParam, StringParam as StringQueryParam, ArrayParam as StringArrayQueryParam,
} from 'use-query-params';
import { useHashParam, useSetHashParams } from './use-hash-param.js';

const useStyles = makeStyles()(() => ({
  launcher: {
    display: 'flex',
    flexDirection: 'column',
  },
  launcherRowTitle: {
    marginBottom: 0,
  },
  cardRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
  },
  card: {
    border: '2px solid grey',
    borderRadius: '10px',
    padding: '5px',
  },
  cardTitle: {
    marginTop: 0,
  },
  cardDashed: {
    border: '2px dashed grey',
  },
}));


export function LauncherStart(props) {
  const { classes } = useStyles();

  // eslint-disable-next-line no-unused-vars
  const [isDragging, setIsDragging] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [isDragProcessing, setIsDragProcessing] = useState(false);

  const localDataCardRef = useRef(null);

  const [viewConfig, setViewConfig] = useState(null);
  const [stores, setStores] = useState(null);

  const onDropHandler = useMemo(() => createOnDrop(
    { setViewConfig, setStores },
  ), [setViewConfig, setStores]);

  // Effect for setting up drag-and-drop event listeners.
  useEffect(() => {
    const zone = localDataCardRef.current;

    const onDragEnter = (e) => {
      e.preventDefault();
      setIsDragging(true);
    };
    const onDragLeave = () => {
      setIsDragging(false);
    };
    const onDragOver = (e) => {
      e.preventDefault();
    };
    const onDrop = async (e) => {
      e.preventDefault();

      setIsDragging(false);
      setIsDragProcessing(true);

      // Call onDrop handler passed in from parent of <VitS/Vitessce/> via prop.
      await onDropHandler(e);

      setIsDragProcessing(false);
    };

    // The dragenter event happens at the moment you drag something in to the target element,
    // and then it stops.
    // The dragover event happens during the time you are dragging something until you drop it.
    zone.addEventListener('dragenter', onDragEnter);
    zone.addEventListener('dragleave', onDragLeave);
    zone.addEventListener('dragover', onDragOver);
    zone.addEventListener('drop', onDrop);

    return () => {
      zone.removeEventListener('dragenter', onDragEnter);
      zone.removeEventListener('dragleave', onDragLeave);
      zone.removeEventListener('dragover', onDragOver);
      zone.removeEventListener('drop', onDrop);
    };
  }, [localDataCardRef, onDropHandler]);


  return (
    <div className={classes.launcher}>
      <div className={classes.launcherRow}>
        <h2>Begin with data</h2>
        <div className={classes.cardRow}>
          <div className={clsx(classes.card, classes.cardDashed)} ref={localDataCardRef}>
            <h3>Local data <br/> (Drag and drop)</h3>
            <p>Drag-and-drop local files to view them in Vitessce. Vitessce launches with a default configuration (based on file types and contents) which can be edited. Files remain local; no upload required.</p>
            <button>Select data files or folders</button>
          </div>
          <div className={classes.card}>
            <h3>Remote data <br/> (Load from URL)</h3>
            <p>
              Enter file URLs to view them in Vitessce. Vitessce launches with a default configuration (based on file types and contents) which can be edited. See our <a href="https://vitessce.io/docs/data-hosting/">data hosting</a> documentation for more details.&nbsp;
              {/*<span className="select-examples">
                <label>Try an example:&nbsp;</label>
                <select>
                  <option>TODO</option>
                </select>
              </span>*/}
            </p>
            <div className="url-input">
              <textarea placeholder="One or more file URLs (semicolon-separated)"></textarea>
            </div>
          </div>
        </div>
      </div>
      <div className={classes.launcherRow}>
        <h2>Begin with configuration</h2>
        <div className={classes.cardRow}>
          {/*<div className={classes.card}>
            <h3>Config Editor</h3>
            <p>Use the online configuration editor to paste, create, or edit a Vitessce configuration using JSON or JS API syntax.</p>
            <button>Launch JSON editor</button>&nbsp;
            <button>Launch JS editor</button>&nbsp;
            <button>Launch Python editor</button>
          </div>*/}
          <div className={clsx(classes.card, classes.cardDashed)}>
            <h3>Local config file <br/> (Drag and drop)</h3>
            <p>View a Vitessce configuration that has been saved to a JSON file.</p>
            <button>Select JSON file</button>
          </div>
          <div className={classes.card}>
            <h3>Remote config file <br/> (Load from URL)</h3>
            <p>
              View a Vitessce configuration that has been saved to a JSON file.&nbsp;
              {/*<span className="select-examples">
                <label>Try an example:&nbsp;</label>
                <select>
                  <option>TODO</option>
                </select>
              </span>*/}
            </p>
            <div className="url-input">
              <textarea placeholder="Enter a URL"></textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const DtypeToParamType = {
  string: StringQueryParam,
  'string-array': StringArrayQueryParam,
}

function useHashOrQueryParam(paramName, defaultValue, dtype) {
  const [valueQ] = useQueryParam(paramName, DtypeToParamType[dtype]);
  const [valueH] = useHashParam(paramName, undefined, dtype);

  console.log(valueQ, valueH);

  if (dtype === 'string-array') {
    if(Array.isArray(valueH) && valueH.length > 0 && (!Array.isArray(valueQ) || valueQ.length === 0)) {
      return valueH;
    } else if (Array.isArray(valueQ) && valueQ.length > 0 && (!Array.isArray(valueH) || valueH.length === 0)) {
      return valueQ;
    } else {
      return null;
    }
  } else {
    if (Array.isArray(valueQ) || Array.isArray(valueH)) {
      throw new Error(`Expected non-array values for "${paramName}".`);
    }
  }

  if (valueQ && valueH) {
    throw new Error(`Both query and hash parameters provided for "${paramName}". Please provide only one.`);
  }

  return valueH ? valueH : valueQ;
}

function LauncherWrapper(props) {
  // Logic for managing state and query/hash params.
  const setHashParams = useSetHashParams();

  const exampleIdValue = useHashOrQueryParam('example', undefined, 'string');
  // TODO: support vitessce-link code param
  //const wsCodeValue = useHashOrQueryParam('session', undefined, 'string');
  const configUrlValue = useHashOrQueryParam('config', undefined, 'string');
  const sourceUrlArr = useHashOrQueryParam('source', undefined, 'string-array');

  // TODO: based on above values, load config or metadata as needed.
  console.log(exampleIdValue, configUrlValue, sourceUrlArr);

  const needsStart = !exampleIdValue && !configUrlValue && (!sourceUrlArr || sourceUrlArr.length === 0);

  // TODO: state machine-like thing for determining which URL param values to use (if any).

  // TODO: pending config vs. valid config vs ...
  // TODO: async loading via react-query.
  useEffect(async () => {
    console.log('Generating config from source URLs:', sourceUrlArr);
    const { config, stores } = await generateConfig(parseUrls(sourceUrlArr));
    console.log(config.toJSON(), stores);
  }, [sourceUrlArr]);

  return (needsStart ? (
    <LauncherStart />
  ) : (
    <pre>{null}</pre>
  ));
}

export function Launcher(props) {
  const {
    // TODO: do we need the parent app to provide this in order to update URL state?
    baseUrl = null,
    // TODO: Optional mapping from example IDs to their full JSON config, and potentially more values such as PageComponent, Plugins, etc.
    // See https://github.com/vitessce/vitessce/blob/main/sites/demo/src/api.js
    exampleConfigs = null,
  } = props;

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
      <QueryParamProvider>
        <LauncherWrapper />
        <a href="/?source=https://storage.googleapis.com/vitessce-demo-data/maynard-2021/151673.sdata.zarr">SpatialData Example</a>
        <a href="/#?source=https://uk1s3.embassy.ebi.ac.uk/idr/zarr/v0.4/idr0062A/6001240.zarr$image.ome-zarr">OME-Zarr Example</a>
      </QueryParamProvider>
    </QueryClientProvider>
  );
}