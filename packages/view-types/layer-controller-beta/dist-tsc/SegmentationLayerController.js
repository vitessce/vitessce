import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
/* eslint-disable no-unused-vars */
import React, { useMemo } from 'react';
import SegmentationChannelController from './SegmentationChannelController.js';
export default function SegmentationLayerController(props) {
    const { theme, layerScope, layerCoordination, setLayerCoordination, channelScopes, channelCoordination, setChannelCoordination, } = props;
    // TODO: support per-layer opacity controls?
    const { spatialLayerVisible, spatialLayerOpacity, } = layerCoordination;
    const { setSpatialLayerVisible, setSpatialLayerOpacity, } = setLayerCoordination;
    const reversedChannelScopes = useMemo(() => ([...(channelScopes || [])].reverse()), [channelScopes]);
    return (_jsx(_Fragment, { children: reversedChannelScopes.map((cScope) => {
            const { obsType, featureType, featureValueType, spatialChannelVisible, spatialChannelOpacity, spatialChannelColor: color, spatialSegmentationFilled: filled, spatialSegmentationStrokeWidth: strokeWidth, obsColorEncoding, featureSelection, featureValueColormap, featureValueColormapRange, tooltipsVisible, tooltipCrosshairsVisible, legendVisible, } = channelCoordination[cScope];
            const { setSpatialChannelVisible, setSpatialChannelOpacity, setSpatialChannelColor: setColor, setSpatialSegmentationFilled: setFilled, setSpatialSegmentationStrokeWidth: setStrokeWidth, setObsColorEncoding, setFeatureValueColormap, setFeatureValueColormapRange, setTooltipsVisible, setTooltipCrosshairsVisible, setLegendVisible, } = setChannelCoordination[cScope];
            const obsTypeName = obsType;
            return (_jsx(SegmentationChannelController, { theme: theme, layerScope: layerScope, label: obsTypeName, obsType: obsType, featureType: featureType, featureValueType: featureValueType, opacity: spatialChannelOpacity, setOpacity: setSpatialChannelOpacity, visible: spatialChannelVisible, setVisible: setSpatialChannelVisible, color: color, setColor: setColor, filled: filled, setFilled: setFilled, strokeWidth: strokeWidth, setStrokeWidth: setStrokeWidth, obsColorEncoding: obsColorEncoding, featureSelection: featureSelection, featureValueColormap: featureValueColormap, featureValueColormapRange: featureValueColormapRange, setObsColorEncoding: setObsColorEncoding, setFeatureValueColormap: setFeatureValueColormap, setFeatureValueColormapRange: setFeatureValueColormapRange, tooltipsVisible: tooltipsVisible, setTooltipsVisible: setTooltipsVisible, tooltipCrosshairsVisible: tooltipCrosshairsVisible, setTooltipCrosshairsVisible: setTooltipCrosshairsVisible, legendVisible: legendVisible, setLegendVisible: setLegendVisible }, `${layerScope}-${cScope}`));
        }) }));
}
