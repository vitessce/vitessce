/* eslint-disable dot-notation */
/* eslint-disable no-unused-vars */
import React, {
    useState, useEffect,
} from 'react';
import {TitleInfo, useGridItemSize} from "@vitessce/vit-s";
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
