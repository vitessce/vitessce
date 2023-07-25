/* eslint-disable dot-notation */
/* eslint-disable no-unused-vars */
import React from 'react';
import SplitSegmentationLayerController from './SplitSegmentationLayerController.js';
import SplitImageLayerController from './SplitImageLayerController.js';

export default function SplitLayerController(props) {
  const {
    coordinationScopesRaw,

    segmentationLayerScopes,
    segmentationLayerValues,
    segmentationLayerCoordination,

    segmentationChannelScopesByLayer,
    segmentationChannelCoordination,

    images,
    imageLayerScopes,
    imageLayerCoordination,

    imageChannelScopesByLayer,
    imageChannelCoordination,
  } = props;
  return (
    <div>
      {/* moleculesLayer && (
        <VectorLayerController
          key={`${dataset}-molecules`}
          label="Molecules"
          layerType="molecules"
          layer={moleculesLayer}
          handleLayerChange={setMoleculesLayer}
        />
      ) */}
      {/* cellsLayer && obsSegmentationsType === 'polygon' && (
        <VectorLayerController
          key={`${dataset}-cells`}
          label={`${capitalize(obsTypeProp)} Segmentations`}
          layerType="cells"
          layer={cellsLayer}
          handleLayerChange={setCellsLayer}
        />
      ) */}
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
          // obsSegmentations={obsSegmentations[layerScope]} // TODO?
          use3d={false} /* TODO */
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
          use3d={false} /* TODO */
        />
      ))}
    </div>
  );
}
