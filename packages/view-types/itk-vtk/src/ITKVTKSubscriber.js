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

const useStyles = makeStyles(() => ({
  container: {
    height: '100%',
    position: 'relative',
  }
}));

export function ITKVTK(props) {
  const [viewerState, setViewerState] = useState(false);
  const [viewer, setViewer] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      // const image = 'https://nifti.nimh.nih.gov/nifti-1/data/minimal.nii.gz';
      // const image = 'https://data.kitware.com/api/v1/file/564a65d58d777f7522dbfb61/download/data.nrrd';
      const image = 'https://data.kitware.com/api/v1/file/5b8446868d777f43cc8d5ec1/download/data.nrrd';
      const response = await fetch(image);
      return await response.blob();
    };
    fetchData()
      .then((data) => {
        console.log('Got the dataaa');
        let file = new File([data], 'data.nrrd');
        console.log('here');
        let container = document.querySelector('#test');
        itkVtkViewer.createViewerFromUrl(container, {
          fullscreen: false,
          image: 'https://data.kitware.com/api/v1/file/5b8446868d777f43cc8d5ec1/download/data.nrrd'
        })
          .then((viewer) => {
            viewer.setBackgroundColor([0, 0, 0]);
            viewer.setUICollapsed(false);
            viewer.setAnnotationsEnabled(false);
            viewer.setCroppingPlanesEnabled(false);
          });
      })
      .catch((error) => {
        console.log('Here with an Error: ' + error);
      });
  }, [viewerState, viewer]);
  return (<div id={'test'} style={{ height: '100%' }}></div>);
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
      isReady={ready}
      removeGridComponent={removeGridComponent}
      theme={theme}>
      <div className={classes.container}>
        <ITKVTK/>
      </div>
    </TitleInfo>
  );
}

const ready = true;

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
