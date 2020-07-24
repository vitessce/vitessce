/* eslint-disable */
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import PubSub from 'pubsub-js';
import {
    GENES_HOVER, CELLS_HOVER, VIEW_INFO,
  } from '../../events';
import Tooltip2D from '../tooltip/Tooltip2D';

export default function HeatmapTooltipSubscriber(props) {
    const { uuid, width, height, transpose } = props;

    const [cellId, setCellId] = useState();
    const [geneId, setGeneId] = useState();
    const [sourceUuid, setSourceUuid] = useState();
    const [viewInfo, setViewInfo] = useState();
    const [x, setX] = useState(null);
    const [y, setY] = useState(null);

    useEffect(() => {
        const cellsHoverToken = PubSub.subscribe(
            CELLS_HOVER, (msg, hoverInfo) => {
                if(!hoverInfo) {
                    setCellId(null);
                    setSourceUuid(null);
                } else {
                    setCellId(hoverInfo.cellId);
                    setSourceUuid(hoverInfo.uuid);
                    if(viewInfo && viewInfo.project) {
                        const [x, y] = viewInfo.project(hoverInfo.cellId, null);
                        if(transpose) {
                            setX(x);
                        } else {
                            setY(y);
                        }
                    }
                }
            },
        );
        const genesHoverToken = PubSub.subscribe(
            GENES_HOVER, (msg, hoverInfo) => {
                if(!hoverInfo) {
                    setGeneId(null);
                    setSourceUuid(null);
                } else {
                    setGeneId(hoverInfo.geneId);
                    setSourceUuid(hoverInfo.uuid);
                    if(viewInfo && viewInfo.project) {
                        const [x, y] = viewInfo.project(null, hoverInfo.geneId);
                        if(transpose) {
                            setY(y);
                        } else {
                            setX(x);
                        }
                    }
                }
            },
        );
        const viewInfoToken = PubSub.subscribe(
            VIEW_INFO, (msg, viewInfo) => {
                if (viewInfo && viewInfo.uuid && uuid === viewInfo.uuid) {
                    setViewInfo(viewInfo);
                }
            },
        );
        return () => {
            PubSub.unsubscribe(cellsHoverToken);
            PubSub.unsubscribe(genesHoverToken);
            PubSub.unsubscribe(viewInfoToken);
        };
    }, [uuid, viewInfo]);

    return (
        <Tooltip2D
            x={x}
            y={y}
            parentUuid={uuid}
            parentWidth={width}
            parentHeight={height}
            sourceUuid={sourceUuid}
        >
            <div>{cellId}</div>
            <div>{geneId}</div>
        </Tooltip2D>
    )
}