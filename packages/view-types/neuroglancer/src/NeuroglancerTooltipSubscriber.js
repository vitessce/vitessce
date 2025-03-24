import React from 'react';
import { Tooltip2D, TooltipContent } from '@vitessce/tooltip';
import { useComponentHover } from '@vitessce/vit-s';

export function NeuroglancerTooltipSubscriber(props) {
  const {
    parentUuid,
    width, height,
    x,
    y,
    hoverInfo,
  } = props;

  const sourceUuid = useComponentHover();


  //   console.log('NG tootltip', hoverInfo, sourceUuid, height, width, parentUuid, x, y);

  return (
    (hoverInfo ? (
      <Tooltip2D
        x={x}
        y={y}
        parentUuid={parentUuid}
        parentWidth={width}
        parentHeight={height}
        sourceUuid={sourceUuid}
      >
        <TooltipContent
          info={{ 'Segment ID': hoverInfo }}
          featureType={null}
          featureLabelsMap={null}
        />
      </Tooltip2D>
    ) : null)
  );
}
