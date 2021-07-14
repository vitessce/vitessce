/* eslint-disable */
import React, { useState, useEffect } from 'react';
import TitleInfo from '../TitleInfo';
import DimensionController from './DimensionController';
import { useReady } from '../hooks';
import { useMoleculesData } from '../data-hooks';
import {
  useCoordination,
  useLoaders,
} from '../../app/state/hooks';

import { COMPONENT_COORDINATION_TYPES } from '../../app/state/coordination';

const DIMENSION_CONTROLLER_DATA_TYPES = ['molecules'];

export default function DimensionControllerSubscriber(props) {
  const {
    title = "Dimensions",
    removeGridComponent,
    theme,
    coordinationScopes,
  } = props;

  const loaders = useLoaders();

  // Get "props" from the coordination space.
  const [
    {
      dataset,
      spatialRasterLayers: rasterLayers,
      spatialCellsLayer: cellsLayer,
      spatialMoleculesLayer: moleculesLayer,
    },
    {
      setSpatialRasterLayers: setRasterLayers,
      setSpatialCellsLayer: setCellsLayer,
      setSpatialMoleculesLayer: setMoleculesLayer,
    },
  ] = useCoordination(
    COMPONENT_COORDINATION_TYPES.dimensionController,
    coordinationScopes,
  );
  
  const [isReady, setItemIsReady, resetReadyItems] = useReady(
    DIMENSION_CONTROLLER_DATA_TYPES,
  );

  // Reset loader progress when the dataset has changed.
  useEffect(() => {
    resetReadyItems();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaders, dataset]);

  const [molecules, moleculesCount, locationsCount, moleculesDimRanges] = useMoleculesData(
    loaders, dataset, setItemIsReady, () => {}, false,
  );

  console.log(moleculesDimRanges)

  return (
    <TitleInfo
      title={title}
      isScroll
      removeGridComponent={removeGridComponent}
      theme={theme}
      isReady={isReady}
    >
      <DimensionController
        z={0}
        zRange={moleculesDimRanges.z}
      />
    </TitleInfo>
  );
}