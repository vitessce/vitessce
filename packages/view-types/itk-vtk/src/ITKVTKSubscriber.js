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
import clsx from 'clsx';

export function ITKVTK(props) {
  return (
    <div className="ITKVTK">
    </div>
  );
}

export function ITKVTKSubscriber(props) {
  const {
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
