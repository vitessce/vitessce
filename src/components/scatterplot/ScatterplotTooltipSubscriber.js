import React, { useEffect, useState } from 'react';
import PubSub from 'pubsub-js';
import {
  CELLS_HOVER, VIEW_INFO,
} from '../../events';
import Tooltip2D from '../tooltip/Tooltip2D';
import TooltipContent from '../tooltip/TooltipContent';

export default function ScatterplotTooltipSubscriber(props) {
  const {
    uuid, width, height, getCellInfo,
  } = props;

  const [cellInfo, setCellInfo] = useState();

  const [sourceUuid, setSourceUuid] = useState();
  const [viewInfo, setViewInfo] = useState();
  const [x, setX] = useState(null);
  const [y, setY] = useState(null);

  useEffect(() => {
    const cellsHoverToken = PubSub.subscribe(
      CELLS_HOVER, (msg, hoverInfo) => {
        if (!hoverInfo) {
          setCellInfo(null);
          setSourceUuid(null);
        } else {
          const newCellInfo = getCellInfo(hoverInfo.cellId);
          setCellInfo(newCellInfo);
          setSourceUuid(hoverInfo.uuid);
          if (viewInfo && viewInfo.project) {
            const [newX, newY] = viewInfo.project(hoverInfo.cellId);
            setX(newX);
            setY(newY);
          }
        }
      },
    );
    const viewInfoToken = PubSub.subscribe(
      VIEW_INFO, (msg, newViewInfo) => {
        if (newViewInfo && newViewInfo.uuid && uuid === newViewInfo.uuid) {
          setViewInfo(newViewInfo);
        }
      },
    );
    return () => {
      PubSub.unsubscribe(cellsHoverToken);
      PubSub.unsubscribe(viewInfoToken);
    };
  }, [getCellInfo, uuid, viewInfo]);

  return (
    (cellInfo ? (
      <Tooltip2D
        x={x}
        y={y}
        parentUuid={uuid}
        parentWidth={width}
        parentHeight={height}
        sourceUuid={sourceUuid}
      >
        <TooltipContent info={cellInfo} />
      </Tooltip2D>
    ) : null)
  );
}
