/* eslint-disable no-nested-ternary */
/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
import React, { useEffect, useMemo, useCallback, useState } from 'react';
import { debounce } from 'lodash-es';
import {
  TitleInfo,
  useDeckCanvasSize, useReady, useUrls,
  useObsLocationsData,
  useObsSegmentationsData,
  useObsSetsData,
  useFeatureSelection,
  useImageData,
  useObsFeatureMatrixIndices,
  useFeatureLabelsData,
  useNeighborhoodsData,
  useObsLabelsData,
  useMultiObsLabels,
  useMultiObsSpots,
  useMultiObsPoints,
  useSpotMultiObsSets,
  useMultiObsSegmentations,
  useMultiImages,
  useSpotMultiFeatureSelection,
  useSpotMultiObsFeatureMatrixIndices,
  useSegmentationMultiFeatureSelection,
  useSegmentationMultiObsFeatureMatrixIndices,
  useSegmentationMultiObsLocations,
  useSegmentationMultiObsSets,
  useUint8FeatureSelection,
  useExpressionValueGetter,
  useInitialCoordination,
  useCoordination,
  useLoaders,
  useSetComponentHover,
  useSetComponentViewInfo,
  useAuxiliaryCoordination,
  useHasLoader,
  useComplexCoordination,
  useMultiCoordinationScopes,
  useMultiCoordinationScopesNonNull,
  useMultiCoordinationScopesSecondary,
  useMultiCoordinationScopesSecondaryNonNull,
  useComplexCoordinationSecondary,
  useCoordinationScopes,
  useCoordinationScopesBy,
} from '@vitessce/vit-s';
import { commaNumber, getCellColors } from '@vitessce/utils';
import { canLoadResolution } from '@vitessce/spatial-utils';
import { COMPONENT_COORDINATION_TYPES, ViewType, DataType, CoordinationType } from '@vitessce/constants-internal';
import { setObsSelection, mergeObsSets } from '@vitessce/sets-utils';
import { MultiLegend } from '@vitessce/legend';
import Spatial from './Spatial.js';
import SpatialOptions from './SpatialOptions.js';
import SpatialTooltipSubscriber from './SpatialTooltipSubscriber.js';
import { makeSpatialSubtitle, getInitialSpatialTargets } from './utils.js';


// Reference: https://deck.gl/docs/api-reference/core/orbit-view#view-state
const DEFAULT_VIEW_STATE = {
  zoom: 0,
  target: [0, 0, 0],
  rotationX: 0,
  rotationOrbit: 0,
};
const SET_VIEW_STATE_NOOP = () => {};


const tempLayer = [{
  index: 0,
  colormap: null,
  domainType: 'Min/Max',
  modelMatrix: undefined,
  opacity: 1,
  renderingMode: 'Additive',
  transparentColor: null,
  type: 'bitmask',
  use3d: false,
  visible: true,
  channels: [
    {
      selection: { t: 0, z: 0, c: undefined }, // should fill in c.
      visible: true,
      slider: [0, 1],
      color: [255, 255, 255],
    },
  ],
}];

function getHoverData(hoverInfo, layerType) {
  const { coordinate, sourceLayer: layer, tile } = hoverInfo;
  if(layerType === 'segmentation-bitmask' || layerType === 'image') {
    if(coordinate && layer) {
      if (layer.id.startsWith('Tiled') && tile) {
        // Adapted from https://github.com/hms-dbmi/viv/blob/2b28cc1db6ad1dacb44e6b1cd145ae90c46a2ef3/packages/viewers/src/VivViewer.jsx#L209
        const {
          content,
          bbox,
          index: { z },
        } = tile;
        if(content) {
          const { data, width, height } = content;
          const {
            left, right, top, bottom,
          } = bbox;
          const bounds = [
            left,
            data.height < layer.tileSize ? height : bottom,
            data.width < layer.tileSize ? width : right,
            top,
          ];
          // Tiled layer needs a custom layerZoomScale.
          // The zoomed out layer needs to use the fixed zoom at which it is rendered.
          const layerZoomScale = Math.max(
            1,
            2 ** Math.round(-z),
          );
          const dataCoords = [
            Math.floor((coordinate[0] - bounds[0]) / layerZoomScale),
            Math.floor((coordinate[1] - bounds[3]) / layerZoomScale),
          ];
          const coords = dataCoords[1] * width + dataCoords[0];
          const hoverData = data.map(d => d[coords]);
          return hoverData;
        }
      }
    }
  }
  if(layerType === 'segmentation-polygon' || layerType === 'spot' || layerType === 'point') {
    if(hoverInfo.index) {
      if(layerType === 'segmentation-polygon') {
        // To match 'segmentation-bitmask', we return an array of one index per channel.
        // For 'segmentation-polygon', we assume one channel per layer.
        return [hoverInfo.index];
      } else {
        return hoverInfo.index;
      }
    }
  }
  // TODO: point
  // TODO: spot
  // TODO: polygon segmentations
  return null;
}

/**
 * A subscriber component for the spatial plot.
 * @param {object} props
 * @param {string} props.theme The current theme name.
 * @param {object} props.coordinationScopes The mapping from coordination types to coordination
 * scopes.
 * @param {function} props.removeGridComponent The callback function to pass to TitleInfo,
 * to call when the component has been removed from the grid.
 * @param {string} props.title The component title.
 */
export function SpatialSubscriber(props) {
  const {
    uuid,
    coordinationScopes: coordinationScopesRaw,
    coordinationScopesBy: coordinationScopesByRaw,
    removeGridComponent,
    observationsLabelOverride,
    subobservationsLabelOverride: subobservationsLabel = 'molecule',
    theme,
    disableTooltip = false,
    title = 'Spatial',
    disable3d,
    globalDisable3d,
    useFullResolutionImage = {},
  } = props;

  const loaders = useLoaders();
  const setComponentHover = useSetComponentHover();
  const setComponentViewInfo = useSetComponentViewInfo(uuid);

  // Acccount for possible meta-coordination.
  const coordinationScopes = useCoordinationScopes(coordinationScopesRaw);
  const coordinationScopesBy = useCoordinationScopesBy(coordinationScopes, coordinationScopesByRaw);

  // Get "props" from the coordination space.
  const [{
    dataset,
    obsType,
    featureType,
    featureValueType,
    spatialZoom: zoom,
    spatialTargetX: targetX,
    spatialTargetY: targetY,
    spatialTargetZ: targetZ,
    spatialTargetT: targetT,
    spatialRenderingMode,
    spatialRotationX: rotationX,
    spatialRotationOrbit: rotationOrbit,
    spatialOrbitAxis: orbitAxis,
    segmentationLayer: cellsLayer,
    spatialPointLayer: moleculesLayer,
    //spatialNeighborhoodLayer: neighborhoodsLayer,
    //obsFilter: cellFilter,
    obsHighlight: cellHighlight,
    //featureSelection: geneSelection,
    obsSetSelection: cellSetSelection,
    obsSetColor: cellSetColor,
    //obsColorEncoding: cellColorEncoding,
    additionalObsSets: additionalCellSets,
    spatialAxisFixed,
    //featureValueColormap: geneExpressionColormap,
    //featureValueColormapRange: geneExpressionColormapRange,
  }, {
    setSpatialZoom: setZoom,
    setSpatialTargetX: setTargetX,
    setSpatialTargetY: setTargetY,
    setSpatialTargetZ: setTargetZ,
    setSpatialRotationX: setRotationX,
    setSpatialRotationOrbit: setRotationOrbit,
    //setSpatialOrbitAxis: setOrbitAxis,
    setSegmentationLayer: setCellsLayer,
    setSpatialPointLayer: setMoleculesLayer,
    //setSpatialNeighborhoodLayer: setNeighborhoodsLayer,
    setObsFilter: setCellFilter,
    setObsSetSelection: setCellSetSelection,
    //setObsHighlight: setCellHighlight,
    setObsSetColor: setCellSetColor,
    setObsColorEncoding: setCellColorEncoding,
    setAdditionalObsSets: setAdditionalCellSets,
    //setMoleculeHighlight,
    //setSpatialAxisFixed,
    //setFeatureValueColormap: setGeneExpressionColormap,
    //setFeatureValueColormapRange: setGeneExpressionColormapRange,
  }] = useCoordination(COMPONENT_COORDINATION_TYPES[ViewType.SPATIAL_BETA], coordinationScopes);

  const {
    spatialZoom: initialZoom,
    spatialTargetX: initialTargetX,
    spatialTargetY: initialTargetY,
    spatialTargetZ: initialTargetZ,
  } = useInitialCoordination(
    COMPONENT_COORDINATION_TYPES[ViewType.SPATIAL_BETA], coordinationScopes,
  );

  const observationsLabel = observationsLabelOverride || obsType;

  const [segmentationLayerScopes, segmentationChannelScopesByLayer] = useMultiCoordinationScopesSecondaryNonNull(
    CoordinationType.SEGMENTATION_CHANNEL,
    CoordinationType.SEGMENTATION_LAYER,
    coordinationScopes,
    coordinationScopesBy,
  );

  const [imageLayerScopes, imageChannelScopesByLayer] = useMultiCoordinationScopesSecondaryNonNull(
    CoordinationType.IMAGE_CHANNEL,
    CoordinationType.IMAGE_LAYER,
    coordinationScopes,
    coordinationScopesBy,
  );

  const spotLayerScopes = useMultiCoordinationScopesNonNull(
    CoordinationType.SPOT_LAYER,
    coordinationScopes,
  );

  const pointLayerScopes = useMultiCoordinationScopesNonNull(
    CoordinationType.POINT_LAYER,
    coordinationScopes,
  );

  const hasObsLayers = segmentationLayerScopes.length > 0 || spotLayerScopes.length > 0;

  // Object keys are coordination scope names for spatialSegmentationLayer.
  const segmentationLayerCoordination = useComplexCoordination(
    [
      CoordinationType.FILE_UID,
      CoordinationType.SEGMENTATION_CHANNEL,
      CoordinationType.SPATIAL_LAYER_VISIBLE,
      CoordinationType.SPATIAL_LAYER_OPACITY,
    ],
    coordinationScopes,
    coordinationScopesBy,
    CoordinationType.SEGMENTATION_LAYER,
  );

  // Object keys are coordination scope names for spatialSegmentationChannel.
  const segmentationChannelCoordination = useComplexCoordinationSecondary(
    [
      CoordinationType.OBS_TYPE,
      CoordinationType.SPATIAL_TARGET_C,
      CoordinationType.SPATIAL_CHANNEL_VISIBLE,
      CoordinationType.SPATIAL_CHANNEL_OPACITY,
      CoordinationType.SPATIAL_CHANNEL_COLOR,
      CoordinationType.SPATIAL_SEGMENTATION_FILLED,
      CoordinationType.SPATIAL_SEGMENTATION_STROKE_WIDTH,
      CoordinationType.OBS_COLOR_ENCODING,
      CoordinationType.FEATURE_SELECTION,
      CoordinationType.FEATURE_VALUE_COLORMAP,
      CoordinationType.FEATURE_VALUE_COLORMAP_RANGE,
      CoordinationType.OBS_SET_COLOR,
      CoordinationType.OBS_SET_SELECTION,
      CoordinationType.ADDITIONAL_OBS_SETS,
      CoordinationType.OBS_HIGHLIGHT,
    ],
    coordinationScopes,
    coordinationScopesBy,
    CoordinationType.SEGMENTATION_LAYER,
    CoordinationType.SEGMENTATION_CHANNEL,
  );

  const imageLayerCoordination = useComplexCoordination(
    [
      CoordinationType.FILE_UID,
      CoordinationType.IMAGE_CHANNEL,
      CoordinationType.SPATIAL_LAYER_VISIBLE,
      CoordinationType.SPATIAL_LAYER_OPACITY,
      CoordinationType.SPATIAL_LAYER_COLORMAP,
      CoordinationType.SPATIAL_LAYER_TRANSPARENT_COLOR,
      CoordinationType.SPATIAL_LAYER_MODEL_MATRIX,
      CoordinationType.VOLUMETRIC_RENDERING_ALGORITHM,
      CoordinationType.SPATIAL_TARGET_RESOLUTION,
      CoordinationType.SPATIAL_SLICE_X,
      CoordinationType.SPATIAL_SLICE_Y,
      CoordinationType.SPATIAL_SLICE_Z,
      CoordinationType.PHOTOMETRIC_INTERPRETATION,
      CoordinationType.PIXEL_HIGHLIGHT,
    ],
    coordinationScopes,
    coordinationScopesBy,
    CoordinationType.IMAGE_LAYER,
  );

  // Object keys are coordination scope names for spatialImageChannel.
  const imageChannelCoordination = useComplexCoordinationSecondary(
    [
      CoordinationType.SPATIAL_TARGET_C,
      CoordinationType.SPATIAL_CHANNEL_VISIBLE,
      CoordinationType.SPATIAL_CHANNEL_COLOR,
      CoordinationType.SPATIAL_CHANNEL_WINDOW,
    ],
    coordinationScopes,
    coordinationScopesBy,
    CoordinationType.IMAGE_LAYER,
    CoordinationType.IMAGE_CHANNEL,
  );

  // Spot layer
  const spotLayerCoordination = useComplexCoordination(
    [
      CoordinationType.OBS_TYPE,
      CoordinationType.SPATIAL_LAYER_VISIBLE,
      CoordinationType.SPATIAL_LAYER_OPACITY,
      CoordinationType.SPATIAL_SPOT_RADIUS,
      CoordinationType.SPATIAL_SPOT_FILLED,
      CoordinationType.SPATIAL_SPOT_STROKE_WIDTH,
      CoordinationType.OBS_COLOR_ENCODING,
      CoordinationType.FEATURE_SELECTION,
      CoordinationType.FEATURE_VALUE_COLORMAP,
      CoordinationType.FEATURE_VALUE_COLORMAP_RANGE,
      CoordinationType.OBS_SET_COLOR,
      CoordinationType.OBS_SET_SELECTION,
      CoordinationType.ADDITIONAL_OBS_SETS,
      CoordinationType.SPATIAL_LAYER_COLOR,
      CoordinationType.OBS_HIGHLIGHT,
    ],
    coordinationScopes,
    coordinationScopesBy,
    CoordinationType.SPOT_LAYER,
  );

  // Point layer
  const pointLayerCoordination = useComplexCoordination(
    [
      CoordinationType.OBS_TYPE,
      CoordinationType.SPATIAL_LAYER_VISIBLE,
      CoordinationType.SPATIAL_LAYER_OPACITY,
      CoordinationType.OBS_COLOR_ENCODING,
      CoordinationType.FEATURE_SELECTION,
      CoordinationType.FEATURE_VALUE_COLORMAP,
      CoordinationType.FEATURE_VALUE_COLORMAP_RANGE,
      CoordinationType.SPATIAL_LAYER_COLOR,
      CoordinationType.OBS_HIGHLIGHT,
    ],
    coordinationScopes,
    coordinationScopesBy,
    CoordinationType.POINT_LAYER,
  );
  
  /*
  const [
    {
      imageLayerCallbacks,
      segmentationLayerCallbacks,
    },
  ] = useAuxiliaryCoordination(
    COMPONENT_COORDINATION_TYPES.layerController,
    coordinationScopes,
  );
  */

  const is3dMode = spatialRenderingMode === '3D';
  const imageLayers = []; // TODO: remove

  const [width, height, deckRef] = useDeckCanvasSize();

  const [obsLabelsTypes, obsLabelsData] = useMultiObsLabels(
    coordinationScopes, obsType, loaders, dataset,
  );

  // Points data
  const [obsPointsData, obsPointsDataStatus, obsPointsUrls] = useMultiObsPoints(
    coordinationScopes, coordinationScopesBy, loaders, dataset,
  );
  
  // Spots data
  const [obsSpotsData, obsSpotsDataStatus, obsSpotsUrls] = useMultiObsSpots(
    coordinationScopes, coordinationScopesBy, loaders, dataset,
  );

  const [obsSpotsSetsData, obsSpotsSetsDataStatus] = useSpotMultiObsSets(
    coordinationScopes, coordinationScopesBy, loaders, dataset,
  );

  const [
    spotMultiExpressionData,
    spotMultiLoadedFeatureSelection,
    spotMultiExpressionExtents,
    spotMultiExpressionNormData,
    spotMultiFeatureSelectionStatus,
  ] = useSpotMultiFeatureSelection(
    coordinationScopes, coordinationScopesBy, loaders, dataset,
  );

  const [spotMultiIndicesData, spotMultiIndicesDataStatus] = useSpotMultiObsFeatureMatrixIndices(
    coordinationScopes, coordinationScopesBy, loaders, dataset,
  );

  // Segmentations data
  const [obsSegmentationsLocationsData, obsSegmentationsLocationsDataStatus] = useSegmentationMultiObsLocations(
    coordinationScopes, coordinationScopesBy, loaders, dataset,
  );

  const [obsSegmentationsData, obsSegmentationsDataStatus, obsSegmentationsUrls] = useMultiObsSegmentations(
    coordinationScopes, coordinationScopesBy, loaders, dataset,
  );

  const [obsSegmentationsSetsData, obsSegmentationsSetsDataStatus] = useSegmentationMultiObsSets(
    coordinationScopes, coordinationScopesBy, loaders, dataset,
  );

  const [
    segmentationMultiExpressionData,
    segmentationMultiLoadedFeatureSelection,
    segmentationMultiExpressionExtents,
    segmentationMultiExpressionNormData,
    segmentationMultiFeatureSelectionStatus,
  ] = useSegmentationMultiFeatureSelection(
    coordinationScopes, coordinationScopesBy, loaders, dataset,
  );

  const [segmentationMultiIndicesData, segmentationMultiIndicesDataStatus] = useSegmentationMultiObsFeatureMatrixIndices(
    coordinationScopes, coordinationScopesBy, loaders, dataset,
  );

  // Image data
  const [imageData, imageDataStatus, imageUrls] = useMultiImages(
    coordinationScopes, coordinationScopesBy, loaders, dataset,
  );


  /*
  const hasExpressionData = useHasLoader(
    loaders, dataset, DataType.OBS_FEATURE_MATRIX,
    { obsType, featureType, featureValueType },
    // TODO: get per-spatialLayerType expression data once #1240 is merged.
  );
  const hasSegmentationsData = Object.entries(obsSegmentationsData).length > 0;
  const hasLocationsData = useHasLoader(
    loaders, dataset, DataType.OBS_LOCATIONS,
    { obsType }, // TODO: use obsType in matchOn once #1240 is merged.
  );
  const hasImageData = useHasLoader(
    loaders, dataset, DataType.IMAGE,
    {}, // TODO: which properties to match on. Revisit after #830.
  );
  */
  // Get data from loaders using the data hooks.
  const [{
    obsIndex: obsLocationsIndex,
    obsLocations,
  }, obsLocationsStatus, obsLocationsUrls] = useObsLocationsData(
    loaders, dataset, false,
    { setSpatialPointLayer: setMoleculesLayer },
    { spatialPointLayer: moleculesLayer },
    { obsType: 'molecule' }, // TODO: use dynamic obsType in matchOn once #1240 is merged.
  );
  const [{
    obsLabels: obsLocationsLabels,
  }, obsLabelsStatus, obsLabelsUrls] = useObsLabelsData(
    loaders, dataset, false, {}, {},
    { obsType: 'molecule' }, // TODO: use obsType in matchOn once #1240 is merged.
  );
  const [{
    obsIndex: obsCentroidsIndex,
    obsLocations: obsCentroids,
  }, obsCentroidsStatus, obsCentroidsUrls] = useObsLocationsData(
    loaders, dataset, false, {}, {},
    { obsType }, // TODO: use dynamic obsType in matchOn once #1240 is merged.
  );
  const [{
    obsIndex: obsSegmentationsIndex,
    obsSegmentations,
    obsSegmentationsType,
  }, obsSegmentationsStatus] = useObsSegmentationsData(
    loaders, dataset, false,
    { setSpatialSegmentationLayer: setCellsLayer },
    { spatialSegmentationLayer: cellsLayer },
    { obsType }, // TODO: use obsType in matchOn once #1240 is merged.
  );
  const [{ obsSets: cellSets, obsSetsMembership }, obsSetsStatus, obsSetsUrls] = useObsSetsData(
    loaders, dataset, false,
    { setObsSetSelection: setCellSetSelection, setObsSetColor: setCellSetColor },
    { obsSetSelection: cellSetSelection, obsSetColor: cellSetColor },
    { obsType },
  );
  /*
  // eslint-disable-next-line no-unused-vars
  const [expressionData, loadedFeatureSelection, featureSelectionStatus] = useFeatureSelection(
    loaders, dataset, false, geneSelection,
    { obsType, featureType, featureValueType },
  );
  */
  const [
    { obsIndex: matrixObsIndex }, matrixIndicesStatus, matrixIndicesUrls,
  ] = useObsFeatureMatrixIndices(
    loaders, dataset, false,
    { obsType, featureType, featureValueType },
  );

  /*
  const [{ image }, imageStatus] = useImageData(
    loaders, dataset, false,
    {},
    {},
    {}, // TODO: which properties to match on. Revisit after #830.
  );
  */

  /*
  const [neighborhoods, neighborhoodsStatus, neighborhoodsUrls] = useNeighborhoodsData(
    loaders, dataset, false,
    { setSpatialNeighborhoodLayer: setNeighborhoodsLayer },
    { spatialNeighborhoodLayer: neighborhoodsLayer },
  );
  */

  // TODO: per-layer featureLabels
  /*
  const [{ featureLabelsMap }, featureLabelsStatus, featureLabelsUrls] = useFeatureLabelsData(
    loaders, dataset, false, {}, {},
    { featureType },
  );
  */

  const isReadyToComputeInitialViewState = useReady([
    obsSpotsDataStatus,
    obsSegmentationsDataStatus,
    imageDataStatus,
  ]);

  const isReady = useReady([
    // Spots
    obsSpotsDataStatus,
    obsSpotsSetsDataStatus,
    spotMultiFeatureSelectionStatus,
    spotMultiIndicesDataStatus,
    // Points
    obsPointsDataStatus,
    // Segmentations
    obsSegmentationsDataStatus,
    obsSegmentationsSetsDataStatus,
    segmentationMultiFeatureSelectionStatus,
    segmentationMultiIndicesDataStatus,
    obsSegmentationsLocationsDataStatus,
    // Images
    imageDataStatus,
  ]);
  const urls = useUrls([
    Object.values(obsSpotsUrls || {}).flat(),
    Object.values(obsPointsUrls || {}).flat(),
    Object.values(obsSegmentationsUrls || {}).flat(),
    Object.values(imageUrls || {}).flat(),
    // TODO: more urls
    // TODO: a bit of memoization
  ]);

  const [originalViewState, setOriginalViewState] = useState(null);

  // Compute initial viewState values to use if targetX and targetY are not
  // defined in the initial configuration.
  const {
    initialTargetX: defaultTargetX, initialTargetY: defaultTargetY,
    initialTargetZ: defaultTargetZ, initialZoom: defaultZoom,
  } = useMemo(() => getInitialSpatialTargets({
    width,
    height,
    // TODO: obsPoints
    // TODO: obsLocations for obsSegmentations
    obsSpots: obsSpotsData,
    obsSegmentations: obsSegmentationsData,
    images: imageData,
    is3dMode,
    isReady: isReadyToComputeInitialViewState
  }),
  // Deliberate dependency omissions: imageLayerLoaders and meta - using `image` as
  // an indirect dependency instead.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [imageData, is3dMode, obsSegmentationsData,
    width, height, obsSpotsData, isReadyToComputeInitialViewState,
  ]);

  useEffect(() => {
    // If it has not already been set, set the initial view state using
    // the auto-computed values from the useMemo above.
    if (width && height) {
      if (typeof initialTargetX !== 'number' || typeof initialTargetY !== 'number') {
        const notYetInitialized = (typeof targetX !== 'number' || typeof targetY !== 'number');
        const stillDefaultInitialized = (targetX === defaultTargetX && targetY === defaultTargetY);
        if (notYetInitialized || stillDefaultInitialized) {
          setTargetX(defaultTargetX);
          setTargetY(defaultTargetY);
          setTargetZ(defaultTargetZ);
          setZoom(defaultZoom);
        }
        setOriginalViewState(
          { target: [defaultTargetX, defaultTargetY, defaultTargetZ], zoom: defaultZoom },
        );
      } else if (!originalViewState) {
        // originalViewState has not yet been set and
        // the view config defined an initial viewState.
        setOriginalViewState({
          target: [initialTargetX, initialTargetY, initialTargetZ], zoom: initialZoom,
        });
      }
    }
    // Deliberate dependency omissions: targetX, targetY
    // since we do not this to re-run on every single zoom/pan interaction.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultTargetX, defaultTargetY, defaultTargetZ, defaultZoom,
    initialTargetX, initialTargetY, initialTargetZ, initialZoom,
  ]);



  const obsLocationsFeatureIndex = useMemo(() => {
    if (obsLocationsLabels) {
      return Array.from(new Set(obsLocationsLabels));
    }
    return null;
  }, [obsLocationsLabels]);
  const moleculesCount = obsLocationsFeatureIndex?.length || 0;
  const locationsCount = obsLocationsIndex?.length || 0;

  const mergedCellSets = useMemo(() => mergeObsSets(
    cellSets, additionalCellSets,
  ), [cellSets, additionalCellSets]);

  const setCellSelectionProp = useCallback((v) => {
    setObsSelection(
      v, additionalCellSets, cellSetColor,
      setCellSetSelection, setAdditionalCellSets, setCellSetColor,
      setCellColorEncoding,
    );
  }, [additionalCellSets, cellSetColor, setCellColorEncoding,
    setAdditionalCellSets, setCellSetColor, setCellSetSelection]);

  /*
  const cellColors = useMemo(() => getCellColors({
    cellColorEncoding,
    expressionData: expressionData && expressionData[0],
    geneSelection,
    cellSets: mergedCellSets,
    cellSetSelection,
    cellSetColor,
    obsIndex: matrixObsIndex,
    theme,
  }), [cellColorEncoding, geneSelection, mergedCellSets, theme,
    cellSetColor, cellSetSelection, expressionData, matrixObsIndex]);

  const cellSelection = useMemo(() => Array.from(cellColors.keys()), [cellColors]);
  */

  const setViewState = ({
    zoom: newZoom,
    target,
    rotationX: newRotationX,
    rotationOrbit: newRotationOrbit,
  }) => {
    setZoom(newZoom);
    setTargetX(target[0]);
    setTargetY(target[1]);
    if (is3dMode) {
      if (target[2] !== undefined) {
        setTargetZ(target[2]);
      }
      setRotationX(newRotationX);
      setRotationOrbit(newRotationOrbit);
    }
  };

  const subtitle = makeSpatialSubtitle({
    observationsCount: obsSegmentationsIndex?.length || matrixObsIndex?.length,
    observationsLabel,
    subobservationsCount: moleculesCount,
    subobservationsLabel,
    locationsCount,
  });

  /*
  const [uint8ExpressionData, expressionExtents] = useUint8FeatureSelection(expressionData);
  */

  // The bitmask layer needs access to a array (i.e a texture) lookup of cell -> expression value
  // where each cell id indexes into the array.
  // Cell ids in `attrs.rows` do not necessaryily correspond to indices in that array, though,
  // so we create a "shifted" array where this is the case.
  /*
  const shiftedExpressionDataForBitmask = useMemo(() => {
    if (matrixObsIndex && uint8ExpressionData && obsSegmentationsType === 'bitmask') {
      const maxId = matrixObsIndex.reduce((max, curr) => Math.max(max, Number(curr)));
      const result = new Uint8Array(maxId + 1);
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < matrixObsIndex.length; i++) {
        const id = matrixObsIndex[i];
        result.set(uint8ExpressionData[0].slice(i, i + 1), Number(id));
      }
      return [result];
    } return [new Uint8Array()];
  }, [matrixObsIndex, uint8ExpressionData, obsSegmentationsType]);
  */

  // Set up a getter function for gene expression values, to be used
  // by the DeckGL layer to obtain values for instanced attributes.
  /*
  const getExpressionValue = useExpressionValueGetter({
    // eslint-disable-next-line no-unneeded-ternary
    instanceObsIndex: (obsSegmentationsIndex
      // When there are polygon cell segmentations.
      ? obsSegmentationsIndex
      // When there are not polygon cell segmentations, and we need to make fake diamonds.
      : obsCentroidsIndex
    ),
    matrixObsIndex,
    expressionData: uint8ExpressionData,
  });
  */
  /*
  useEffect(() => {
    // For backwards compatibility (diamond case).
    // Log to the console to alert the user that the auto-generated diamonds are being used.
    if (!hasSegmentationsData
      && cellsLayer && !obsSegmentations && !obsSegmentationsIndex
      && obsCentroids && obsCentroidsIndex
    ) {
      console.warn('Rendering cell segmentation diamonds for backwards compatibility.');
    }
  }, [hasSegmentationsData, cellsLayer, obsSegmentations, obsSegmentationsIndex,
    obsCentroids, obsCentroidsIndex,
  ]);
  */

  //const [hoverData, setHoverData] = useState(null);
  const [hoverCoord, setHoverCoord] = useState(null);

  // Should hover position be used for tooltips?
  // If there are centroids for each observation, then we can use those
  // to position tooltips. However if there are not centroids,
  // the other option is to use the mouse location.
  const useHoverInfoForTooltip = true; // TODO: use per-segmentation-channel obsLocations

  /*
  const getObsInfo = useCallback((hoveredChannelData) => {
    if (hoveredChannelData) {
      const result = {};
      let hasObsInfo = false;
      hoveredChannelData.forEach((channelEl) => {
        const { obsId, obsI, channelScope, layerScope } = channelEl;
        const {
          spatialLayerVisible,
        } = segmentationLayerCoordination[0][layerScope];
        const channelCoordination = segmentationChannelCoordination[0][layerScope];
        const {
          spatialChannelVisible,
          obsType: layerObsType,
        } = channelCoordination[channelScope];
        if (spatialLayerVisible && spatialChannelVisible) {
          hasObsInfo = true;
          if(obsId !== null) {
            result[`${layerObsType} ID`] = obsId;
            if (obsId && segmentationMultiExpressionData?.[layerScope]?.[channelScope] && segmentationMultiLoadedFeatureSelection?.[layerScope]?.[channelScope]) {
              const channelFeature = segmentationMultiLoadedFeatureSelection?.[layerScope]?.[channelScope]?.[0];
              const channelFeatureData = segmentationMultiExpressionData?.[layerScope]?.[channelScope];
              if (channelFeatureData && channelFeatureData[0]) {
                // TODO: use segmentationMultiIndicesData to obtain an index into the obsFeatureMatrix data
                // using the bitmask channel value.
                // For the sake of time, here I am assuming the off-by-one alignment.
                const channelFeatureValue = channelFeatureData[0][obsI];
                result[`${layerObsType} ${channelFeature}`] = commaNumber(channelFeatureValue);
              }
            }
          } else {
            // obsId was null, so we are probably missing a corresponding obsIndex.
            // We cannot get any more information about this obs.
            result[`${layerObsType} index`] = obsI;
          }
        }
      });
      return hasObsInfo ? result : null;
    }
    return null;
  }, [segmentationLayerScopes, segmentationLayerCoordination,
    segmentationChannelScopesByLayer, segmentationChannelCoordination,
    segmentationMultiExpressionData, segmentationMultiLoadedFeatureSelection, segmentationMultiIndicesData,
  ]);
  */

  /*
  const setHoverInfo = useCallback(debounce((data, coord) => {
    setHoverData(data);
    setHoverCoord(coord);
  }, 10, { trailing: true }), [setHoverData, setHoverCoord, useHoverInfoForTooltip]);
  */

  /*
  const segmentationLayerScopeChannelScopeTuples = useMemo(() => {
    const result = [];
    segmentationLayerScopes.forEach((layerScope) => {
      segmentationChannelScopesByLayer[layerScope].forEach((channelScope) => {
        result.push([layerScope, channelScope]);
      });
    });
    return result;
  }, [segmentationLayerScopes, segmentationChannelScopesByLayer]);

  const getObsIdFromHoverData = useCallback((data) => {
    if (useHoverInfoForTooltip) {
      // Get the obsId associated with the hovered observation index
      // for each segmentation channel.
      const perChannelObsInfo = data?.map((v, i) => ([i, (v - 1)]))
        .filter(([targetC, obsI]) => obsI > 0)
        .map(([targetC, obsI]) => {
          const [layerScope, channelScope] = segmentationLayerScopeChannelScopeTuples[targetC];
          if (segmentationMultiIndicesData && layerScope && channelScope) {
            const { obsIndex, featureIndex } = segmentationMultiIndicesData[layerScope][channelScope];
            if (obsIndex) {
              return {
                layerScope,
                channelScope,
                obsI,
                obsId: obsIndex?.[obsI],
              };
            }
          }
          return {
            layerScope,
            channelScope,
            obsI,
            // We do not have a corresponding obsIndex,
            // so we cannot get an obsId.
            obsId: null,
          };
        });
      return perChannelObsInfo;
    }
    return null;
  }, [useHoverInfoForTooltip, segmentationMultiIndicesData, segmentationLayerScopeChannelScopeTuples]);
  */

  // Without useMemo, this would propagate a change every time the component
  // re - renders as opposed to when it has to.
  /*
  const resolutionFilteredImageLayerLoaders = useMemo(() => {
    // eslint-disable-next-line max-len
    const shouldUseFullData = (ll, index) => Array.isArray(useFullResolutionImage) && useFullResolutionImage.includes(meta[index].name) && Array.isArray(ll.data);
    // eslint-disable-next-line max-len
    return imageLayerLoaders.map((ll, index) => (shouldUseFullData(ll, index) ? { ...ll, data: ll.data[0] } : ll));
  }, [imageLayerLoaders, useFullResolutionImage, meta]);
  */

  // Passing an invalid viewState (e.g., with null values) will cause DeckGL
  // to throw a mercator projection assertion error (in 3D mode / when using OrbitView).
  const isValidViewState = is3dMode
    ? (
      zoom !== null && targetX !== null && targetY !== null && targetZ !== null
      && rotationX !== null && rotationOrbit !== null && orbitAxis !== null
    )
    : zoom !== null && targetX !== null && targetY !== null;
      
  /**
   * @param {object} hoverInfo The hoverInfo object passed to the DeckGL layer's onHover callback.
   * @param {'spot'|'point'|'segmentation-polygon'|'segmentation-bitmask'|'image'} layerType
   * @param {string} layerScope
   */
  const delegateHover = useCallback((hoverInfo, layerType, layerScope) => {
    const { coordinate } = hoverInfo;
    let showAnyTooltip = false;

    const hoverData = getHoverData(hoverInfo, layerType);

    // We always iterate over everything because we want to clear
    // any highlights that are not the current hover.
    imageLayerScopes?.forEach((imageLayerScope) => {
      const { setPixelHighlight } = imageLayerCoordination?.[1]?.[imageLayerScope];
      if(hoverData && layerType === 'image' && layerScope === imageLayerScope) {
        showAnyTooltip = true;
        setPixelHighlight(hoverData);
      } else {
        setPixelHighlight(null);
      }
    });
    
    segmentationLayerScopes?.forEach(segmentationLayerScope => {
      const channelScopes = segmentationChannelScopesByLayer?.[segmentationLayerScope];
      channelScopes?.forEach((channelScope, channelI) => {
        const { setObsHighlight } = segmentationChannelCoordination[1][segmentationLayerScope][channelScope];
        if(hoverData && ['segmentation-bitmask', 'segmentation-polygon'].includes(layerType) && layerScope === segmentationLayerScope) {
          const channelValue = hoverData[channelI];
          const obsI = channelValue - 1; // We subtract one because we use 0 to represent background.
          if(channelValue > 0) {
            const { obsIndex } = segmentationMultiIndicesData?.[segmentationLayerScope]?.[channelScope];
            const obsId = obsIndex?.[obsI];
            if(obsId) {
              showAnyTooltip = true;
              setObsHighlight(obsId);
            } else {
              setObsHighlight(null);
            }
          } else {
            setObsHighlight(null);
          }
        } else {
          setObsHighlight(null);
        }
      });
    });
    
    spotLayerScopes?.forEach(spotLayerScope => {
      const { setObsHighlight } = spotLayerCoordination?.[1]?.[spotLayerScope];
      if(hoverData && layerType === 'spot' && layerScope === spotLayerScope) {
        showAnyTooltip = true;
        setObsHighlight(hoverData);
      } else {
        setObsHighlight(null);
      }
    });
    pointLayerScopes?.forEach(pointLayerScope => {
      const { setObsHighlight } = pointLayerCoordination?.[1]?.[pointLayerScope];
      if(hoverData && layerType === 'point' && layerScope === pointLayerScope) {
        showAnyTooltip = true;
        setObsHighlight(hoverData);
      } else {
        setObsHighlight(null);
      }
    });

    if(showAnyTooltip) {
      setHoverCoord(coordinate);
      setComponentHover(uuid);
    } else {
      setHoverCoord(null);
    }

    // "If this callback returns a truthy value,
    // the hover event is marked as handled and
    // will not bubble up to the onHover callback of the DeckGL canvas."
    // Reference: https://deck.gl/docs/api-reference/core/layer#interaction-properties
    return false;
  });

  return (
    <TitleInfo
      title={title}
      info={subtitle}
      isSpatial
      urls={urls}
      theme={theme}
      removeGridComponent={removeGridComponent}
      isReady={isReady}
    >
      <Spatial
        ref={deckRef}
        uuid={uuid}
        width={width}
        height={height}
        theme={theme}
        hideTools // TODO: value?
        // Global view state
        targetT={targetT}
        targetZ={targetZ}
        viewState={isValidViewState ? ({
          zoom,
          target: [targetX, targetY, targetZ],
          rotationX,
          rotationOrbit,
        }) : DEFAULT_VIEW_STATE}
        orbitAxis={orbitAxis}
        spatialAxisFixed={spatialAxisFixed}
        setViewState={isValidViewState ? setViewState : SET_VIEW_STATE_NOOP}
        originalViewState={originalViewState}
        spatialRenderingMode={spatialRenderingMode} // 2D vs. 3D
        //setHoverInfo={setHoverInfo}
        /*setComponentHover={() => {
          setComponentHover(uuid);
        }}
        */
        updateViewInfo={setComponentViewInfo}

        delegateHover={delegateHover}
        
        // Spots
        obsSpots={obsSpotsData}
        spotLayerScopes={spotLayerScopes}
        spotLayerCoordination={spotLayerCoordination}
        obsSpotsSets={obsSpotsSetsData}

        spotMatrixIndices={spotMultiIndicesData}
        spotMultiExpressionData={spotMultiExpressionNormData}

        // Points
        obsPoints={obsPointsData}
        pointLayerScopes={pointLayerScopes}
        pointLayerCoordination={pointLayerCoordination}

        // Segmentations
        segmentationLayerScopes={segmentationLayerScopes}
        segmentationLayerCoordination={segmentationLayerCoordination}
        segmentationChannelScopesByLayer={segmentationChannelScopesByLayer}
        segmentationChannelCoordination={segmentationChannelCoordination}

        obsSegmentations={obsSegmentationsData}
        obsSegmentationsLocations={obsSegmentationsLocationsData}
        obsSegmentationsSets={obsSegmentationsSetsData}
        segmentationMatrixIndices={segmentationMultiIndicesData}
        segmentationMultiExpressionData={segmentationMultiExpressionNormData}

        // TODO: setObsHighlight functions (per-obsType)

        // Images
        images={imageData}
        imageLayerScopes={imageLayerScopes}
        imageLayerCoordination={imageLayerCoordination}

        imageChannelScopesByLayer={imageChannelScopesByLayer}
        imageChannelCoordination={imageChannelCoordination}

        // TODO: useFullResolutionImage={useFullResolutionImage}

        

        // OLD
        //obsLocationsLayerDefs={moleculesLayer}
        //neighborhoodLayerDefs={neighborhoodsLayer}
        //obsLocationsIndex={obsLocationsIndex}
        //obsSegmentationsIndex={obsSegmentationsIndex}
        //obsLocations={obsLocations}
        //obsLocationsLabels={obsLocationsLabels}
        //obsLocationsFeatureIndex={obsLocationsFeatureIndex}
        obsCentroids={obsCentroids}
        obsCentroidsIndex={obsCentroidsIndex}
        // cellFilter={cellFilter}
        // cellSelection={cellSelection}
        cellHighlight={cellHighlight}
        //neighborhoods={neighborhoods}
        setCellFilter={setCellFilter}
        setCellSelection={setCellSelectionProp}
        //setCellHighlight={setCellHighlight}
        //setMoleculeHighlight={setMoleculeHighlight}
        
      />
      {!disableTooltip && (
        <SpatialTooltipSubscriber
          parentUuid={uuid}
          width={width}
          height={height}
          hoverCoord={hoverCoord}
          useHoverInfoForTooltip={useHoverInfoForTooltip}

          // Points
          pointLayerScopes={pointLayerScopes}
          pointLayerCoordination={pointLayerCoordination}

          // Spots
          spotLayerScopes={spotLayerScopes}
          spotLayerCoordination={spotLayerCoordination}

          // Segmentations
          segmentationLayerScopes={segmentationLayerScopes}
          segmentationChannelScopesByLayer={segmentationChannelScopesByLayer}
          segmentationChannelCoordination={segmentationChannelCoordination}

          // Images
          imageLayerScopes={imageLayerScopes}
          imageLayerCoordination={imageLayerCoordination}

          //getObsInfo={getObsInfo}
          //hoverData={hoverData}
          //getObsIdFromHoverData={getObsIdFromHoverData}
        />
      )}
      <MultiLegend
        // Fix to dark theme due to black background of spatial plot.
        theme="dark"
        // Segmentations
        segmentationLayerScopes={segmentationLayerScopes}
        segmentationLayerCoordination={segmentationLayerCoordination}

        segmentationChannelScopesByLayer={segmentationChannelScopesByLayer}
        segmentationChannelCoordination={segmentationChannelCoordination}

        segmentationMultiExpressionExtents={segmentationMultiExpressionExtents}

        // Spots
        spotLayerScopes={spotLayerScopes}
        spotLayerCoordination={spotLayerCoordination}
        spotMultiExpressionExtents={spotMultiExpressionExtents}

        // Points
        pointLayerScopes={pointLayerScopes}
        pointLayerCoordination={pointLayerCoordination}
      />
    </TitleInfo>
  );
}
