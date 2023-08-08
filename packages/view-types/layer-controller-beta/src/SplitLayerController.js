import React from 'react';
import SplitSpotLayerController from './SplitSpotLayerController.js';
import SplitPointLayerController from './SplitPointLayerController.js';
import SplitSegmentationLayerController from './SplitSegmentationLayerController.js';
import SplitImageLayerController from './SplitImageLayerController.js';
import GlobalDimensionSlider from './GlobalDimensionSlider.js';

export default function SplitLayerController(props) {
  const {
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
  } = props;

  const anyLayerHasT = Object.values(images || {})
    .some(image => image?.image?.instance.hasTStack());
  const anyLayerHasZ = Object.values(images || {})
    .some(image => image?.image?.instance.hasZStack());

  const maxT = Object.values(images || {})
    .reduce((a, h) => Math.max(a, h?.image?.instance.getNumT()), 1) - 1;
  const maxZ = Object.values(images || {})
    .reduce((a, h) => Math.max(a, h?.image?.instance.getNumZ()), 1) - 1;

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
      {/* Point layers: */}
      {pointLayerScopes && pointLayerScopes.map(layerScope => (
        <SplitPointLayerController
          key={layerScope}
          layerScope={layerScope}
          layerCoordination={pointLayerCoordination[0][layerScope]}
          setLayerCoordination={pointLayerCoordination[1][layerScope]}
        />
      ))}
      {/* Spot layers: */}
      {spotLayerScopes && spotLayerScopes.map(layerScope => (
        <SplitSpotLayerController
          key={layerScope}
          layerScope={layerScope}
          layerCoordination={spotLayerCoordination[0][layerScope]}
          setLayerCoordination={spotLayerCoordination[1][layerScope]}
        />
      ))}
      {/* Segmentation layers: */}
      {segmentationLayerScopes && segmentationLayerScopes.map(layerScope => (
        <SplitSegmentationLayerController
          key={layerScope}
          layerScope={layerScope}
          layerCoordination={segmentationLayerCoordination[0][layerScope]}
          setLayerCoordination={segmentationLayerCoordination[1][layerScope]}
          channelScopes={segmentationChannelScopesByLayer[layerScope]}
          channelCoordination={segmentationChannelCoordination[0][layerScope]}
          setChannelCoordination={segmentationChannelCoordination[1][layerScope]}
        />
      ))}
      {/* Image layers: */}
      {imageLayerScopes && imageLayerScopes.map(layerScope => (
        <SplitImageLayerController
          key={layerScope}
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
        />
      ))}
    </div>
  );
}
