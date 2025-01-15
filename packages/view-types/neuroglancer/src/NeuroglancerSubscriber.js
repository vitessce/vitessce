import React from 'react';
import {
  TitleInfo,
} from '@vitessce/vit-s';
// import Neuroglancer from './Neuroglancer.js';
import NeuroglancerViewer from '@vitessce/neuroglancer-plugin';

export function NeuroglancerSubscriber(props) {
  const defaultViewerState = {
    layers: {
      greyscale: {
        type: 'image',
        source: 'dvid://https://flyem.dvid.io/ab6e610d4fe140aba0e030645a1d7229/grayscalejpeg',
      },
      segmentation: {
        type: 'segmentation',
        source: 'dvid://https://flyem.dvid.io/d925633ed0974da78e2bb5cf38d01f4d/segmentation',
        segments: [],
      },
    },
    perspectiveZoom: 50,
    navigation: {
      zoomFactor: 8,
    },
    segments: [],
  };
  return (
    <>
      <NeuroglancerViewer />
    </>
  );
}