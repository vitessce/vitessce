import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { Grid, Checkbox, Paper, Typography, Slider } from '@material-ui/core';
import { useControllerSectionStyles } from './styles.js';
export default function VectorLayerController(props) {
    const { label, layer, layerType, handleLayerChange, } = props;
    const slider = layer.opacity;
    const isOn = layer.visible;
    function handleSliderChange(v) {
        if (layerType === 'cells') {
            const stroked = v < 0.7;
            handleLayerChange({ ...layer, opacity: v, stroked });
        }
        else {
            handleLayerChange({ ...layer, opacity: v });
        }
    }
    function handleCheckBoxChange(v) {
        handleLayerChange({ ...layer, visible: v });
    }
    const classes = useControllerSectionStyles();
    return (_jsx(Grid, { item: true, style: { marginTop: '10px' }, children: _jsxs(Paper, { className: classes.layerControllerRoot, children: [_jsx(Typography, { style: {
                        padding: '15px 8px 0px 8px',
                        marginBottom: '-5px',
                    }, children: label }), _jsxs(Grid, { container: true, direction: "row", justifyContent: "space-between", children: [_jsx(Grid, { item: true, xs: 2, children: _jsx(Checkbox, { color: "primary", checked: isOn, onChange: (e, v) => handleCheckBoxChange(v), inputProps: { 'aria-label': 'Show or hide vector layer' } }) }), _jsx(Grid, { item: true, xs: 9, style: { paddingRight: '8px' }, children: _jsx(Slider, { value: slider, min: 0, max: 1, step: 0.001, onChange: (e, v) => handleSliderChange(v), style: { marginTop: '7px' }, orientation: "horizontal", getAriaLabel: (index) => {
                                    const labelPrefix = index === 0 ? 'Low value slider' : 'High value slider';
                                    return `${labelPrefix} for ${label} layer controller`;
                                } }) })] })] }) }));
}
