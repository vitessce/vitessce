import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* eslint-disable jsx-a11y/label-has-associated-control */
// eslint gets confused by the "id" being within MUI's inputProps.
import React, { useState, useMemo, useCallback } from 'react';
import { useId } from 'react-aria';
import { makeStyles, Grid, Paper, Typography, Slider, Button, Select, Checkbox, MenuItem, } from '@material-ui/core';
import { Add as AddIcon, Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon, Image as ImageIcon, ExpandMore, ExpandLess, MoreVert as MoreVertIcon, } from '@material-ui/icons';
import { viv } from '@vitessce/gl';
import { useAddImageChannelInMetaCoordinationScopes, PopperMenu, } from '@vitessce/vit-s';
import { COLORMAP_OPTIONS, formatBytes } from '@vitessce/utils';
import { useControllerSectionStyles, useSelectStyles, useEllipsisMenuStyles, } from './styles.js';
import ImageChannelController from './ImageChannelController.js';
import ClippingSliders from './ClippingSliders.js';
const useStyles = makeStyles(() => ({
    imageLayerButton: {
        borderStyle: 'dashed',
        marginTop: '10px',
        marginBottom: '10px',
        fontWeight: 400,
    },
    imageChannelControllerGrid: {
        padding: '0',
        flexWrap: 'nowrap',
    },
    channelExpansionButton: {
        display: 'inline-block',
        margin: 0,
        padding: 0,
        minWidth: 0,
        lineHeight: 1,
        width: '50%',
    },
    layerTypeImageIcon: {
        height: '100%',
        width: '50%',
        maxWidth: '24px',
    },
    clippingPanesLabel: {
        marginBottom: '0 !important',
    },
    clippingSliders: {
        padding: '0 8px',
    },
}));
function ImageLayerEllipsisMenu(props) {
    const { colormap, setColormap, photometricInterpretation, setPhotometricInterpretation, spatialTargetResolution, setSpatialTargetResolution, volumetricRenderingAlgorithm, setVolumetricRenderingAlgorithm, spatialLayerTransparentColor, setSpatialLayerTransparentColor, spatialRenderingMode, image, channelScopes, tooltipsVisible, setTooltipsVisible, channelLabelsVisible, setChannelLabelsVisible, channelLabelsOrientation, setChannelLabelsOrientation, channelLabelSize, setChannelLabelSize, } = props;
    const [open, setOpen] = useState(false);
    const selectClasses = useSelectStyles();
    const menuClasses = useEllipsisMenuStyles();
    const is3dMode = spatialRenderingMode === '3D';
    const isMultiResolution = image?.isMultiResolution();
    const multiResolutionStats = image?.getMultiResolutionStats();
    function handleColormapChange(event) {
        setColormap(event.target.value === '' ? null : event.target.value);
    }
    function handleInterpretationChange(event) {
        setPhotometricInterpretation(event.target.value);
    }
    function handleVolumetricChange(event) {
        setVolumetricRenderingAlgorithm(event.target.value);
    }
    function handleResolutionChange(event) {
        setSpatialTargetResolution(event.target.value !== null ? parseInt(event.target.value, 10) : null);
    }
    function handleChannelLabelsOrientationChange(event) {
        setChannelLabelsOrientation(event.target.value);
    }
    const colormapId = useId();
    const interpretationId = useId();
    const transparentId = useId();
    const volumetricId = useId();
    const resolutionId = useId();
    const tooltipsVisibleId = useId();
    const channelLabelsVisibleId = useId();
    const channelLabelsOrientationId = useId();
    const channelLabelSizeId = useId();
    return (_jsxs(PopperMenu, { open: open, setOpen: setOpen, buttonIcon: _jsx(MoreVertIcon, {}), buttonClassName: menuClasses.imageLayerMenuButton, containerClassName: menuClasses.imageLayerPopperContainer, withPaper: true, "aria-label": "Open image layer options menu", children: [_jsxs(MenuItem, { dense: true, disableGutters: true, children: [_jsx("label", { className: menuClasses.imageLayerMenuLabel, htmlFor: colormapId, children: "Colormap:\u00A0" }), _jsxs(Select, { native: true, disabled: photometricInterpretation === 'RGB', onChange: handleColormapChange, value: colormap === null ? '' : colormap, inputProps: { id: colormapId, 'aria-label': 'Colormap selector' }, classes: { root: selectClasses.selectRoot }, children: [_jsx("option", { "aria-label": "None", value: "", children: "None" }), COLORMAP_OPTIONS.map(name => (_jsx("option", { value: name, children: name }, name)))] })] }), _jsxs(MenuItem, { dense: true, disableGutters: true, children: [_jsx("label", { className: menuClasses.imageLayerMenuLabel, htmlFor: interpretationId, children: "Photometric Interpretation:\u00A0" }), _jsxs(Select, { native: true, onChange: handleInterpretationChange, value: photometricInterpretation, inputProps: { id: interpretationId, 'aria-label': 'Photometric interpretation selector' }, classes: { root: selectClasses.selectRoot }, children: [_jsx("option", { "aria-label": "RGB", value: "RGB", children: "RGB" }), channelScopes.length > 0 ? (_jsx("option", { "aria-label": "BlackIsZero", value: "BlackIsZero", children: "BlackIsZero" })) : null] })] }), _jsxs(MenuItem, { dense: true, disableGutters: true, children: [_jsx("label", { className: menuClasses.imageLayerMenuLabel, htmlFor: transparentId, children: "Zero Transparent:\u00A0" }), _jsx(Checkbox, { color: "primary", checked: spatialLayerTransparentColor !== null, onChange: (e, v) => setSpatialLayerTransparentColor(v ? ([0, 0, 0]) : null), inputProps: { id: transparentId, 'aria-label': 'Render zero-value pixels as transparent' } })] }), _jsxs(MenuItem, { dense: true, disableGutters: true, children: [_jsx("label", { className: menuClasses.imageLayerMenuLabel, htmlFor: volumetricId, children: "Volumetric Rendering:\u00A0" }), _jsxs(Select, { native: true, onChange: handleVolumetricChange, value: volumetricRenderingAlgorithm, inputProps: { id: volumetricId, 'aria-label': 'Volumetric rendering algorithm selector' }, classes: { root: selectClasses.selectRoot }, disabled: !is3dMode, children: [_jsx("option", { "aria-label": "Additive", value: "additive", children: "Additive" }), _jsx("option", { "aria-label": "Maximum Intensity Projection", value: "maximumIntensityProjection", children: "Maximum Intensity Projection" })] })] }), _jsxs(MenuItem, { dense: true, disableGutters: true, children: [_jsx("label", { className: menuClasses.imageLayerMenuLabel, htmlFor: resolutionId, children: "Volume Resolution:\u00A0" }), _jsxs(Select, { native: true, disabled: !is3dMode || !isMultiResolution, onChange: handleResolutionChange, value: spatialTargetResolution === null ? 'auto' : spatialTargetResolution, inputProps: { id: resolutionId, 'aria-label': 'Volumetric resolution selector' }, classes: { root: selectClasses.selectRoot }, children: [_jsx("option", { value: "auto", children: "Auto" }), Array.isArray(multiResolutionStats) ? multiResolutionStats.map((stats, resolution) => (stats.canLoad ? (_jsx("option", { value: resolution, children: `3D: ${resolution}x Downsampled, ~${formatBytes(stats.totalBytes)} per channel, (${stats.height}, ${stats.width}, ${stats.depthDownsampled})` }, `(${stats.height}, ${stats.width}, ${stats.depthDownsampled})`)) : null)) : null] })] }), _jsxs(MenuItem, { dense: true, disableGutters: true, children: [_jsx("label", { className: menuClasses.imageLayerMenuLabel, htmlFor: tooltipsVisibleId, children: "Tooltips Visible:\u00A0" }), _jsx(Checkbox, { color: "primary", checked: tooltipsVisible, onChange: (e, v) => setTooltipsVisible(v), inputProps: { id: tooltipsVisibleId, 'aria-label': 'Render pixel value tooltips' } })] }), _jsxs(MenuItem, { dense: true, disableGutters: true, children: [_jsx("label", { className: menuClasses.imageLayerMenuLabel, htmlFor: channelLabelsVisibleId, children: "Channel Labels Visible:\u00A0" }), _jsx(Checkbox, { disabled: photometricInterpretation === 'RGB', color: "primary", checked: channelLabelsVisible, onChange: (e, v) => setChannelLabelsVisible(v), inputProps: { id: channelLabelsVisibleId, 'aria-label': 'Render channel labels' } })] }), _jsxs(MenuItem, { dense: true, disableGutters: true, children: [_jsx("label", { className: menuClasses.imageLayerMenuLabel, htmlFor: channelLabelsOrientationId, children: "Channel Labels Orientation:\u00A0" }), _jsxs(Select, { native: true, disabled: photometricInterpretation === 'RGB', onChange: handleChannelLabelsOrientationChange, value: channelLabelsOrientation, inputProps: { id: channelLabelsOrientationId, 'aria-label': 'Channel labels orientation selector' }, classes: { root: selectClasses.selectRoot }, children: [_jsx("option", { "aria-label": "Vertical", value: "vertical", children: "Vertical" }), _jsx("option", { "aria-label": "Horizontal", value: "horizontal", children: "Horizontal" })] })] }), _jsxs(MenuItem, { dense: true, disableGutters: true, children: [_jsx("label", { className: menuClasses.imageLayerMenuLabel, htmlFor: channelLabelSizeId, children: "Channel Labels Size:\u00A0" }), _jsx(Slider, { disabled: photometricInterpretation === 'RGB', value: channelLabelSize, min: 8, max: 36, step: 1, onChange: (e, v) => setChannelLabelSize(v), className: menuClasses.menuItemSlider, orientation: "horizontal", id: channelLabelSizeId, "aria-label": "Channel labels text size slider" })] })] }));
}
export default function ImageLayerController(props) {
    const { theme, coordinationScopesRaw, layerScope, layerCoordination, setLayerCoordination, channelScopes, channelCoordination, setChannelCoordination, image, featureIndex, targetT, targetZ, spatialRenderingMode, } = props;
    const [open, setOpen] = useState(true);
    const { spatialLayerVisible: visible, spatialLayerOpacity: opacity, spatialLayerColormap: colormap, photometricInterpretation, spatialTargetResolution, volumetricRenderingAlgorithm, spatialLayerTransparentColor, spatialSliceX, spatialSliceY, spatialSliceZ, tooltipsVisible, spatialChannelLabelsVisible: channelLabelsVisible, spatialChannelLabelsOrientation: channelLabelsOrientation, spatialChannelLabelSize: channelLabelSize, } = layerCoordination;
    const { setSpatialLayerVisible: setVisible, setSpatialLayerOpacity: setOpacity, setSpatialLayerColormap: setColormap, setPhotometricInterpretation, setSpatialTargetResolution, setVolumetricRenderingAlgorithm, setSpatialLayerTransparentColor, setSpatialSliceX, setSpatialSliceY, setSpatialSliceZ, setTooltipsVisible, setSpatialChannelLabelsVisible: setChannelLabelsVisible, setSpatialChannelLabelsOrientation: setChannelLabelsOrientation, setSpatialChannelLabelSize: setChannelLabelSize, } = setLayerCoordination;
    const addChannel = useAddImageChannelInMetaCoordinationScopes();
    const visibleSetting = typeof visible === 'boolean' ? visible : true;
    const Visibility = useMemo(() => (visibleSetting
        ? VisibilityIcon
        : VisibilityOffIcon), [visibleSetting]);
    const label = image?.getName();
    const imageNumChannels = image?.getNumChannels();
    const is3dMode = spatialRenderingMode === '3D';
    const handleChannelAdd = useCallback(() => {
        addChannel(coordinationScopesRaw, layerScope);
    }, [addChannel, coordinationScopesRaw, layerScope]);
    const handleVisibleChange = useCallback(() => {
        const nextVisible = typeof visible === 'boolean' ? !visible : false;
        setVisible(nextVisible);
    }, [visible, setVisible]);
    const handleOpacityChange = useCallback((e, v) => setOpacity(v), [setOpacity]);
    const handleOpenChange = useCallback(() => setOpen(prev => !prev), []);
    const classes = useStyles();
    const menuClasses = useEllipsisMenuStyles();
    const controllerSectionClasses = useControllerSectionStyles();
    const isMultiChannel = photometricInterpretation !== 'RGB';
    return (_jsx(Grid, { item: true, className: controllerSectionClasses.layerControllerGrid, children: _jsxs(Paper, { className: controllerSectionClasses.layerControllerRoot, children: [_jsxs(Grid, { container: true, direction: "row", justifyContent: "space-between", children: [_jsx(Grid, { item: true, xs: 1, children: _jsx(Button, { className: menuClasses.imageLayerVisibleButton, onClick: handleVisibleChange, "aria-label": "Toggle layer visibility", children: _jsx(Visibility, {}) }) }), _jsx(Grid, { item: true, xs: 1 }), _jsx(Grid, { item: true, xs: 6, children: _jsx(Typography, { className: menuClasses.imageLayerName, children: label }) }), _jsx(Grid, { item: true, xs: 2, children: _jsx(Slider, { value: opacity, min: 0, max: 1, step: 0.001, onChange: handleOpacityChange, className: menuClasses.imageLayerOpacitySlider, orientation: "horizontal", "aria-label": `Adjust opacity for layer ${label}` }) }), _jsx(Grid, { item: true, xs: 1, children: _jsx(ImageLayerEllipsisMenu, { colormap: colormap, setColormap: setColormap, photometricInterpretation: photometricInterpretation, setPhotometricInterpretation: setPhotometricInterpretation, spatialTargetResolution: spatialTargetResolution, setSpatialTargetResolution: setSpatialTargetResolution, volumetricRenderingAlgorithm: volumetricRenderingAlgorithm, setVolumetricRenderingAlgorithm: setVolumetricRenderingAlgorithm, spatialLayerTransparentColor: spatialLayerTransparentColor, setSpatialLayerTransparentColor: setSpatialLayerTransparentColor, spatialRenderingMode: spatialRenderingMode, image: image, channelScopes: channelScopes, tooltipsVisible: tooltipsVisible, setTooltipsVisible: setTooltipsVisible, channelLabelsVisible: channelLabelsVisible, setChannelLabelsVisible: setChannelLabelsVisible, channelLabelsOrientation: channelLabelsOrientation, setChannelLabelsOrientation: setChannelLabelsOrientation, channelLabelSize: channelLabelSize, setChannelLabelSize: setChannelLabelSize }) }), _jsxs(Grid, { item: true, xs: 1, container: true, direction: "row", children: [_jsx(ImageIcon, { className: classes.layerTypeImageIcon }), isMultiChannel ? (_jsx(Button, { onClick: handleOpenChange, className: classes.channelExpansionButton, "aria-label": "Expand or collapse channel controls", children: open ? _jsx(ExpandLess, {}) : _jsx(ExpandMore, {}) })) : null] })] }), isMultiChannel && open ? (_jsxs(Grid, { container: true, direction: "column", justifyContent: "space-between", className: classes.imageChannelControllerGrid, children: [channelScopes.map((cScope) => {
                            const { spatialTargetC, spatialChannelVisible, spatialChannelOpacity, spatialChannelColor, spatialChannelWindow, } = channelCoordination[cScope];
                            const { setSpatialTargetC, setSpatialChannelVisible, setSpatialChannelOpacity, setSpatialChannelColor, setSpatialChannelWindow, } = setChannelCoordination[cScope];
                            return (_jsx(ImageChannelController, { theme: theme, coordinationScopesRaw: coordinationScopesRaw, layerScope: layerScope, channelScope: cScope, targetT: targetT, targetZ: targetZ, targetC: spatialTargetC, setTargetC: setSpatialTargetC, visible: spatialChannelVisible, setVisible: setSpatialChannelVisible, opacity: spatialChannelOpacity, setOpacity: setSpatialChannelOpacity, color: spatialChannelColor, setColor: setSpatialChannelColor, window: spatialChannelWindow, setWindow: setSpatialChannelWindow, colormapOn: colormap !== null, featureIndex: featureIndex, image: image, spatialRenderingMode: spatialRenderingMode }, cScope));
                        }), _jsx(Button, { disabled: (channelScopes.length === viv.MAX_CHANNELS
                                || channelScopes.length === imageNumChannels), onClick: handleChannelAdd, fullWidth: true, variant: "outlined", className: classes.imageLayerButton, startIcon: _jsx(AddIcon, {}), size: "small", "aria-label": "Add a channel to this layer", children: "Add Channel" })] })) : null, is3dMode && image ? (_jsxs(Grid, { container: true, direction: "column", justifyContent: "space-between", className: classes.imageChannelControllerGrid, children: [_jsx(Typography, { className: classes.clippingPanesLabel, children: "Clipping planes:" }), _jsx(Grid, { item: true, xs: 12, className: classes.clippingSliders, children: _jsx(ClippingSliders, { image: image, spatialSliceX: spatialSliceX, spatialSliceY: spatialSliceY, spatialSliceZ: spatialSliceZ, setSpatialSliceX: setSpatialSliceX, setSpatialSliceY: setSpatialSliceY, setSpatialSliceZ: setSpatialSliceZ }) })] })) : null] }) }));
}
