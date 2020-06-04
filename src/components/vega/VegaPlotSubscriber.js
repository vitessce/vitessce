/* eslint-disable */
import React, { useRef, useState, useEffect, useCallback } from 'react';
import PubSub from 'pubsub-js';
import TitleInfo from '../TitleInfo';
import VegaPlot from './VegaPlot';
import { GRID_RESIZE } from '../../events';


export default function VegaPlotSubscriber(props) {
    const {
        removeGridComponent,
        onReady,
    } = props;

    const onReadyCallback = useCallback(onReady, []);

    const containerRef = useRef();

    const [height, setHeight] = useState();
    const [width, setWidth] = useState();

    useEffect(() => {
        function onResize() {
            if (!containerRef.current) return;
            const containerRect = containerRef.current.getBoundingClientRect();
            setHeight(containerRect.height);
            setWidth(containerRect.width);
        }
        const gridResizeToken = PubSub.subscribe(GRID_RESIZE, onResize);
        window.addEventListener('resize', onResize);
        onReadyCallback();
        onResize();
        return () => {
            PubSub.unsubscribe(gridResizeToken);
            window.removeEventListener('resize', onResize);
        };
    }, [onReadyCallback]);

    return (
        <TitleInfo
            title="Statistical Plots"
            removeGridComponent={removeGridComponent}
        >
            <div
                ref={containerRef}
                className="vega-container"
            >
                <VegaPlot width={width} height={height} />
            </div>
        </TitleInfo>
    );
}