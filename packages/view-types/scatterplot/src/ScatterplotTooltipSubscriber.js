import React from 'react';
import { Tooltip2D, TooltipContent } from '@vitessce/tooltip';
import { useComponentHover, useComponentViewInfo } from '@vitessce/vit-s';

export default function ScatterplotTooltipSubscriber(props) {
  const {
    parentUuid,
    obsHighlight,
    width,
    height,
    getObsInfo,
    featureType,
    featureLabelsMap,
  } = props;

  const sourceUuid = useComponentHover();
  const viewInfo = useComponentViewInfo(parentUuid);

  const [cellInfo, x, y] = (obsHighlight && getObsInfo ? (
    [
      getObsInfo(obsHighlight),
      ...(viewInfo && viewInfo.projectFromId ? viewInfo.projectFromId(obsHighlight) : [null, null]),
    ]
  ) : ([null, null, null]));

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
