import React, { useEffect, useState } from 'react';
import PubSub from 'pubsub-js';
import { VIEW_INFO } from '../../events';
import Tooltip2D from '../tooltip/Tooltip2D';
import TooltipContent from '../tooltip/TooltipContent';
import { useCoordination } from '../../app/state/hooks';

export default function ScatterplotTooltipSubscriber(props) {
  const {
    uuid, width, height, getCellInfo,
    coordinationScopes,
  } = props;

  const [cellInfo, setCellInfo] = useState();

  const [sourceUuid, setSourceUuid] = useState();
  const [viewInfo, setViewInfo] = useState();
  const [x, setX] = useState(null);
  const [y, setY] = useState(null);

  const [{ cellHighlight }] = useCoordination(['cellHighlight'], coordinationScopes);

  useEffect(() => {
    const viewInfoToken = PubSub.subscribe(
      VIEW_INFO, (msg, newViewInfo) => {
        if (newViewInfo && uuid === newViewInfo.uuid) {
          setViewInfo(newViewInfo);
        }
      },
    );
    return () => PubSub.unsubscribe(viewInfoToken);
  }, [uuid, viewInfo]);

  // React to cell highlight updates.
  useEffect(() => {
    if (!cellHighlight) {
      setCellInfo(null);
      setSourceUuid(null);
    } else {
      const newCellInfo = getCellInfo(cellHighlight.cellId);
      setCellInfo(newCellInfo);
      setSourceUuid(cellHighlight.uuid);
      if (viewInfo && viewInfo.project) {
        const [newX, newY] = viewInfo.project(cellHighlight.cellId);
        setX(newX);
        setY(newY);
      }
    }
  }, [cellHighlight, viewInfo, getCellInfo]);

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
