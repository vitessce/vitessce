import React from 'react';
import {
  TitleInfo,
  useReady,
  useCoordination,
  useLoaders,
  useImageData,
} from '@vitessce/vit-s';
import { ViewType, COMPONENT_COORDINATION_TYPES } from '@vitessce/constants-internal';
import ThreeView from './Three.js';

/**
 * @param {object} props
 * @param {string} props.theme The current theme name.
 * @param {object} props.coordinationScopes The mapping from coordination types to coordination
 * scopes.
 * @param {function} props.removeGridComponent The callback function to pass to TitleInfo,
 * to call when the component has been removed from the grid.
 * @param {string} props.title The component title.
 */
export function ThreeSubscriber(props) {
  const {
    coordinationScopes,
    removeGridComponent,
    theme,
    title = 'Three View',
  } = props;

  const loaders = useLoaders();

  // Get "props" from the coordination space.
  const [{
    dataset,
    spatialImageLayer,
  }] = useCoordination(COMPONENT_COORDINATION_TYPES[ViewType.SPATIAL_THREE], coordinationScopes);

  // Get data from loaders using the data hooks.
  const [{ image }, imageStatus] = useImageData(
    loaders, dataset, false, {}, {},
    {}, // TODO: which properties to match on. Revisit after #830.
  );
  const { loaders: imageLayerLoaders = [], meta: imageLayerMeta = [] } = image || {};

  const isReady = useReady([imageStatus]);

  return (
    <TitleInfo
      title={title}
      removeGridComponent={removeGridComponent}
      isScroll
      theme={theme}
      isReady={isReady}
    >
      <ThreeView />
    </TitleInfo>
  );
}
