import React, { useEffect, useMemo } from 'react';
import { useReady } from '../hooks';
import { useDescription, useRasterData } from '../data-hooks';
import { useCoordination, useLoaders } from '../../app/state/hooks';
import { COMPONENT_COORDINATION_TYPES } from '../../app/state/coordination';
import TitleInfo from '../TitleInfo';
import Description from './Description';

const DESCRIPTION_DATA_TYPES = ['raster'];

export default function DescriptionSubscriber(props) {
  const {
    coordinationScopes,
    description: descriptionOverride,
    removeGridComponent,
    theme,
  } = props;

  const loaders = useLoaders();

  // Get "props" from the coordination space.
  const [{
    dataset,
    spatialLayers: layers,
  }] = useCoordination(COMPONENT_COORDINATION_TYPES.description, coordinationScopes);

  const [isReady, setItemIsReady, resetReadyItems] = useReady(
    DESCRIPTION_DATA_TYPES,
  );

  // Reset loader progress when the dataset has changed.
  useEffect(() => {
    resetReadyItems();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaders, dataset]);

  // Get data from loaders using the data hooks.
  const [description] = useDescription(loaders, dataset);
  const [raster, imageLayerLoaders, imageLayerMeta] = useRasterData(
    loaders, dataset, setItemIsReady, () => {}, false,
  );

  const metadata = useMemo(() => {
    const result = new Map();
    if (layers && layers.length > 0 && raster && imageLayerMeta && imageLayerLoaders) {
      const rasterLayers = layers.filter(layer => layer.type === 'raster');
      rasterLayers.forEach((layer) => {
        if (imageLayerMeta[layer.index]) {
          // Want to ensure that layer index is a string.
          result.set(`${layer.index}`, {
            name: raster.layers[layer.index].name,
            metadata: imageLayerLoaders[layer.index].getMetadata(),
          });
        }
      });
    }
    return result;
  }, [raster, layers, imageLayerMeta, imageLayerLoaders]);

  return (
    <TitleInfo
      title="Data Set"
      removeGridComponent={removeGridComponent}
      isScroll
      theme={theme}
      isReady={isReady}
    >
      <Description
        description={descriptionOverride || description}
        metadata={metadata}
      />
    </TitleInfo>
  );
}
