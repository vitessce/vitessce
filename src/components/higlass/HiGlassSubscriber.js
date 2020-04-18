import React, { useMemo, useEffect } from "react";
import loadable from '@loadable/component';
import TitleInfo from '../TitleInfo';

import hgViewConfig from "./viewconfig.json";

import 'bootstrap/dist/css/bootstrap.min.css';
import 'higlass/dist/hglib.css';

const HiGlassComponent = loadable(() => import('higlass').then(d => new Promise((resolve) => resolve(d.HiGlassComponent))));

const hgOptionsBase = {
    bounded: true,
    pixelPreciseMarginPadding: true,
    containerPaddingX: 0,
    containerPaddingY: 0,
    sizeMode: 'default'
};

export default function HiGlassSubscriber(props) {
    const { 
        removeGridComponent,
        onReady
    } = props;

    useEffect(() => {
        onReady();
    }, []);

    const hgComponent = useMemo(() => {
        const hgOptions = {
            ...hgOptionsBase,
            theme: 'dark'
        }

        console.log("HiGlassComponent.render");
        return (
            <HiGlassComponent 
                viewConfig={hgViewConfig} 
                options={hgOptions}
                zoomFixed={false}
            />
        );
    }, [onReady]);

    console.log("HiGlassSubscriber.render");
    return (
        <div className="v-higlass-title-wrapper">
            <TitleInfo
                title="HiGlass"
                removeGridComponent={removeGridComponent}
            >
                <div className="v-higlass-wrapper-parent">
                    <div className="v-higlass-wrapper">
                        {hgComponent}
                    </div>
                </div>
            </TitleInfo>
        </div>
    );
}