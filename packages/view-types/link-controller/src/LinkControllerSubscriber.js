/* eslint-disable dot-notation */
/* eslint-disable no-unused-vars */
import React, {
    useCallback, useRef, forwardRef,
} from 'react';
import {Grid} from '@material-ui/core';
import {TitleInfo, useGridItemSize} from "@vitessce/vit-s";
import LinkController from "./LinkController.js";

export function LinkControllerSubscriber(props) {
    const {
        removeGridComponent,
        theme,
    } = props;
    const [containerRef] = useGridItemSize();
    return (
        <TitleInfo title={"Link Controller"} removeGridComponent={removeGridComponent}
                   theme={theme}>
            <div ref={containerRef}>
                <LinkController></LinkController>
            </div>
        </TitleInfo>);
}
