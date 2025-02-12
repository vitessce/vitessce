import React, { useState, useCallback, useMemo } from 'react';
import { ChunkWorker } from '@vitessce/neuroglancer-workers';
import ReactNeuroglancer from '@janelia-flyem/react-neuroglancer';
import { useStyles } from './styles.js';


// Reference: https://github.com/developit/jsdom-worker/issues/14#issuecomment-1268070123
function createWorker() {
  return new ChunkWorker();
}

export function Neuroglancer(props) {
  const {
    viewerState,
    onViewerStateChanged,
  } = props;
  const classes = useStyles();
  const [updatedState, setUpdatedState] = useState(viewerState);
  const bundleRoot = useMemo(() => createWorker(), []);

  const handleStateChanged = useCallback((newState) => {
    if (JSON.stringify(newState) !== JSON.stringify(updatedState)) {
      if (onViewerStateChanged) {
        onViewerStateChanged(newState);
      }
    }
  }, [onViewerStateChanged, updatedState]);

  const changeLayout = useCallback(() => {
    setUpdatedState(prevState => ({
      ...prevState,
      layout: '4panel',
    }));
  }, []);

  return (
    <>
      <style>{`
      .neuroglancer-segment-list-header-label {
        display: none !important;
      }
      `}
      </style>
      {/* Test button to change the layout and get the updated state */}
      <button type="button" onClick={changeLayout} style={{ width: '10%', color: '#333' }}>Change layout</button>
      <div className={classes.neuroglancerWrapper}>
        <ReactNeuroglancer
          brainMapsClientId="NOT_A_VALID_ID"
          viewerState={updatedState}
          onViewerStateChanged={handleStateChanged}
          bundleRoot={bundleRoot}
        />
      </div>
    </>
  );
}
