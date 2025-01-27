import React, { useState } from 'react';
import NeuroglancerViewer from '@vitessce/neuroglancer-plugin';

export function Neuroglancer({ viewerState, onViewerStateChanged }) {
  const [updatedState, setUpdatedState] = useState(viewerState);
  function handleStateChanged(newState) {
    if (JSON.stringify(newState) !== JSON.stringify(updatedState)) {
      onViewerStateChanged(newState);
    }
  }
  const changeLayout = () => {
    setUpdatedState(prevState => ({
      ...prevState,
      layout: '4panel',
    }));
  };
  return (
    <>
      {/* Test button to change the layout and get the updated state */}
      <button type="button" onClick={changeLayout} style={{ width: '10%', color: '#333' }}>Change layout</button>
      <NeuroglancerViewer
        viewerState={updatedState}
        onViewerStateChanged={handleStateChanged}
      />
    </>
  );
}
