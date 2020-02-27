import React, { useMemo, useEffect } from "react";
import { HiGlassComponent } from "higlass";
import hgViewConfig from "./viewconfig.json";

import TitleInfo from '../TitleInfo';

const hgOptionsBase = {
    bounded: true,
    pixelPreciseMarginPadding: true,
    containerPaddingX: 0,
    containerPaddingY: 0,
    sizeMode: 'default',
    theme: 'dark'
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
            onViewConfLoaded: () => {
                onReady();
            }
        }

        console.log("HiGlassComponent.render");
        return (
            <HiGlassComponent 
                viewConfig={hgViewConfig} 
                options={hgOptions}
                zoomFixed={false}
            />
        );
    });

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