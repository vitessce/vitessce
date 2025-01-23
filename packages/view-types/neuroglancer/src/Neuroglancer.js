import React, { useState, useEffect } from 'react';
import NeuroglancerViewer from '@vitessce/neuroglancer-plugin';

export function Neuroglancer(props) {
  const [updatedState, setUpdatedState] = useState(props.viewerState);

  useEffect(() => {
    if (updatedState && JSON.stringify(props.viewerState) !== JSON.stringify(updatedState)) {
      console.log('Props viewerState updated:', props.viewerState);
    }
  }, [updatedState]);


  function handleStateChanged(newState) {
    if (JSON.stringify(newState) === JSON.stringify(updatedState)) {
      console.log('State is unchanged. Skipping update.');
    }
  }

  function colorChange() {
    const updatedStateChanged = { ...updatedState };
    updatedStateChanged.layout = 'yz-3d';
    setUpdatedState(updatedStateChanged);
  }

  return (
    <>
      {/* <button  style={{position:"absolute", backgroundColor: "red", zIndex:2000, height:"20px"}} onClick = {colorChange}></button> */}
      <NeuroglancerViewer
        viewerState={updatedState}
        onViewerStateChanged={handleStateChanged}
      />
    </>
  );
}
