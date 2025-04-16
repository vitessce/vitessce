import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { makeStyles, Grid, Paper, Typography, Slider, FormGroup, FormControlLabel, Switch, } from '@material-ui/core';
import { DimensionsSVG, } from '@vitessce/icons';
import { useControllerSectionStyles } from './styles.js';
const useStyles = makeStyles(theme => ({
    dimensionsIcon: {
        height: '40px',
        width: '40px',
        '& path': {
            fill: theme.palette.primaryForeground,
        },
    },
    switchFormGroup: {
        float: 'right',
        marginTop: '3px',
    },
    dimensionLabel: {
        padding: 0,
        marginBottom: '0 !important',
        marginTop: '12px !important',
    },
    dimensionSlider: {
        marginTop: '9px',
    },
}));
export default function GlobalDimensionSlider(props) {
    const { label, targetValue, setTargetValue, min = 0, max = 0, spatialRenderingMode = null, setSpatialRenderingMode = null, } = props;
    const lcClasses = useControllerSectionStyles();
    const classes = useStyles();
    const isForZ = spatialRenderingMode !== null;
    function handleRenderingModeChange(event) {
        setSpatialRenderingMode(event.target.checked ? '3D' : '2D');
        if (!event.target.checked) {
            // From 3D to 2D
            // Need to make sure that the targetZ is an integer
            setTargetValue(Math.floor(targetValue));
        }
    }
    return (_jsx(Grid, { item: true, className: lcClasses.layerControllerGrid, children: _jsx(Paper, { className: lcClasses.layerControllerRoot, children: _jsxs(Grid, { container: true, direction: "row", justifyContent: "space-between", children: [_jsx(Grid, { item: true, xs: 1, children: _jsx(DimensionsSVG, { className: classes.dimensionsIcon }) }), _jsx(Grid, { item: true, xs: 1, children: _jsx(Typography, { className: classes.dimensionLabel, children: label }) }), _jsx(Grid, { item: true, xs: 8, children: _jsx(Slider, { value: targetValue, min: min, max: max, step: 1, onChange: (e, v) => setTargetValue(v), className: classes.dimensionSlider, valueLabelDisplay: "auto", orientation: "horizontal", disabled: spatialRenderingMode === '3D', "aria-label": `${label}-slice slider` }) }), _jsx(Grid, { item: true, xs: 2, children: isForZ ? (_jsx(FormGroup, { row: true, className: classes.switchFormGroup, children: _jsx(FormControlLabel, { control: _jsx(Switch, { color: "primary", checked: spatialRenderingMode === '3D', onChange: handleRenderingModeChange, name: "is3dMode" }), label: "3D" }) })) : null })] }) }) }));
}
