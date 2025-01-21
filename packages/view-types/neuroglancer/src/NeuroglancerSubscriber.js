import React, { useState, useEffect, useRef } from 'react';
import NeuroglancerViewer from '@vitessce/neuroglancer-plugin';
import zIndex from '@material-ui/core/styles/zIndex';

export function NeuroglancerSubscriber(props) {
  // const [viewerState, setViewerState] = useState(props.viewerState);
  const [updatedState, setUpdatedState] = useState(props.viewerState)

  useEffect(() => {
    if (updatedState && JSON.stringify(props.viewerState) !== JSON.stringify(updatedState)) {
      console.log("Props viewerState updated:", props.viewerState);
      // setViewerState(updatedState); // Update local state
      // lastViewerStateRef.current = props.viewerState; // Update the ref to match the new props
    }
  }, [updatedState]); // Only run when props.viewerState changes

  // This function handles updates when the viewer state changes
  function handleStateChanged(newState) {
    // Avoid updating if the state is already being updated (prevents recursion)
    console.log("new state", newState.layout)
    if (JSON.stringify(newState) === JSON.stringify(updatedState)) {
      console.log("State is unchanged. Skipping update.");
      return; 
    }

    // console.log("State changed:", newState);
    // let updatedStateChanged = { ...newState };
    // updatedStateChanged.layout = 'yz-3d'
   
    // // setViewerState(updatedStateChanged); 
    // setUpdatedState(updatedStateChanged)
  }

  function colorChange(){


    console.log("State changed:", updatedState);
    let updatedStateChanged = { ...updatedState };
    updatedStateChanged.layout = 'yz-3d'
   
    // setViewerState(updatedStateChanged); 
    setUpdatedState(updatedStateChanged)



  }

  return (
    <>
      <button  style={{position:"absolute", backgroundColor: "red", zIndex:2000, height:"20px"}} onClick = {colorChange}></button>
      <NeuroglancerViewer
        viewerState={updatedState} // Controlled by local state
        onViewerStateChanged={handleStateChanged} // Pass the handler to Neuroglancer
      />
    </>
  );
}
