import React from 'react';
import { Tooltip2D, TooltipContent } from '@vitessce/tooltip';
import { useComponentHover, useComponentViewInfo } from '@vitessce/vit-s';

export default function HeatmapTooltipSubscriber(props) {
  const {
    parentUuid,
    width,
    height,
    transpose,
    getObsInfo,
    getFeatureInfo,
    obsHighlight,
    featureHighlight,
  } = props;

  const sourceUuid = useComponentHover();
  const viewInfo = useComponentViewInfo(parentUuid);

  const [cellInfo, cellCoord] = obsHighlight && getObsInfo
    ? [
      getObsInfo(obsHighlight),
      viewInfo && viewInfo.project
        ? viewInfo.project(obsHighlight, null)[transpose ? 0 : 1]
        : null,
    ]
    : [null, null];

  const [geneInfo, geneCoord] = featureHighlight && getFeatureInfo
    ? [
      getFeatureInfo(featureHighlight),
      viewInfo && viewInfo.project
        ? viewInfo.project(null, featureHighlight)[transpose ? 1 : 0]
        : null,
    ]
    : [null, null];

  const x = transpose ? cellCoord : geneCoord;
  const y = transpose ? geneCoord : cellCoord;

  return cellInfo || geneInfo ? (
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
  ) : null;
}
