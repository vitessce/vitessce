import React from 'react';
import Tooltip2D from '../tooltip/Tooltip2D';
import TooltipContent from '../tooltip/TooltipContent';
import { useComponentHover, useComponentViewInfo } from '../../app/state/hooks';

export default function ScatterplotTooltipSubscriber(props) {
  const {
    parentUuid,
    cellHighlight,
    width,
    height,
    getCellInfo,
  } = props;

  const sourceUuid = useComponentHover();
  const viewInfo = useComponentViewInfo(parentUuid);

  const [cellInfo, x, y] = (cellHighlight && getCellInfo ? (
    [
      getCellInfo(cellHighlight),
      ...(viewInfo && viewInfo.project ? viewInfo.project(cellHighlight) : [null, null]),
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
        <TooltipContent info={cellInfo} />
      </Tooltip2D>
    ) : null)
  );
}
