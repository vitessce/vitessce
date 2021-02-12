import React from 'react';
import Tooltip2D from '../tooltip/Tooltip2D';
import TooltipContent from '../tooltip/TooltipContent';
import { useComponentHover, useComponentViewInfo } from '../../app/state/hooks';

export default function HeatmapTooltipSubscriber(props) {
  const {
    parentUuid,
    width, height, transpose,
    getCellInfo, getGeneInfo,
    cellHighlight, geneHighlight,
  } = props;

  const sourceUuid = useComponentHover();
  const viewInfo = useComponentViewInfo(parentUuid);

  const [cellInfo, cellCoord] = (cellHighlight && getCellInfo ? (
    [
      getCellInfo(cellHighlight),
      (viewInfo && viewInfo.project
        ? viewInfo.project(cellHighlight, null)[(transpose ? 0 : 1)]
        : null),
    ]
  ) : ([null, null]));

  const [geneInfo, geneCoord] = (geneHighlight && getGeneInfo ? (
    [
      getGeneInfo(geneHighlight),
      (viewInfo && viewInfo.project
        ? viewInfo.project(null, geneHighlight)[(transpose ? 1 : 0)]
        : null),
    ]
  ) : ([null, null]));

  const x = (transpose ? cellCoord : geneCoord);
  const y = (transpose ? geneCoord : cellCoord);

  return (
    (cellInfo || geneInfo ? (
      <Tooltip2D
        x={x}
        y={y}
        parentUuid={parentUuid}
        parentWidth={width}
        parentHeight={height}
        sourceUuid={sourceUuid}
      >
        <TooltipContent info={{ ...geneInfo, ...cellInfo }} />
      </Tooltip2D>
    ) : null)
  );
}
