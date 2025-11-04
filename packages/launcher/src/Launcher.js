import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { makeStyles } from '@vitessce/styles';
import { createOnDrop } from '@vitessce/all';
import clsx from 'clsx';
import {
  QueryParamProvider, useQueryParam, StringParam,
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
    display: 'flex',
    flexDirection: 'row',
    flexBasis: 1,
  },
  card: {
    border: '2px solid grey',
    borderRadius: '10px',
    margin: '5px',
    padding: '5px',
  },
  cardTitle: {
    marginTop: 0,
  },
  cardDashed: {
    border: '2px dashed grey',
  },
}));


export function Launcher(props) {
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
          </div>
          <div className={classes.card}>
            <h3>Remote data <br/> (Load from URL)</h3>
            <p>
              Enter file URLs to view them in Vitessce. Vitessce launches with a default configuration (based on file types and contents) which can be edited. See our <a href="https://vitessce.io/docs/data-hosting/">data hosting</a> documentation for more details.&nbsp;
              <span className="select-examples">
                <label>Try an example:&nbsp;</label>
                <select>
                  <option>TODO</option>
                </select>
              </span>
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
          </div>
          <div className={classes.card}>
            <h3>Remote config file <br/> (Load from URL)</h3>
            <p>
              View a Vitessce configuration that has been saved to a JSON file.&nbsp;
              <span className="select-examples">
                <label>Try an example:&nbsp;</label>
                <select>
                  <option>TODO</option>
                </select>
              </span>
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