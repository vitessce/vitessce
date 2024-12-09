import React, { useMemo } from 'react';
import {
  TitleInfo,
  useReady,
  useCoordination, useLoaders,
  useDescription, useImageData,
} from '@vitessce/vit-s';
import { ViewType, COMPONENT_COORDINATION_TYPES, ViewHelpMapping } from '@vitessce/constants-internal';
import Description from './Description.js';

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
export function DescriptionSubscriber(props) {
  const {
    coordinationScopes,
    description: descriptionOverride,
    descriptionType,
    removeGridComponent,
    theme,
    title = 'Description',
    closeButtonVisible,
    helpText = ViewHelpMapping.DESCRIPTION,
  } = props;

  const loaders = useLoaders();

  // Get "props" from the coordination space.
  const [{
    dataset,
    spatialImageLayer: rasterLayers,
  }] = useCoordination(COMPONENT_COORDINATION_TYPES[ViewType.DESCRIPTION], coordinationScopes);

  // Get data from loaders using the data hooks.
  const [description] = useDescription(loaders, dataset);
  const [{ image }, imageStatus] = useImageData(
    loaders, dataset, false, {}, {},
    {}, // TODO: which properties to match on. Revisit after #830.
  );
  const { loaders: imageLayerLoaders = [], meta: imageLayerMeta = [] } = image || {};

  const isReady = useReady([imageStatus]);

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
      closeButtonVisible={closeButtonVisible}
      removeGridComponent={removeGridComponent}
      isScroll
      theme={theme}
      isReady={isReady}
      helpText={helpText}
    >
      <Description
        description={descriptionOverride || description}
        descriptionType={descriptionType}
        metadata={metadata}
      />
    </TitleInfo>
  );
}
