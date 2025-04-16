import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable no-unused-vars */
// eslint gets confused by the "id" being within MUI's inputProps.
import React, { useState, useMemo, useCallback } from 'react';
import { useId } from 'react-aria';
import { makeStyles, Grid, Paper, Typography, Slider, MenuItem, Button, Select, Checkbox, } from '@material-ui/core';
import { MoreVert as MoreVertIcon, Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon, } from '@material-ui/icons';
import { PopperMenu } from '@vitessce/vit-s';
import { PointsIconSVG } from '@vitessce/icons';
import { capitalize } from '@vitessce/utils';
import { useControllerSectionStyles, useEllipsisMenuStyles, useSelectStyles, } from './styles.js';
import ChannelColorPickerMenu from './ChannelColorPickerMenu.js';
const useStyles = makeStyles(() => ({
    layerTypePointIcon: {
        height: '100%',
        marginLeft: '1px',
        fill: 'currentColor',
        fontSize: '20px',
        width: '50%',
        maxWidth: '20px',
    },
}));
function PointLayerEllipsisMenu(props) {
    const { featureSelection, obsColorEncoding, setObsColorEncoding, featureValueColormapRange, setFeatureValueColormapRange, tooltipsVisible, setTooltipsVisible, tooltipCrosshairsVisible, setTooltipCrosshairsVisible, legendVisible, setLegendVisible, } = props;
    const [open, setOpen] = useState(false);
    const selectClasses = useSelectStyles();
    const menuClasses = useEllipsisMenuStyles();
    const quantitativeColormapId = useId();
    const colormapRangeId = useId();
    const tooltipsVisibleId = useId();
    const crosshairsVisibleId = useId();
    const legendVisibleId = useId();
    return (_jsxs(PopperMenu, { open: open, setOpen: setOpen, buttonIcon: _jsx(MoreVertIcon, {}), buttonClassName: menuClasses.imageLayerMenuButton, containerClassName: menuClasses.imageLayerPopperContainer, withPaper: true, "aria-label": "Open point layer options menu", children: [_jsxs(MenuItem, { dense: true, disableGutters: true, children: [_jsx("label", { className: menuClasses.imageLayerMenuLabel, htmlFor: quantitativeColormapId, children: "Color Encoding:\u00A0" }), _jsxs(Select, { native: true, onChange: e => setObsColorEncoding(e.target.value), value: obsColorEncoding, inputProps: { id: quantitativeColormapId, 'aria-label': 'Color encoding selector' }, classes: { root: selectClasses.selectRoot }, children: [_jsx("option", { value: "spatialLayerColor", children: "Static Color" }), _jsx("option", { value: "obsLabels", children: "Label Value" })] })] }), _jsxs(MenuItem, { dense: true, disableGutters: true, children: [_jsx("label", { className: menuClasses.imageLayerMenuLabel, htmlFor: colormapRangeId, children: "Colormap Range:\u00A0" }), _jsx(Slider, { disabled: obsColorEncoding !== 'geneSelection', value: featureValueColormapRange, min: 0.0, max: 1.0, step: 0.01, onChange: (e, v) => setFeatureValueColormapRange(v), className: menuClasses.menuItemSlider, orientation: "horizontal", id: colormapRangeId, getAriaLabel: index => (index === 0 ? 'Low value colormap range slider' : 'High value colormap range slider') })] }), _jsxs(MenuItem, { dense: true, disableGutters: true, children: [_jsx("label", { className: menuClasses.imageLayerMenuLabel, htmlFor: tooltipsVisibleId, children: "Tooltips Visible:\u00A0" }), _jsx(Checkbox, { color: "primary", checked: tooltipsVisible, onChange: (e, v) => setTooltipsVisible(v), inputProps: { id: tooltipsVisibleId, 'aria-label': 'Toggle tooltip visibility' } })] }), _jsxs(MenuItem, { dense: true, disableGutters: true, children: [_jsx("label", { className: menuClasses.imageLayerMenuLabel, htmlFor: crosshairsVisibleId, children: "Tooltip Crosshairs Visible:\u00A0" }), _jsx(Checkbox, { color: "primary", checked: tooltipCrosshairsVisible, onChange: (e, v) => setTooltipCrosshairsVisible(v), inputProps: { id: crosshairsVisibleId, 'aria-label': 'Toggle tooltip crosshair visibility' } })] }), _jsxs(MenuItem, { dense: true, disableGutters: true, children: [_jsx("label", { className: menuClasses.imageLayerMenuLabel, htmlFor: legendVisibleId, children: "Legend Visible:\u00A0" }), _jsx(Checkbox, { color: "primary", checked: legendVisible, onChange: (e, v) => setLegendVisible(v), inputProps: { id: legendVisibleId, 'aria-label': 'Toggle legend visibility' } })] })] }));
}
export default function PointLayerController(props) {
    const { theme, layerScope, layerCoordination, setLayerCoordination, palette = null, } = props;
    const { obsType, spatialLayerVisible: visible, spatialLayerOpacity: opacity, obsColorEncoding, featureSelection, featureValueColormap, featureValueColormapRange, spatialLayerColor: color, tooltipsVisible, tooltipCrosshairsVisible, legendVisible, } = layerCoordination;
    const { setSpatialLayerVisible: setVisible, setSpatialLayerOpacity: setOpacity, setObsColorEncoding, setFeatureSelection, setFeatureValueColormap, setFeatureValueColormapRange, setSpatialLayerColor: setColor, setTooltipsVisible, setTooltipCrosshairsVisible, setLegendVisible, } = setLayerCoordination;
    const label = capitalize(obsType);
    const visibleSetting = typeof visible === 'boolean' ? visible : true;
    const Visibility = useMemo(() => (visibleSetting
        ? VisibilityIcon
        : VisibilityOffIcon), [visibleSetting]);
    const isStaticColor = obsColorEncoding === 'spatialLayerColor';
    const isColormap = obsColorEncoding === 'geneSelection';
    const classes = useStyles();
    const lcClasses = useControllerSectionStyles();
    const menuClasses = useEllipsisMenuStyles();
    const handleVisibleChange = useCallback(() => {
        const nextVisible = typeof visible === 'boolean' ? !visible : false;
        setVisible(nextVisible);
    }, [visible, setVisible]);
    const handleOpacityChange = useCallback((e, v) => setOpacity(v), [setOpacity]);
    return (_jsx(Grid, { item: true, className: lcClasses.layerControllerGrid, children: _jsx(Paper, { className: lcClasses.layerControllerRoot, children: _jsxs(Grid, { container: true, direction: "row", justifyContent: "space-between", children: [_jsx(Grid, { item: true, xs: 1, children: _jsx(Button, { onClick: handleVisibleChange, className: menuClasses.imageLayerVisibleButton, "aria-label": "Toggle layer visibility", children: _jsx(Visibility, {}) }) }), _jsx(Grid, { item: true, xs: 1, children: _jsx(ChannelColorPickerMenu, { theme: theme, color: color, setColor: setColor, palette: palette, isStaticColor: isStaticColor, isColormap: isColormap, featureValueColormap: featureValueColormap, visible: visible }) }), _jsx(Grid, { item: true, xs: 6, children: _jsx(Typography, { className: menuClasses.imageLayerName, children: label }) }), _jsx(Grid, { item: true, xs: 2, children: _jsx(Slider, { value: opacity, min: 0, max: 1, step: 0.001, onChange: handleOpacityChange, className: menuClasses.imageLayerOpacitySlider, orientation: "horizontal", "aria-label": `Adjust opacity for layer ${label}` }) }), _jsx(Grid, { item: true, xs: 1, children: _jsx(PointLayerEllipsisMenu, { featureSelection: featureSelection, obsColorEncoding: obsColorEncoding, setObsColorEncoding: setObsColorEncoding, featureValueColormapRange: featureValueColormapRange, setFeatureValueColormapRange: setFeatureValueColormapRange, tooltipsVisible: tooltipsVisible, setTooltipsVisible: setTooltipsVisible, tooltipCrosshairsVisible: tooltipCrosshairsVisible, setTooltipCrosshairsVisible: setTooltipCrosshairsVisible, legendVisible: legendVisible, setLegendVisible: setLegendVisible }) }), _jsx(Grid, { item: true, xs: 1, children: _jsx(PointsIconSVG, { className: classes.layerTypePointIcon }) })] }) }) }));
}
