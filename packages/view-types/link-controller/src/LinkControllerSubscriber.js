/* eslint-disable dot-notation */
/* eslint-disable no-unused-vars */
import React, {
    useCallback, useRef, forwardRef,
} from 'react';
import {Grid} from '@material-ui/core';
import {TitleInfo, useGridItemSize, useReady} from "@vitessce/vit-s";
import LinkController from "./LinkController.js";

export function LinkControllerSubscriber(props) {
    const {
        removeGridComponent,
        code,
        theme,
    } = props;

    const [containerRef] = useGridItemSize();
    return (
        <TitleInfo title={"Link Controller"} removeGridComponent={removeGridComponent}
                   theme={theme} isReady={true}>
            <div ref={containerRef}>
                <LinkController code={code}></LinkController>
            </div>
        </TitleInfo>);
}
