import React, { useState, useEffect } from 'react';
import 'itk-vtk-viewer/dist/itkVtkViewer.js';

import {
  TitleInfo,
  useCoordination,
  registerPluginViewType,
  registerPluginFileType,
  registerPluginCoordinationType,
  AbstractTwoStepLoader,
  LoaderResult,
  useMultiFigures,
  useLoaders,
  useUrls,
  useReady,
} from '@vitessce/vit-s';
import {
  FileType,
  DataType,
  ViewType,
  COMPONENT_COORDINATION_TYPES,
} from '@vitessce/constants-internal';
import { makeStyles } from '@material-ui/core';
import { createViewerFromUrl, processURLParameters } from 'itk-vtk-viewer/src';

const useStyles = makeStyles(() => ({
  container: {
    height: '100%',
    position: 'relative',
  }
}));

export function ITKVTK(props) {
  useEffect(() => {
    const image = 'https://nifti.nimh.nih.gov/nifti-1/data/minimal.nii.gz';
    const container = document.querySelector('#test');
    itkVtkViewer.createViewerFromUrl(container, { fullscreen: false })
      .then((viewer) => {
        console.log("Here")
        viewer.setBackgroundColor([0, 0, 0])
      })
  });

  return (<div id={'test'} style={{height:'100%'}}></div>);
}

export function ITKVTKSubscriber(props) {
  const {
    removeGridComponent,
    theme,
    title = 'ITK-VTK',
  } = props;

  const classes = useStyles();

  return (
    <TitleInfo
      title={title}
      isReady={isReady}
      removeGridComponent={removeGridComponent}
      theme={theme}>
      <div className={classes.container}>
        <ITKVTK/>
      </div>
    </TitleInfo>
  );
}

const isReady = true;

export default class ITKVTKLoader extends AbstractTwoStepLoader {
  async load() {
    const {
      url,
      options
    } = this;
    const { caption } = options || {};
    const result = {
      url,
      caption
    };
    return Promise.resolve(new LoaderResult(
      result,
      url,
    ));
  }
}

class AbstractSource {
  // No-op
}

export function register() {
  registerPluginFileType(
    FileType.NIFTI,
    DataType.NIFTI_IMAGE,
    ITKVTKLoader,
    AbstractSource,
  );
  registerPluginFileType(
    FileType.NIFTI_COMPRESSED,
    DataType.NIFTI_IMAGE,
    ITKVTKLoader,
    AbstractSource,
  );
  registerPluginViewType(
    ViewType.ITK_VTK,
    ITKVTKSubscriber,
    COMPONENT_COORDINATION_TYPES[ViewType.ITK_VTK],
  );
  registerPluginCoordinationType(
    'itk-vtk',
    null,
  );
}
