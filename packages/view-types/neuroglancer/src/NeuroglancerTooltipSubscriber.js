import React from 'react';
import { Tooltip2D, TooltipContent } from '@vitessce/tooltip';
import { useComponentHover } from '@vitessce/vit-s';
import { capitalize } from '@vitessce/utils';
import { projectToScreen } from './utils.js';

function TooltipChild(props) {
  const {
    x, y, parentUuid, sourceUuid, width, height, info,
    tooltipsVisible, tooltipCrosshairsVisible, featureType, featureLabelsMap,
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
      <TooltipContent info={info} featureType={featureType} featureLabelsMap={featureLabelsMap} />
    </Tooltip2D>
  ) : null);
}

function getObsInfo(obsSetsData, obsType, obsId) {
  let result = { [`${capitalize(obsType)} ID`]: obsId };
  const obsMembership = obsSetsData?.obsSetsMembership?.get(obsId) || [];
  result = {
    ...result,
    ...Object.fromEntries(
      obsMembership.flatMap(path => path.slice(1).map((pathEl, elLevel) => [
        `${path[0]}${path.length > 2 ? ` L${elLevel + 1}` : ''}`,
        pathEl,
      ])),
    ),
  };
  return result;
}

export default function NeuroglancerTooltipSubscriber(props) {
  const {
    parentUuid,
    width,
    height,
    hoverCoord,
    getViewProjectionMat,
    getObsPosition,
    obsHighlight: viewObsHighlight,
    featureType,
    featureLabelsMap,
    segmentationLayerScopes,
    segmentationChannelScopesByLayer,
    segmentationChannelCoordination,
    obsSegmentationsSetsData,
  } = props;

  const sourceUuid = useComponentHover();
  // NG has no per-id positions, so tooltips
  // are anchored at the projected hover coordinate in the hovered view only.
  const isSource = sourceUuid === parentUuid;
  const mat = getViewProjectionMat?.();
  let yOffset = -30;

  return (
    <>
      {segmentationLayerScopes?.flatMap(layerScope => (
        segmentationChannelScopesByLayer?.[layerScope]?.map((channelScope) => {
          const {
            obsType, obsHighlight: channelObsHighlight,
            tooltipsVisible, tooltipCrosshairsVisible, spatialChannelVisible,
          } = segmentationChannelCoordination?.[0]?.[layerScope]?.[channelScope] || {};

          const showTooltip = tooltipsVisible ?? true;
          const showCrosshair = tooltipCrosshairsVisible ?? true;
          // NG drives the view-level obsHighlight
          const obsHighlight = channelObsHighlight ?? viewObsHighlight;
          if (
            !obsHighlight
                        || spatialChannelVisible === false
                        || (!showTooltip && !showCrosshair)
          ) return null;
          const obsInfo = getObsInfo(
            obsSegmentationsSetsData?.[layerScope]?.[channelScope], obsType, String(obsHighlight),
          );
          // Hovered view: cursor position. Other views: highlighted cell's centroid (crosshair),
          // same split as spatialBeta's getXY (hover info vs obsLocations).
          const coord = isSource ? hoverCoord : getObsPosition?.(obsHighlight);
          const xy = coord ? projectToScreen(mat, coord, width, height) : null;
          if (!xy) return null;

          /* eslint-disable no-return-assign */
          return (
            <TooltipChild
              key={`${layerScope}-${channelScope}`}
              parentUuid={parentUuid}
              sourceUuid={sourceUuid}
              tooltipsVisible={showTooltip}
              tooltipCrosshairsVisible={showCrosshair}
              width={width}
              height={height}
              info={obsInfo}
              x={xy[0]}
              // Stack offset only applies to tooltips; crosshairs must sit on the point.
              y={isSource ? xy[1] + (yOffset += (20 + 15 * Object.keys(obsInfo).length)) : xy[1]}
              featureType={featureType}
              featureLabelsMap={featureLabelsMap}
            />
          );
        })
      ))}
    </>
  );
}
