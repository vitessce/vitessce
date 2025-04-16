import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useCallback } from 'react';
import { useId } from 'react-aria';
import { debounce } from 'lodash-es';
import { Checkbox, Slider, TableCell, TableRow } from '@material-ui/core';
import { capitalize } from '@vitessce/utils';
import { usePlotOptionsStyles, CellColorEncodingOption, OptionsContainer, OptionSelect, } from '@vitessce/vit-s';
import { GLSL_COLORMAPS } from '@vitessce/gl';
export default function ScatterplotOptions(props) {
    const { children, observationsLabel, cellRadius, setCellRadius, cellRadiusMode, setCellRadiusMode, cellOpacity, setCellOpacity, cellOpacityMode, setCellOpacityMode, cellSetLabelsVisible, setCellSetLabelsVisible, tooltipsVisible, setTooltipsVisible, cellSetLabelSize, setCellSetLabelSize, cellSetPolygonsVisible, setCellSetPolygonsVisible, cellColorEncoding, setCellColorEncoding, geneExpressionColormap, setGeneExpressionColormap, geneExpressionColormapRange, setGeneExpressionColormapRange, } = props;
    const scatterplotOptionsId = useId();
    const observationsLabelNice = capitalize(observationsLabel);
    const classes = usePlotOptionsStyles();
    function handleCellRadiusModeChange(event) {
        setCellRadiusMode(event.target.value);
    }
    function handleCellOpacityModeChange(event) {
        setCellOpacityMode(event.target.value);
    }
    function handleRadiusChange(event, value) {
        setCellRadius(value);
    }
    function handleOpacityChange(event, value) {
        setCellOpacity(value);
    }
    function handleLabelVisibilityChange(event) {
        setCellSetLabelsVisible(event.target.checked);
    }
    function handleTooltipsVisibilityChange(event) {
        setTooltipsVisible(event.target.checked);
    }
    function handleLabelSizeChange(event, value) {
        setCellSetLabelSize(value);
    }
    function handlePolygonVisibilityChange(event) {
        setCellSetPolygonsVisible(event.target.checked);
    }
    function handleGeneExpressionColormapChange(event) {
        setGeneExpressionColormap(event.target.value);
    }
    function handleColormapRangeChange(event, value) {
        setGeneExpressionColormapRange(value);
    }
    const handleColormapRangeChangeDebounced = useCallback(debounce(handleColormapRangeChange, 5, { trailing: true }), [handleColormapRangeChange]);
    return (_jsxs(OptionsContainer, { children: [children, _jsx(CellColorEncodingOption, { observationsLabel: observationsLabel, cellColorEncoding: cellColorEncoding, setCellColorEncoding: setCellColorEncoding }), _jsxs(TableRow, { children: [_jsx(TableCell, { className: classes.labelCell, variant: "head", scope: "row", children: _jsxs("label", { htmlFor: `scatterplot-set-labels-visible-${scatterplotOptionsId}`, children: [observationsLabelNice, " Set Labels Visible"] }) }), _jsx(TableCell, { className: classes.inputCell, variant: "body", children: _jsx(Checkbox, { className: classes.checkbox, checked: cellSetLabelsVisible, onChange: handleLabelVisibilityChange, name: "scatterplot-option-cell-set-labels", color: "default", inputProps: {
                                'aria-label': 'Show or hide set labels',
                                id: `scatterplot-set-labels-visible-${scatterplotOptionsId}`,
                            } }) })] }), _jsxs(TableRow, { children: [_jsx(TableCell, { className: classes.labelCell, variant: "head", scope: "row", children: _jsx("label", { htmlFor: `scatterplot-set-tooltips-visible-${scatterplotOptionsId}`, children: "Tooltips Visible" }) }), _jsx(TableCell, { className: classes.inputCell, variant: "body", children: _jsx(Checkbox, { className: classes.checkbox, 
                            /**
                             * We have to use "checked" here, not "value".
                             * The checkbox state is not persisting with value.
                             * For reference, https://v4.mui.com/api/checkbox/
                             */
                            checked: tooltipsVisible, onChange: handleTooltipsVisibilityChange, name: "scatterplot-option-tooltip-visibility", color: "default", inputProps: {
                                'aria-label': 'Show or hide tooltips',
                                id: `scatterplot-set-tooltips-visible-${scatterplotOptionsId}`,
                            } }) })] }), _jsxs(TableRow, { children: [_jsx(TableCell, { className: classes.labelCell, variant: "head", scope: "row", children: _jsxs("label", { htmlFor: `scatterplot-set-label-size-${scatterplotOptionsId}`, children: [observationsLabelNice, " Set Label Size"] }) }), _jsx(TableCell, { className: classes.inputCell, variant: "body", children: _jsx(Slider, { classes: { root: classes.slider, valueLabel: classes.sliderValueLabel }, disabled: !cellSetLabelsVisible, value: cellSetLabelSize, onChange: handleLabelSizeChange, "aria-label": "Scatterplot label size slider", id: `scatterplot-set-label-size-${scatterplotOptionsId}`, valueLabelDisplay: "auto", step: 1, min: 8, max: 36 }) })] }), _jsxs(TableRow, { children: [_jsx(TableCell, { className: classes.labelCell, variant: "head", scope: "row", children: _jsxs("label", { htmlFor: `scatterplot-set-polygons-visible-${scatterplotOptionsId}`, children: [observationsLabelNice, " Set Polygons Visible"] }) }), _jsx(TableCell, { className: classes.inputCell, variant: "body", children: _jsx(Checkbox, { className: classes.checkbox, checked: cellSetPolygonsVisible, onChange: handlePolygonVisibilityChange, name: "scatterplot-option-cell-set-polygons", color: "default", inputProps: {
                                'aria-label': 'Show or hide polygons',
                                id: `scatterplot-set-polygons-visible-${scatterplotOptionsId}`,
                            } }) })] }), _jsxs(TableRow, { children: [_jsx(TableCell, { className: classes.labelCell, variant: "head", scope: "row", children: _jsxs("label", { htmlFor: `scatterplot-set-radius-mode-select-${scatterplotOptionsId}`, children: [observationsLabelNice, " Radius Mode"] }) }), _jsx(TableCell, { className: classes.inputCell, variant: "body", children: _jsxs(OptionSelect, { className: classes.select, value: cellRadiusMode, onChange: handleCellRadiusModeChange, inputProps: {
                                id: `scatterplot-set-radius-mode-select-${scatterplotOptionsId}`,
                            }, children: [_jsx("option", { value: "auto", children: "Auto" }), _jsx("option", { value: "manual", children: "Manual" })] }) })] }), _jsxs(TableRow, { children: [_jsx(TableCell, { className: classes.labelCell, variant: "head", scope: "row", children: _jsxs("label", { htmlFor: `scatterplot-set-radius-size-select-${scatterplotOptionsId}`, children: [observationsLabelNice, " Radius Size"] }) }), _jsx(TableCell, { className: classes.inputCell, variant: "body", children: _jsx(Slider, { classes: { root: classes.slider, valueLabel: classes.sliderValueLabel }, disabled: cellRadiusMode !== 'manual', value: cellRadius, onChange: handleRadiusChange, "aria-label": "Scatterplot radius size slider", id: `scatterplot-set-radius-size-select-${scatterplotOptionsId}`, valueLabelDisplay: "auto", step: 0.01, min: 0.01, max: 10 }) })] }), _jsxs(TableRow, { children: [_jsx(TableCell, { className: classes.labelCell, variant: "head", scope: "row", children: _jsxs("label", { htmlFor: `scatterplot-set-opacity-mode-${scatterplotOptionsId}`, children: [observationsLabelNice, " Opacity Mode"] }) }), _jsx(TableCell, { className: classes.inputCell, variant: "body", children: _jsxs(OptionSelect, { className: classes.select, value: cellOpacityMode, onChange: handleCellOpacityModeChange, inputProps: {
                                id: `scatterplot-set-opacity-mode-${scatterplotOptionsId}`,
                            }, children: [_jsx("option", { value: "auto", children: "Auto" }), _jsx("option", { value: "manual", children: "Manual" })] }) })] }), _jsxs(TableRow, { children: [_jsx(TableCell, { className: classes.labelCell, variant: "head", scope: "row", children: _jsxs("label", { htmlFor: `scatterplot-set-opacity-level-${scatterplotOptionsId}`, children: [observationsLabelNice, " Opacity Level"] }) }), _jsx(TableCell, { className: classes.inputCell, variant: "body", children: _jsx(Slider, { classes: { root: classes.slider, valueLabel: classes.sliderValueLabel }, disabled: cellOpacityMode !== 'manual', value: cellOpacity, onChange: handleOpacityChange, "aria-label": "Scatterplot opacity level slider", id: `scatterplot-set-opacity-level-${scatterplotOptionsId}`, valueLabelDisplay: "auto", step: 0.05, min: 0.0, max: 1.0 }) })] }), _jsxs(TableRow, { children: [_jsx(TableCell, { className: classes.labelCell, variant: "head", scope: "row", children: _jsx("label", { htmlFor: `scatterplot-gene-expression-colormap-${scatterplotOptionsId}`, children: "Gene Expression Colormap" }) }), _jsx(TableCell, { className: classes.inputCell, variant: "body", children: _jsx(OptionSelect, { className: classes.select, value: geneExpressionColormap, onChange: handleGeneExpressionColormapChange, inputProps: {
                                id: `scatterplot-gene-expression-colormap-${scatterplotOptionsId}`,
                            }, children: GLSL_COLORMAPS.map(cmap => (_jsx("option", { value: cmap, children: cmap }, cmap))) }) })] }), _jsxs(TableRow, { children: [_jsx(TableCell, { className: classes.labelCell, variant: "head", scope: "row", children: _jsx("label", { htmlFor: `scatterplot-gene-expression-colormap-range-${scatterplotOptionsId}`, children: "Gene Expression Colormap Range" }) }), _jsx(TableCell, { className: classes.inputCell, variant: "body", children: _jsx(Slider, { classes: { root: classes.slider, valueLabel: classes.sliderValueLabel }, value: geneExpressionColormapRange, onChange: handleColormapRangeChangeDebounced, getAriaLabel: (index) => {
                                const labelPrefix = index === 0 ? 'Low value slider' : 'High value slider';
                                return `${labelPrefix} for scatterplot gene expression colormap range`;
                            }, id: `scatterplot-gene-expression-colormap-range-${scatterplotOptionsId}`, valueLabelDisplay: "auto", step: 0.005, min: 0.0, max: 1.0 }) })] })] }));
}
