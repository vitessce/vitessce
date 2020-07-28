import React, { useEffect, useState } from 'react';
import PubSub from 'pubsub-js';
import {
  GENES_HOVER, CELLS_HOVER, VIEW_INFO,
} from '../../events';
import Tooltip2D from '../tooltip/Tooltip2D';
import TooltipContent from '../tooltip/TooltipContent';

export default function HeatmapTooltipSubscriber(props) {
  const {
    uuid, width, height, transpose, getCellInfo, getGeneInfo,
  } = props;

  const [cellInfo, setCellInfo] = useState();
  const [geneInfo, setGeneInfo] = useState();

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
            const [newX, newY] = viewInfo.project(hoverInfo.cellId, null);
            if (transpose) {
              setX(newX);
            } else {
              setY(newY);
            }
          }
        }
      },
    );
    const genesHoverToken = PubSub.subscribe(
      GENES_HOVER, (msg, hoverInfo) => {
        if (!hoverInfo) {
          setGeneInfo(null);
          setSourceUuid(null);
        } else {
          const newGeneInfo = getGeneInfo(hoverInfo.geneId);
          setGeneInfo(newGeneInfo);
          setSourceUuid(hoverInfo.uuid);
          if (viewInfo && viewInfo.project) {
            const [newX, newY] = viewInfo.project(null, hoverInfo.geneId);
            if (transpose) {
              setY(newY);
            } else {
              setX(newX);
            }
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
      PubSub.unsubscribe(genesHoverToken);
      PubSub.unsubscribe(viewInfoToken);
    };
  }, [getCellInfo, getGeneInfo, transpose, uuid, viewInfo]);

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
