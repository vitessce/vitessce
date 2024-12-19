/* eslint-disable no-return-assign */
import React from 'react';
import { Tooltip2D, TooltipContent } from '@vitessce/tooltip';
import { useComponentHover, useComponentViewInfo } from '@vitessce/vit-s';
import { capitalize } from '@vitessce/utils';

function TooltipChild(props) {
  const {
    x, y,
    parentUuid,
    sourceUuid,
    width, height,
    info,
    tooltipsVisible,
    tooltipCrosshairsVisible,
    featureType,
    featureLabelsMap,
  } = props;

  const visible = parentUuid === sourceUuid ? tooltipsVisible : tooltipCrosshairsVisible;

  return (visible ? (
    <Tooltip2D
      x={x}
      y={y}
      parentUuid={parentUuid}
      sourceUuid={sourceUuid}
      parentWidth={width}
      parentHeight={height}
    >
      <TooltipContent
        info={info}
        featureType={featureType}
        featureLabelsMap={featureLabelsMap}
      />
    </Tooltip2D>
  ) : null);
}

function getXY(
  obsHighlight, viewInfo, obsIndex, obsLocations,
  useHoverInfoForTooltip, projectedHoverCoord,
) {
  const hasObsCoordinates = useHoverInfoForTooltip ? true : (obsIndex && obsLocations);
  if (!hasObsCoordinates) return null;
  const obsI = obsIndex?.indexOf(obsHighlight);
  if (obsI < 0) return null;
  if (useHoverInfoForTooltip) {
    return [projectedHoverCoord?.[0], projectedHoverCoord?.[1]];
  }
  const obsCoord = [obsLocations?.data[0][obsI] || 0, obsLocations?.data[1][obsI] || 0, 0];
  const projectedObsCoord = viewInfo?.project(obsCoord);
  return [projectedObsCoord?.[0], projectedObsCoord?.[1]];
}

function getObsInfo(obsSetsData, obsType, obsId) {
  let result = {
    [`${capitalize(obsType)} ID`]: obsId,
  };
  if (obsSetsData?.obsSetsMembership) {
    const obsMembership = obsSetsData.obsSetsMembership.get(obsId) || [];
    if (obsMembership) {
      result = {
        ...result,
        ...Object.fromEntries(
          obsMembership.flatMap(path => path.slice(1).map((pathEl, elLevel) => [
            `${path[0]}${path.length > 2 ? ` L${elLevel + 1}` : ''}`,
            pathEl,
          ])),
        ),
      };
    }
  }
  return result;
}

export default function SpatialTooltipSubscriber(props) {
  const {
    parentUuid,
    width,
    height,
    hoverCoord,
    featureType,
    featureLabelsMap,

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
    obsSegmentationsSetsData,

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

  let yOffset = -30;

  return (
    <>
      {projectedHoverCoord && imageLayerScopes?.map((layerScope) => {
        const {
          pixelHighlight, tooltipsVisible, spatialLayerVisible,
        } = imageLayerCoordination?.[0]?.[layerScope] || {};
        return (tooltipsVisible && pixelHighlight && spatialLayerVisible ? (
          <TooltipChild
            key={layerScope}
            parentUuid={parentUuid}
            sourceUuid={sourceUuid}
            width={width}
            height={height}
            info={{
              'Pixel Value': JSON.stringify(pixelHighlight),
            }}
            x={projectedHoverCoord?.[0]}
            y={projectedHoverCoord?.[1] + (yOffset += 30)}
            featureType={featureType}
            featureLabelsMap={featureLabelsMap}
          />
        ) : null);
      })}
      {segmentationLayerScopes?.flatMap(layerScope => (
        segmentationChannelScopesByLayer?.[layerScope]?.map((channelScope) => {
          const {
            obsType, obsHighlight, tooltipsVisible, tooltipCrosshairsVisible, spatialChannelVisible,
          } = segmentationChannelCoordination?.[0]
            ?.[layerScope]?.[channelScope] || {};
          const obsSetsData = obsSegmentationsSetsData?.[layerScope]?.[channelScope];
          const obsInfo = getObsInfo(obsSetsData, obsType, obsHighlight);
          if (
            !obsHighlight
            || !spatialChannelVisible
            || (!tooltipsVisible && !tooltipCrosshairsVisible)
          ) return null;
          const { obsIndex, obsLocations } = obsSegmentationsLocations
            ?.[layerScope]?.[channelScope] || {};
          const xy = getXY(
            obsHighlight, viewInfo, obsIndex, obsLocations,
            useHoverInfoForTooltip, projectedHoverCoord,
          );
          if (!xy) return null;
          const [x, y] = xy;
          return (
            <TooltipChild
              key={`${layerScope}-${channelScope}`}
              parentUuid={parentUuid}
              sourceUuid={sourceUuid}
              tooltipsVisible={tooltipsVisible}
              tooltipCrosshairsVisible={tooltipCrosshairsVisible}
              width={width}
              height={height}
              info={obsInfo}
              x={x}
              y={y + (yOffset += (20 + 15 * Object.keys(obsInfo).length))}
              featureType={featureType}
              featureLabelsMap={featureLabelsMap}
            />
          );
        })
      ))}
      {spotLayerScopes?.map((layerScope) => {
        const {
          obsType, obsHighlight, tooltipsVisible, tooltipCrosshairsVisible, spatialLayerVisible,
        } = spotLayerCoordination?.[0]?.[layerScope] || {};
        if (
          !obsHighlight
          || !spatialLayerVisible
          || (!tooltipsVisible && !tooltipCrosshairsVisible)
        ) return null;
        const { obsIndex, obsSpots: obsLocations } = obsSpots?.[layerScope] || {};
        const xy = getXY(
          obsHighlight, viewInfo, obsIndex, obsLocations,
          useHoverInfoForTooltip, projectedHoverCoord,
        );
        if (!xy) return null;
        const [x, y] = xy;
        return (
          <TooltipChild
            key={layerScope}
            parentUuid={parentUuid}
            sourceUuid={sourceUuid}
            tooltipsVisible={tooltipsVisible}
            tooltipCrosshairsVisible={tooltipCrosshairsVisible}
            width={width}
            height={height}
            info={{
              [`${capitalize(obsType)} ID`]: obsHighlight,
            }}
            x={x}
            y={y + (yOffset += 30)}
            featureType={featureType}
            featureLabelsMap={featureLabelsMap}
          />
        );
      })}
      {pointLayerScopes?.map((layerScope) => {
        const {
          obsType, obsHighlight, tooltipsVisible, tooltipCrosshairsVisible, spatialLayerVisible,
        } = pointLayerCoordination?.[0]?.[layerScope] || {};
        if (
          !obsHighlight
          || !spatialLayerVisible
          || (!tooltipsVisible && !tooltipCrosshairsVisible)
        ) return null;
        const { obsIndex, obsPoints: obsLocations } = obsPoints?.[layerScope] || {};
        const xy = getXY(
          obsHighlight, viewInfo, obsIndex, obsLocations,
          useHoverInfoForTooltip, projectedHoverCoord,
        );
        if (!xy) return null;
        const [x, y] = xy;
        return (
          <TooltipChild
            key={layerScope}
            parentUuid={parentUuid}
            sourceUuid={sourceUuid}
            tooltipsVisible={tooltipsVisible}
            tooltipCrosshairsVisible={tooltipCrosshairsVisible}
            width={width}
            height={height}
            info={{
              [`${capitalize(obsType)} ID`]: obsHighlight,
            }}
            x={x}
            y={y + (yOffset += 30)}
            featureType={featureType}
            featureLabelsMap={featureLabelsMap}
          />
        );
      })}
    </>
  );
}
