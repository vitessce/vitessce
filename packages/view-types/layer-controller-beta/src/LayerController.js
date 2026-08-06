import React, { useMemo } from 'react';
import SpotLayerController from './SpotLayerController.js';
import PointLayerController from './PointLayerController.js';
import SegmentationLayerController from './SegmentationLayerController.js';
import ImageLayerController from './ImageLayerController.js';
import GlobalDimensionSlider from './GlobalDimensionSlider.js';
import SegmentationCentroidsController from './SegmentationCentroidsController.js';

export default function LayerController(props) {
  const {
    theme,
    coordinationScopesRaw,

    segmentationLayerScopes,
    segmentationLayerCoordination,

    segmentationChannelScopesByLayer,
    segmentationChannelCoordination,

    images,
    imageLayerScopes,
    imageLayerCoordination,
    targetT,
    targetZ,
    setTargetT,
    setTargetZ,
    spatialRenderingMode,
    setSpatialRenderingMode,

    imageChannelScopesByLayer,
    imageChannelCoordination,

    spotLayerScopes,
    spotLayerCoordination,

    pointLayerScopes,
    pointLayerCoordination,
    pointMultiIndicesData,

    volumeLoadingStatus,
    tiledPointsLoadingProgress,
    layerPerFeatureForPoints,
    centroidSegmentationPairs = [],
    pairedSegScopes = new Set(),
    pairedPointScopes = new Set(),

  } = props;

  const anyLayerHasT = Object.values(images || {})
    .some(image => image?.image?.instance.hasTStack());
  const anyLayerHasZ = Object.values(images || {})
    .some(image => image?.image?.instance.hasZStack());

  const maxT = Object.values(images || {})
    .reduce((a, h) => Math.max(a, h?.image?.instance.getNumT()), 1) - 1;
  const maxZ = Object.values(images || {})
    .reduce((a, h) => Math.max(a, h?.image?.instance.getNumZ()), 1) - 1;

  const reversedImageLayerScopes = useMemo(() => (
    [...(imageLayerScopes || [])].reverse()
  ), [imageLayerScopes]);

  const reversedSpotLayerScopes = useMemo(() => (
    [...(spotLayerScopes || [])].reverse()
  ), [spotLayerScopes]);
  // Filter out point scopes that are already rendered inside a combined row
  const reversedPointLayerScopes = useMemo(() => (
    [...(pointLayerScopes || [])]
      .filter(scope => !pairedPointScopes.has(scope))
      .reverse()
  ), [pointLayerScopes, pairedPointScopes]);

  // Filter out segmentation scopes that are already rendered inside a combined row
  const reversedSegmentationLayerScopes = useMemo(() => (
    [...(segmentationLayerScopes || [])]
      .filter(scope => !pairedSegScopes.has(scope))
      .reverse()
  ), [segmentationLayerScopes, pairedSegScopes]);


  return (
    <div>
      {/* Global T and Z sliders */}
      {anyLayerHasZ ? (
        <GlobalDimensionSlider
          label="Z"
          targetValue={targetZ}
          setTargetValue={setTargetZ}
          max={maxZ}
          spatialRenderingMode={spatialRenderingMode}
          setSpatialRenderingMode={setSpatialRenderingMode}
        />
      ) : null}
      {anyLayerHasT ? (
        <GlobalDimensionSlider
          label="T"
          targetValue={targetT}
          setTargetValue={setTargetT}
          max={maxT}
        />
      ) : null}
      {/* Combined Centroids and Segmentation layers: */}
      {centroidSegmentationPairs.map(({ pointScope, segScope }) => (
        <SegmentationCentroidsController
          key={`combined-${segScope}-${pointScope}`}
          theme={theme}
          segScope={segScope}
          segLayerCoordination={segmentationLayerCoordination}
          segChannelScopesByLayer={segmentationChannelScopesByLayer}
          segChannelCoordination={segmentationChannelCoordination}
          pointScope={pointScope}
          pointLayerCoordination={pointLayerCoordination}
        />
      ))}

      {/* Point layers: */}
      {pointLayerScopes && reversedPointLayerScopes.map(layerScope => (
        <PointLayerController
          key={layerScope}
          theme={theme}
          layerScope={layerScope}
          layerCoordination={pointLayerCoordination[0][layerScope]}
          setLayerCoordination={pointLayerCoordination[1][layerScope]}
          pointMatrixIndicesData={pointMultiIndicesData?.[layerScope]}
          tiledPointsLoadingProgress={tiledPointsLoadingProgress}
          layerPerFeatureForPoints={layerPerFeatureForPoints}
        />
      ))}
      {/* Spot layers: */}
      {spotLayerScopes && reversedSpotLayerScopes.map(layerScope => (
        <SpotLayerController
          key={layerScope}
          theme={theme}
          layerScope={layerScope}
          layerCoordination={spotLayerCoordination[0][layerScope]}
          setLayerCoordination={spotLayerCoordination[1][layerScope]}
        />
      ))}
      {/* Segmentation layers: */}
      {segmentationLayerScopes && reversedSegmentationLayerScopes.map(layerScope => (
        <SegmentationLayerController
          key={layerScope}
          theme={theme}
          layerScope={layerScope}
          layerCoordination={segmentationLayerCoordination[0][layerScope]}
          setLayerCoordination={segmentationLayerCoordination[1][layerScope]}
          channelScopes={segmentationChannelScopesByLayer[layerScope]}
          channelCoordination={segmentationChannelCoordination[0][layerScope]}
          setChannelCoordination={segmentationChannelCoordination[1][layerScope]}
        />
      ))}
      {/* Image layers: */}
      {imageLayerScopes && reversedImageLayerScopes.map(layerScope => (
        <ImageLayerController
          key={layerScope}
          theme={theme}
          coordinationScopesRaw={coordinationScopesRaw}
          layerScope={layerScope}
          layerCoordination={imageLayerCoordination[0][layerScope]}
          setLayerCoordination={imageLayerCoordination[1][layerScope]}
          channelScopes={imageChannelScopesByLayer[layerScope]}
          channelCoordination={imageChannelCoordination[0][layerScope]}
          setChannelCoordination={imageChannelCoordination[1][layerScope]}
          image={images[layerScope]?.image?.instance} /* TODO: remove extra instance accessor */
          featureIndex={images[layerScope]?.featureIndex}
          targetT={targetT}
          targetZ={targetZ}
          spatialRenderingMode={spatialRenderingMode}
          volumeLoadingProgress={volumeLoadingStatus?.loadingProgress}
          onStopVolumeLoading={volumeLoadingStatus?.onStopLoading}
          onRestartVolumeLoading={volumeLoadingStatus?.onRestartLoading}
          volumeStillRef={volumeLoadingStatus?.stillRef}
        />
      ))}
    </div>
  );
}
