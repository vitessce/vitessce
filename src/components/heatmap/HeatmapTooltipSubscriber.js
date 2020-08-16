import React, { useEffect, useState } from 'react';
import PubSub from 'pubsub-js';
import { VIEW_INFO } from '../../events';
import Tooltip2D from '../tooltip/Tooltip2D';
import TooltipContent from '../tooltip/TooltipContent';
import { useCoordination } from '../../app/state/hooks';

export default function HeatmapTooltipSubscriber(props) {
  const {
    uuid, width, height, transpose, getCellInfo, getGeneInfo,
    coordinationScopes,
  } = props;

  const [cellInfo, setCellInfo] = useState();
  const [geneInfo, setGeneInfo] = useState();

  const [sourceUuid, setSourceUuid] = useState();
  const [viewInfo, setViewInfo] = useState();
  const [x, setX] = useState(null);
  const [y, setY] = useState(null);

  const [{ cellHighlight, geneHighlight }] = useCoordination(['cellHighlight', 'geneHighlight'], coordinationScopes);

  useEffect(() => {
    const viewInfoToken = PubSub.subscribe(
      VIEW_INFO, (msg, newViewInfo) => {
        if (newViewInfo && newViewInfo.uuid && uuid === newViewInfo.uuid) {
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
        const [newX, newY] = viewInfo.project(cellHighlight.cellId, null);
        if (transpose) {
          setX(newX);
        } else {
          setY(newY);
        }
      }
    }
  }, [cellHighlight, viewInfo, getCellInfo, transpose]);

  // React to gene highlight updates.
  useEffect(() => {
    if (!geneHighlight) {
      setGeneInfo(null);
    } else {
      const newGeneInfo = getGeneInfo(geneHighlight.geneId);
      setGeneInfo(newGeneInfo);
      if (viewInfo && viewInfo.project) {
        const [newX, newY] = viewInfo.project(null, geneHighlight.geneId);
        if (transpose) {
          setY(newY);
        } else {
          setX(newX);
        }
      }
    }
  }, [geneHighlight, viewInfo, getGeneInfo, transpose]);

  return (
    (cellInfo || geneInfo ? (
      <Tooltip2D
        x={x}
        y={y}
        parentUuid={uuid}
        parentWidth={width}
        parentHeight={height}
        sourceUuid={sourceUuid}
      >
        <TooltipContent info={{ ...geneInfo, ...cellInfo }} />
      </Tooltip2D>
    ) : null)
  );
}
