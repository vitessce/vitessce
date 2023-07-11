/* eslint-disable dot-notation */
/* eslint-disable no-unused-vars */
import React from 'react';
import { Grid } from '@material-ui/core';
import ImageAddButton from './ImageAddButton.js';
import SplitSegmentationLayerController from './SplitSegmentationLayerController.js';
import SplitImageLayerController from './SplitImageLayerController.js';

export default function SplitLayerController(props) {
  const {

    segmentationLayerScopes,
    segmentationLayerValues,
    segmentationLayerCoordination,

    segmentationChannelScopesByLayer,
    segmentationChannelCoordination,

    images,
    imageLayerScopes,
    imageLayerCoordination,
    photometricInterpretation,

    imageChannelScopesByLayer,
    imageChannelCoordination,

    handleImageAdd,
    enableLayerButtonsWithOneLayer,
  } = props;
  const { loaders: imageLayerLoaders, meta: imageLayerMeta } = {}; // TODO
  // TODO
  const shouldShowImageLayerButton = Boolean(
    enableLayerButtonsWithOneLayer || imageLayerLoaders?.length > 1,
  );
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
          layerScope={layerScope}
          layerCoordination={imageLayerCoordination[0][layerScope]}
          setLayerCoordination={imageLayerCoordination[1][layerScope]}
          channelScopes={imageChannelScopesByLayer[layerScope]}
          channelCoordination={imageChannelCoordination[0][layerScope]}
          setChannelCoordination={imageChannelCoordination[1][layerScope]}
          image={images[layerScope]}
          use3d={false} /* TODO */
          photometricInterpretation={photometricInterpretation}
        />
      ))}
      {shouldShowImageLayerButton
        ? (/* TODO */
          <Grid item>
            <ImageAddButton
              imageOptions={imageLayerMeta}
              handleImageAdd={handleImageAdd}
            />
          </Grid>
        ) : null}
    </div>
  );
}
