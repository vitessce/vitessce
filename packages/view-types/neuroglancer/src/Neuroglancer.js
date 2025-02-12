import React, { useState, useCallback } from 'react';
import { NeuroglancerViewer } from 'vitessce-react-neuroglancer';
import { useStyles } from './styles.js';

export function Neuroglancer(props) {
  const { viewerState, onViewerStateChanged } = props;
  const classes = useStyles();
  const [updatedState, setUpdatedState] = useState(viewerState);

  const handleStateChanged = useCallback((newState) => {
    if (JSON.stringify(newState) !== JSON.stringify(updatedState)) {
      if (onViewerStateChanged) {
        onViewerStateChanged(newState);
      }
    }
  }, [onViewerStateChanged, updatedState]);
  const changeLayout = () => {
    setUpdatedState(prevState => ({
      ...prevState,
      layout: '4panel',
    }));
  };
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
        <NeuroglancerViewer
          viewerState={updatedState}
          onViewerStateChanged={handleStateChanged}
        />
      </div>
    </>
  );
}
