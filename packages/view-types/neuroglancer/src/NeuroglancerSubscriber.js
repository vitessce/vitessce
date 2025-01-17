import React from 'react';
import {
  TitleInfo,
} from '@vitessce/vit-s';
// import Neuroglancer from './Neuroglancer.js';
import NeuroglancerViewer from '@vitessce/neuroglancer-plugin';

export function NeuroglancerSubscriber(props) {
  console.log(props.viewerState)
  return (
    <>
      <NeuroglancerViewer viewerState={props.viewerState}/>
    </>
  );
}