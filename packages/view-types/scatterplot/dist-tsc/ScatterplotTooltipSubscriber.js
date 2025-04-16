import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { Tooltip2D, TooltipContent } from '@vitessce/tooltip';
import { useComponentHover, useComponentViewInfo } from '@vitessce/vit-s';
export default function ScatterplotTooltipSubscriber(props) {
    const { parentUuid, obsHighlight, width, height, getObsInfo, } = props;
    const sourceUuid = useComponentHover();
    const viewInfo = useComponentViewInfo(parentUuid);
    const [cellInfo, x, y] = (obsHighlight && getObsInfo ? ([
        getObsInfo(obsHighlight),
        ...(viewInfo && viewInfo.projectFromId ? viewInfo.projectFromId(obsHighlight) : [null, null]),
    ]) : ([null, null, null]));
    return ((cellInfo ? (_jsx(Tooltip2D, { x: x, y: y, parentUuid: parentUuid, sourceUuid: sourceUuid, parentWidth: width, parentHeight: height, children: _jsx(TooltipContent, { info: cellInfo }) })) : null));
}
