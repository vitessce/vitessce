import React from 'react';
import { Tooltip2D, TooltipContent } from '@vitessce/tooltip';
import { useComponentHover, useComponentViewInfo } from '@vitessce/vit-s';

function TooltipChild(props) {
  const { x, y, parentUuid, sourceUuid, width, height, info } = props;

  return (
    <Tooltip2D
      x={x}
      y={y}
      parentUuid={parentUuid}
      sourceUuid={sourceUuid}
      parentWidth={width}
      parentHeight={height}
    >
      <TooltipContent info={info} />
    </Tooltip2D>
  );
}

export default function SpatialTooltipSubscriber(props) {
  const {
    parentUuid,
    width,
    height,
    //getObsInfo,
    //hoverData,
    hoverCoord,
    //getObsIdFromHoverData,

    // Points
    obsPoints,
    pointLayerScopes,
    pointLayerCoordination,

    // Spots
    obsSpots,
    spotLayerScopes,
    spotLayerCoordination,
    
    // Segmentations
    obsSegmentationsLocations,
    segmentationLayerScopes,
    segmentationChannelScopesByLayer,
    segmentationChannelCoordination,
    
    // Images
    imageLayerScopes,
    imageLayerCoordination,
  } = props;

  const sourceUuid = useComponentHover();
  const viewInfo = useComponentViewInfo(parentUuid);

  // Should hover position be used for tooltips?
  // If there are centroids for each observation, then we can use those
  // to position tooltips. However if there are not centroids,
  // the other option is to use the mouse location.
  const useHoverInfoForTooltip = sourceUuid === parentUuid && hoverCoord;
  const projectedHoverCoord = useHoverInfoForTooltip ? viewInfo?.project(hoverCoord) : null;


  /*
  let [cellInfo, x, y] = [null, null, null];
  if (
    useHoverInfoForTooltip && getObsIdFromHoverData
    && hoverData && hoverCoord
    && parentUuid === sourceUuid
  ) {
    // No observation centroid coordinates were provided, so use
    // the mouse hover info to position the tooltip.
    const obsId = getObsIdFromHoverData(hoverData);
    if (obsId) {
      [cellInfo, x, y] = [
        getObsInfo(obsId),
        ...(viewInfo && viewInfo.project ? viewInfo.project(hoverCoord) : [null, null]),
      ];
    }
  } else if (!useHoverInfoForTooltip && getObsInfo && obsHighlight) {
    // Observation centroid coordinates were provided, so use
    // those coordinates to position the tooltip.
    const obsId = obsHighlight;
    [cellInfo, x, y] = [
      getObsInfo(obsId),
      ...(viewInfo && viewInfo.projectFromId ? viewInfo.projectFromId(obsId) : [null, null]),
    ];
  }
  */

  let yOffset = -30;

  return (
    <>
      {projectedHoverCoord && imageLayerScopes?.map(layerScope => {
        const { pixelHighlight } = imageLayerCoordination?.[0]?.[layerScope];
        return (pixelHighlight ? (
          <TooltipChild
            key={layerScope}
            parentUuid={parentUuid}
            sourceUuid={sourceUuid}
            width={width}
            height={height}
            info={{
              'Pixel Value': JSON.stringify(pixelHighlight)
            }}
            x={projectedHoverCoord?.[0]}
            y={projectedHoverCoord?.[1] + (yOffset += 30)}
          />
        ) : null);
      })}
      {segmentationLayerScopes?.flatMap(layerScope => (
        segmentationChannelScopesByLayer?.[layerScope]?.map(channelScope => {
          const { obsType, obsHighlight } = segmentationChannelCoordination?.[0]?.[layerScope]?.[channelScope] || {};
          if(!obsHighlight) return null;
          const { obsIndex, obsLocations } = obsSegmentationsLocations?.[layerScope]?.[channelScope] || {};
          const hasObsCoordinates = useHoverInfoForTooltip ? true : obsLocations;
          const obsI = obsIndex?.indexOf(obsHighlight);
          if(hasObsCoordinates && obsI < 0) return null;
          const obsCoord = [obsLocations?.data[0][obsI], obsLocations?.data[1][obsI], 0];
          const projectedObsCoord = viewInfo?.project(obsCoord);
          const x = useHoverInfoForTooltip ? projectedHoverCoord?.[0] : projectedObsCoord?.[0];
          const y = useHoverInfoForTooltip ? projectedHoverCoord?.[1] : projectedObsCoord?.[1];
          return (obsHighlight && hasObsCoordinates ? (
            <TooltipChild
              key={`${layerScope}-${channelScope}`}
              parentUuid={parentUuid}
              sourceUuid={sourceUuid}
              width={width}
              height={height}
              info={{
                [`${obsType} ID`]: obsHighlight,
              }}
              x={x}
              y={y + (yOffset += 30)}
            />
          ) : null);
        })
      ))}
      {spotLayerScopes?.map(layerScope => {
        const { obsType, obsHighlight } = spotLayerCoordination?.[0]?.[layerScope];
        return (obsHighlight ? (
          <TooltipChild
            key={layerScope}
            parentUuid={parentUuid}
            sourceUuid={sourceUuid}
            width={width}
            height={height}
            info={{
              [`${obsType} ID`]: obsHighlight,
            }}
            x={projectedHoverCoord?.[0]}
            y={projectedHoverCoord?.[1] + (yOffset += 30)}
          />
        ) : null);
      })}
      {pointLayerScopes?.map(layerScope => {
        const { obsType, obsHighlight } = pointLayerCoordination?.[0]?.[layerScope];
        return (obsHighlight ? (
          <TooltipChild
            key={layerScope}
            parentUuid={parentUuid}
            sourceUuid={sourceUuid}
            width={width}
            height={height}
            info={{
              [`${obsType} ID`]: obsHighlight,
            }}
            x={projectedHoverCoord?.[0]}
            y={projectedHoverCoord?.[1] + (yOffset += 30)}
          />
        ) : null);
      })}
    </>
  );
}
