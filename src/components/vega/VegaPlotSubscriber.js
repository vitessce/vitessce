/* eslint-disable */
import React, { useEffect, useCallback } from 'react';
import TitleInfo from '../TitleInfo';
import VegaPlot from './VegaPlot';


export default function VegaPlotSubscriber(props) {
    const {
        removeGridComponent,
        onReady,
    } = props;

    const onReadyCallback = useCallback(onReady, []);

    useEffect(() => {
        onReadyCallback();
    }, [onReadyCallback]);

    return (
        <TitleInfo
            title="Statistical Plots"
            removeGridComponent={removeGridComponent}
        >
            <VegaPlot />
        </TitleInfo>
    );
}