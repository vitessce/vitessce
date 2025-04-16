import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import React from 'react';
import { Grid, Typography, Slider, } from '@material-ui/core';
import { abbreviateNumber } from '@vitessce/spatial-utils';
function DimensionSlider(props) {
    const { boundingSlice, sliceValue, setSliceValue, label, } = props;
    const [min, max] = boundingSlice;
    const val = sliceValue || boundingSlice;
    return (_jsxs(Grid, { container: true, direction: "row", justifyContent: "flex-start", alignItems: "center", children: [_jsx(Grid, { item: true, xs: 1, children: _jsxs(Typography, { style: { marginBottom: 0 }, children: [label, ":"] }) }), _jsx(Grid, { item: true, xs: 11, children: _jsx(Slider, { value: val, onChange: (e, v) => setSliceValue(v), valueLabelDisplay: "auto", valueLabelFormat: v => abbreviateNumber(v), "aria-label": `${label}-axis clipping plane slider`, min: min, max: max, step: 0.005, orientation: "horizontal" }) })] }, label));
}
export default function ClippingSliders(props) {
    const { image, spatialSliceX, spatialSliceY, spatialSliceZ, setSpatialSliceX, setSpatialSliceY, setSpatialSliceZ, } = props;
    const [xSliceInit, ySliceInit, zSliceInit] = image.getBoundingCube();
    return (_jsxs(_Fragment, { children: [_jsx(DimensionSlider, { label: "X", boundingSlice: xSliceInit, sliceValue: spatialSliceX, setSliceValue: setSpatialSliceX }), _jsx(DimensionSlider, { label: "Y", boundingSlice: ySliceInit, sliceValue: spatialSliceY, setSliceValue: setSpatialSliceY }), _jsx(DimensionSlider, { label: "Z", boundingSlice: zSliceInit, sliceValue: spatialSliceZ, setSliceValue: setSpatialSliceZ })] }));
}
