import React, { useEffect, useMemo } from 'react';
import { useReady } from '../hooks';
import { useDescription, useImageData } from '../data-hooks';
import { useCoordination, useLoaders } from '../../app/state/hooks';
import { COMPONENT_COORDINATION_TYPES } from '../../app/state/coordination';
import TitleInfo from '../TitleInfo';
import Description from './Description';
import { DataType } from '../../app/constants';

const DESCRIPTION_DATA_TYPES = [DataType.IMAGE];

/**
 * A subscriber component for a text description component.
 * Also renders a table containing image metadata.
 * @param {object} props
 * @param {string} props.theme The current theme name.
 * @param {object} props.coordinationScopes The mapping from coordination types to coordination
 * scopes.
 * @param {function} props.removeGridComponent The callback function to pass to TitleInfo,
 * to call when the component has been removed from the grid.
 * @param {string} props.title The component title.
 */
export default function DescriptionSubscriber(props) {
  const {
    coordinationScopes,
    description: descriptionOverride,
    removeGridComponent,
    theme,
    title = 'Data Set',
  } = props;

  const loaders = useLoaders();

  // Get "props" from the coordination space.
  const [{
    dataset,
    spatialImageLayer: rasterLayers,
  }] = useCoordination(COMPONENT_COORDINATION_TYPES.description, coordinationScopes);

  const [
    isReady,
    setItemIsReady,
    setItemIsNotReady, // eslint-disable-line no-unused-vars
    resetReadyItems,
  ] = useReady(
    DESCRIPTION_DATA_TYPES,
  );

  // Reset loader progress when the dataset has changed.
  useEffect(() => {
    resetReadyItems();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaders, dataset]);

  // Get data from loaders using the data hooks.
  const [description] = useDescription(loaders, dataset);
  const { image } = useImageData(
    loaders, dataset, setItemIsReady, () => {}, false, {}, {},
    {}, // TODO: which properties to match on
  );
  const { loaders: imageLayerLoaders = [], meta: imageLayerMeta = [] } = image || {};

  const metadata = useMemo(() => {
    const result = new Map();
    if (rasterLayers && rasterLayers.length > 0 && imageLayerMeta && imageLayerLoaders) {
      rasterLayers.forEach((layer) => {
        if (imageLayerMeta[layer.index]) {
          // Want to ensure that layer index is a string.
          const { format } = imageLayerLoaders[layer.index].metadata;
          result.set(`${layer.index}`, {
            name: imageLayerMeta[layer.index].name,
            metadata: format && format(),
          });
        }
      });
    }
    return result;
  }, [rasterLayers, imageLayerMeta, imageLayerLoaders]);

  return (
    <TitleInfo
      title={title}
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
