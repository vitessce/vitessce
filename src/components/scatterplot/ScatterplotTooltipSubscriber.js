import React, { useState, useEffect } from 'react';
import PubSub from 'pubsub-js';
import { VIEW_INFO } from '../../events';
import Tooltip2D from '../tooltip/Tooltip2D';
import TooltipContent from '../tooltip/TooltipContent';
import { useComponentHover } from '../../app/state/hooks';

export default function ScatterplotTooltipSubscriber(props) {
  const {
    parentUuid,
    cellHighlight,
    width,
    height,
    getCellInfo,
  } = props;

  const sourceUuid = useComponentHover();
  const [viewInfo, setViewInfo] = useState();

  useEffect(() => {
    const viewInfoToken = PubSub.subscribe(
      VIEW_INFO, (msg, newViewInfo) => {
        if (newViewInfo && parentUuid === newViewInfo.uuid) {
          setViewInfo(newViewInfo);
        }
      },
    );
    return () => PubSub.unsubscribe(viewInfoToken);
  }, [parentUuid]);


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
