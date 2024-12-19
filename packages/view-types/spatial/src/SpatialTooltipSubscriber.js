import React from 'react';
import { Tooltip2D, TooltipContent } from '@vitessce/tooltip';
import { useComponentHover, useComponentViewInfo } from '@vitessce/vit-s';

export default function SpatialTooltipSubscriber(props) {
  const {
    parentUuid,
    obsHighlight,
    width,
    height,
    getObsInfo,
    hoverData,
    hoverCoord,
    useHoverInfoForTooltip,
    getObsIdFromHoverData,
    featureType,
    featureLabelsMap,
  } = props;

  const sourceUuid = useComponentHover();
  const viewInfo = useComponentViewInfo(parentUuid);

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
        getObsInfo(obsId), ...hoverCoord,
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

  return (
    (cellInfo ? (
      <Tooltip2D
        x={x}
        y={y}
        parentUuid={parentUuid}
        sourceUuid={sourceUuid}
        parentWidth={width}
        parentHeight={height}
      >
        <TooltipContent
          info={cellInfo}
          featureType={featureType}
          featureLabelsMap={featureLabelsMap}
        />
      </Tooltip2D>
    ) : null)
  );
}
