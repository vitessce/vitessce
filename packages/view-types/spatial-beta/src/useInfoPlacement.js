import { useMemo } from 'react';
import { InfoPlacementTypes } from '@vitessce/utils';

/**
 * Custom hook to determine the default info placement for the spatial view.
 * Takes into account whether channel names are visible and the rendering mode.
 *
 * @param {object} params
 * @param {string[]} params.imageLayerScopes - Array of image layer scope names
 * @param {Array} params.imageLayerCoordination - Image layer coordination values
 * @param {object} params.imageChannelScopesByLayer - Channel scopes organized by layer
 * @param {Array} params.imageChannelCoordination - Image channel coordination values
 * @param {boolean} params.is3dMode - Whether the view is in 3D mode
 * @returns {string} The default info placement type
 */
export function useInfoPlacementForSpatialView({
  imageLayerScopes,
  imageLayerCoordination,
  imageChannelScopesByLayer,
  imageChannelCoordination,
  is3dMode,
}) {
  // Check if any channel names will be displayed
  const hasChannelNamesVisible = useMemo(() => {
    if (!imageLayerScopes || !imageLayerCoordination || !imageChannelCoordination) {
      return false;
    }

    return imageLayerScopes.some((layerScope) => {
      const layerCoordination = imageLayerCoordination[0]?.[layerScope];
      const channelScopes = imageChannelScopesByLayer?.[layerScope];
      const channelCoordination = imageChannelCoordination[0]?.[layerScope];

      if (!layerCoordination || !channelScopes || !channelCoordination) {
        return false;
      }

      const {
        spatialLayerVisible,
        photometricInterpretation,
        spatialChannelLabelsVisible,
        spatialLayerColormap,
      } = layerCoordination;

      // Channel names are only shown when not RGB, no colormap, and labels are visible
      if (photometricInterpretation === 'RGB'
          || spatialLayerColormap !== null
          || !spatialChannelLabelsVisible) {
        return false;
      }

      // Check if at least one channel is visible
      return channelScopes.some((cScope) => {
        const channelCoord = channelCoordination[cScope];
        return spatialLayerVisible && channelCoord?.spatialChannelVisible;
      });
    });
  }, [
    imageLayerScopes,
    imageLayerCoordination,
    imageChannelScopesByLayer,
    imageChannelCoordination,
  ]);

  // Determine the default placement based on channel names visibility and rendering mode
  const defaultInfoPlacement = useMemo(() => {
    if (is3dMode && hasChannelNamesVisible) {
      return InfoPlacementTypes.BOTTOM_END;
    }
    if (hasChannelNamesVisible) {
      return InfoPlacementTypes.TITLE;
    }
    return InfoPlacementTypes.BOTTOM_START;
  }, [hasChannelNamesVisible, is3dMode]);

  return defaultInfoPlacement;
}
