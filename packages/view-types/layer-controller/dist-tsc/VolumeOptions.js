import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import React from 'react';
import { Matrix4 } from 'math.gl';
import { Grid, Typography, Button, makeStyles, createStyles, FormControl, Select, InputLabel, Slider, } from '@material-ui/core';
import { viv } from '@vitessce/gl';
import { abbreviateNumber, getBoundingCube } from '@vitessce/spatial-utils';
import { useSelectStyles } from './styles.js';
const useSlicerStyles = makeStyles(theme => createStyles({
    enabled: {},
    disabled: {
        color: theme.palette.text.disabled,
        // Because of the .5 opacity of the disabled color in the theme, and the fact
        // that there are multiple overlaid parts to the slider,
        // this needs to be set manually for the desired effect.
        '& .MuiSlider-thumb': {
            color: 'rgb(100, 100, 100, 1.0)',
        },
        '&  .MuiSlider-track': {
            color: 'rgb(100, 100, 100, 1.0)',
        },
    },
}));
const Slicer = ({ xSlice, ySlice, zSlice, handleSlicerSetting, loader, use3d, }) => {
    const [xSliceInit, ySliceInit, zSliceInit] = getBoundingCube(loader.data);
    const sliceValuesAndSetSliceFunctions = [
        [
            xSlice,
            xSliceNew => handleSlicerSetting('x', xSliceNew),
            'x',
            xSliceInit,
        ],
        [
            ySlice,
            ySliceNew => handleSlicerSetting('y', ySliceNew),
            'y',
            ySliceInit,
        ],
        [
            zSlice,
            zSliceNew => handleSlicerSetting('z', zSliceNew),
            'z',
            zSliceInit,
        ],
    ];
    const classes = useSlicerStyles();
    const Slicers = sliceValuesAndSetSliceFunctions.map(([val, setVal, label, [min, max]]) => (_jsxs(Grid, { container: true, direction: "row", justifyContent: "flex-start", alignItems: "center", children: [_jsx(Grid, { item: true, xs: 1, children: _jsxs(Typography, { className: !use3d ? classes.disabled : classes.enabled, style: { marginBottom: 0 }, children: [label, ":"] }) }), _jsx(Grid, { item: true, xs: 11, children: _jsx(Slider, { disabled: !use3d, className: !use3d ? classes.disabled : classes.enabled, value: val, onChange: (e, v) => setVal(v), valueLabelDisplay: "auto", valueLabelFormat: v => abbreviateNumber(v), "aria-label": `Volume options ${label} slider`, min: min, max: max, step: 0.005, orientation: "horizontal" }) })] }, label)));
    return (_jsxs(_Fragment, { children: [_jsxs(Typography, { className: !use3d ? classes.disabled : classes.enabled, style: { marginTop: 16, marginBottom: 0 }, children: ["Clipping Planes:", ' '] }), ' ', Slicers] }));
};
const renderingOptions = Object.values(viv.RENDERING_MODES);
function RenderingModeSelect({ handleRenderingModeChange, renderingMode, use3d, }) {
    const classes = useSelectStyles();
    // Empty option allows for displaying the title of the dropdown fully in the UI.
    const options = !use3d ? [...renderingOptions, ''] : renderingOptions;
    return (_jsxs(FormControl, { fullWidth: true, children: [_jsx(InputLabel, { htmlFor: "rendering-mode-select", children: "Rendering Mode" }), _jsx(Select, { native: true, onChange: e => handleRenderingModeChange(e.target.value), value: use3d ? renderingMode : '', inputProps: {
                    name: 'rendering-mode',
                    id: 'rendering-mode-select',
                    'aria-label': 'Select rendering mode option',
                }, disabled: !use3d, classes: { root: classes.selectRoot }, children: options.map(name => (_jsx("option", { value: name, children: name }, name))) })] }));
}
const ReCenterButton = ({ setViewState, use3d, spatialHeight, spatialWidth, loader, modelMatrix, }) => (_jsx(Grid, { item: true, xs: "auto", children: _jsx(Button, { onClick: () => {
            const defaultViewState = viv.getDefaultInitialViewState(loader.data, { height: spatialHeight, width: spatialWidth }, 1.5, use3d, new Matrix4(modelMatrix));
            setViewState({
                ...defaultViewState,
                rotationX: 0,
                rotationOrbit: 0,
            });
        }, disabled: !use3d, style: {
            padding: 0,
            marginBottom: 6,
        }, children: "Re-Center" }) }, "recenter"));
const VolumeOptions = ({ handleSlicerSetting, handleRenderingModeChange, renderingMode, xSlice, ySlice, zSlice, use3d, loader, setViewState, spatialHeight, spatialWidth, modelMatrix, }) => (_jsxs(_Fragment, { children: [_jsx(RenderingModeSelect, { handleRenderingModeChange: handleRenderingModeChange, renderingMode: renderingMode, use3d: use3d }), _jsx(Slicer, { xSlice: xSlice, ySlice: ySlice, zSlice: zSlice, handleSlicerSetting: handleSlicerSetting, use3d: use3d, loader: loader }), _jsx(ReCenterButton, { setViewState: setViewState, use3d: use3d, spatialHeight: spatialHeight, spatialWidth: spatialWidth, loader: loader, modelMatrix: modelMatrix })] }));
export default VolumeOptions;
