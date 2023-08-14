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
    useHoverInfoForTooltip,
    //getObsIdFromHoverData,
    segmentationLayerScopes,
    segmentationChannelScopesByLayer,
    segmentationChannelCoordination,

    imageLayerScopes,
    imageLayerCoordination,
  } = props;

  const sourceUuid = useComponentHover();
  const viewInfo = useComponentViewInfo(parentUuid);

  const projectedHoverCoord = useHoverInfoForTooltip && hoverCoord ? viewInfo?.project(hoverCoord) : null;
  console.log(hoverCoord, projectedHoverCoord, viewInfo, segmentationLayerScopes,
    segmentationChannelScopesByLayer,
    segmentationChannelCoordination,);

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

  return (hoverCoord ? (
    <>
      {imageLayerScopes?.map(layerScope => {
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
          const { obsType, obsHighlight } = segmentationChannelCoordination?.[0]?.[layerScope]?.[channelScope];
          return (obsHighlight ? (
            <TooltipChild
              key={`${layerScope}-${channelScope}`}
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
        })
      ))}
    </>
  ) : null);
}
