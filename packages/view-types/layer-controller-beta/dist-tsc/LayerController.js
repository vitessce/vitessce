import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useMemo } from 'react';
import SpotLayerController from './SpotLayerController.js';
import PointLayerController from './PointLayerController.js';
import SegmentationLayerController from './SegmentationLayerController.js';
import ImageLayerController from './ImageLayerController.js';
import GlobalDimensionSlider from './GlobalDimensionSlider.js';
export default function LayerController(props) {
    const { theme, coordinationScopesRaw, segmentationLayerScopes, segmentationLayerCoordination, segmentationChannelScopesByLayer, segmentationChannelCoordination, images, imageLayerScopes, imageLayerCoordination, targetT, targetZ, setTargetT, setTargetZ, spatialRenderingMode, setSpatialRenderingMode, imageChannelScopesByLayer, imageChannelCoordination, spotLayerScopes, spotLayerCoordination, pointLayerScopes, pointLayerCoordination, } = props;
    const anyLayerHasT = Object.values(images || {})
        .some(image => image?.image?.instance.hasTStack());
    const anyLayerHasZ = Object.values(images || {})
        .some(image => image?.image?.instance.hasZStack());
    const maxT = Object.values(images || {})
        .reduce((a, h) => Math.max(a, h?.image?.instance.getNumT()), 1) - 1;
    const maxZ = Object.values(images || {})
        .reduce((a, h) => Math.max(a, h?.image?.instance.getNumZ()), 1) - 1;
    const reversedImageLayerScopes = useMemo(() => ([...(imageLayerScopes || [])].reverse()), [imageLayerScopes]);
    const reversedSegmentationLayerScopes = useMemo(() => ([...(segmentationLayerScopes || [])].reverse()), [segmentationLayerScopes]);
    const reversedSpotLayerScopes = useMemo(() => ([...(spotLayerScopes || [])].reverse()), [spotLayerScopes]);
    const reversedPointLayerScopes = useMemo(() => ([...(pointLayerScopes || [])].reverse()), [pointLayerScopes]);
    return (_jsxs("div", { children: [anyLayerHasZ ? (_jsx(GlobalDimensionSlider, { label: "Z", targetValue: targetZ, setTargetValue: setTargetZ, max: maxZ, spatialRenderingMode: spatialRenderingMode, setSpatialRenderingMode: setSpatialRenderingMode })) : null, anyLayerHasT ? (_jsx(GlobalDimensionSlider, { label: "T", targetValue: targetT, setTargetValue: setTargetT, max: maxT })) : null, pointLayerScopes && reversedPointLayerScopes.map(layerScope => (_jsx(PointLayerController, { theme: theme, layerScope: layerScope, layerCoordination: pointLayerCoordination[0][layerScope], setLayerCoordination: pointLayerCoordination[1][layerScope] }, layerScope))), spotLayerScopes && reversedSpotLayerScopes.map(layerScope => (_jsx(SpotLayerController, { theme: theme, layerScope: layerScope, layerCoordination: spotLayerCoordination[0][layerScope], setLayerCoordination: spotLayerCoordination[1][layerScope] }, layerScope))), segmentationLayerScopes && reversedSegmentationLayerScopes.map(layerScope => (_jsx(SegmentationLayerController, { theme: theme, layerScope: layerScope, layerCoordination: segmentationLayerCoordination[0][layerScope], setLayerCoordination: segmentationLayerCoordination[1][layerScope], channelScopes: segmentationChannelScopesByLayer[layerScope], channelCoordination: segmentationChannelCoordination[0][layerScope], setChannelCoordination: segmentationChannelCoordination[1][layerScope] }, layerScope))), imageLayerScopes && reversedImageLayerScopes.map(layerScope => (_jsx(ImageLayerController, { theme: theme, coordinationScopesRaw: coordinationScopesRaw, layerScope: layerScope, layerCoordination: imageLayerCoordination[0][layerScope], setLayerCoordination: imageLayerCoordination[1][layerScope], channelScopes: imageChannelScopesByLayer[layerScope], channelCoordination: imageChannelCoordination[0][layerScope], setChannelCoordination: imageChannelCoordination[1][layerScope], image: images[layerScope]?.image?.instance, featureIndex: images[layerScope]?.featureIndex, targetT: targetT, targetZ: targetZ, spatialRenderingMode: spatialRenderingMode }, layerScope)))] }));
}
