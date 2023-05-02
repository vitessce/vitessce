import React, { useState } from 'react';
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
import IconButton from '@material-ui/core/IconButton';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import clsx from 'clsx';

export function ITKVTK(props) {
  return (
    <div className={classes.container}>
    </div>
  );
}

export function ITKVTKSubscriber(props) {
  const {
    coordinationScopes,
    removeGridComponent,
    theme,
    title = 'ITK-VTK',
  } = props;

  return (
    <TitleInfo
      title={title}
      theme={theme}>
      <ITKVTK/>
    </TitleInfo>
  );
}

export default class ITKVTKLoader extends AbstractTwoStepLoader {
  async load() {
    const { url, options } = this;
    const { caption } = options || {};
    const result = { url, caption };
    return Promise.resolve(new LoaderResult(
      result,
      url,
    ));
  }
}

export function register() {
  registerPluginFileType(
    FileType.NIFTI,
    DataType.NIFTI_IMAGE,
    ITKVTKLoader,
    AbstractSource,
  );
  registerPluginViewType(
    ViewType.ITK_VTK,
    StaticFigureSubscriber,
    COMPONENT_COORDINATION_TYPES[ViewType.ITK_VTK],
  );
  registerPluginCoordinationType(
    'itk-vtk',
    null,
  );
}
