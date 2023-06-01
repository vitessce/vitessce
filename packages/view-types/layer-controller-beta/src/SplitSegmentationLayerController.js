import React, { useState } from 'react';
import SplitSegmentationChannelController from './SplitSegmentationChannelController.js';


export default function SplitSegmentationLayerController(props) {
  const {
    layerScope,
    layerCoordination,
    setLayerCoordination,
    channelScopes,
    channelCoordination,
    setChannelCoordination,
    obsSegmentations, // TODO?
    use3d, // TODO
  } = props;

  // console.log(layerCoordination, channelCoordination);

  const {
    spatialLayerVisible,
    spatialLayerOpacity,
  } = layerCoordination;
  const {
    setSpatialLayerVisible,
    setSpatialLayerOpacity,
  } = setLayerCoordination;

  return (
    <>
      {channelScopes.map((cScope) => {
        const {
          obsType,
          spatialChannelVisible,
          spatialChannelOpacity,
          spatialChannelColor: color,
          spatialSegmentationFilled: filled,
          spatialSegmentationStrokeWidth: strokeWidth,
          obsColorEncoding,
          featureValueColormap,
          featureValueColormapRange,
        } = channelCoordination[cScope];
        const {
          setSpatialChannelVisible,
          setSpatialChannelOpacity,
          setSpatialChannelColor: setColor,
          setSpatialSegmentationFilled: setFilled,
          setSpatialSegmentationStrokeWidth: setStrokeWidth,
          setObsColorEncoding,
          setFeatureValueColormap,
          setFeatureValueColormapRange,
        } = setChannelCoordination[cScope];

        const obsTypeName = obsType;

        //const index = 0;
        //const loader = obsTypeData?.obsSegmentations?.loaders?.[index];
        //const layerMeta = obsTypeData?.obsSegmentations?.meta?.[index];
        //const loader = null;
        //const layerMeta = null;
        //const channelIndex = segmentationLayerCoordination[0][layerScope].spatialTargetC;

        return (
          <SplitSegmentationChannelController
            key={`${layerScope}-${cScope}`}
            layerScope={layerScope}
            label={obsTypeName}
            opacity={spatialChannelOpacity}
            setOpacity={setSpatialChannelOpacity}
            visible={spatialChannelVisible}
            setVisible={setSpatialChannelVisible}
            color={color}
            setColor={setColor}
            filled={filled}
            setFilled={setFilled}
            strokeWidth={strokeWidth}
            setStrokeWidth={setStrokeWidth}

            obsColorEncoding={obsColorEncoding}
            featureValueColormap={featureValueColormap}
            featureValueColormapRange={featureValueColormapRange}
            setObsColorEncoding={setObsColorEncoding}
            setFeatureValueColormap={setFeatureValueColormap}
            setFeatureValueColormapRange={setFeatureValueColormapRange}
          />
        );
      })}
    </>
  );
}
