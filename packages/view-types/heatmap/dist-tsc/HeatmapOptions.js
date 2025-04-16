import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useCallback } from 'react';
import { useId } from 'react-aria';
import { debounce } from 'lodash-es';
import { Checkbox, Slider, TableCell, TableRow } from '@material-ui/core';
import { usePlotOptionsStyles, OptionsContainer, OptionSelect } from '@vitessce/vit-s';
import { GLSL_COLORMAPS } from '@vitessce/gl';
export default function HeatmapOptions(props) {
    const { geneExpressionColormap, setGeneExpressionColormap, geneExpressionColormapRange, setGeneExpressionColormapRange, tooltipsVisible, setTooltipsVisible, } = props;
    const classes = usePlotOptionsStyles();
    const heatmapOptionsId = useId();
    function handleGeneExpressionColormapChange(event) {
        setGeneExpressionColormap(event.target.value);
    }
    function handleTooltipsVisibilityChange(event) {
        setTooltipsVisible(event.target.checked);
    }
    function handleColormapRangeChange(event, value) {
        setGeneExpressionColormapRange(value);
    }
    const handleColormapRangeChangeDebounced = useCallback(debounce(handleColormapRangeChange, 5, { trailing: true }), [handleColormapRangeChange]);
    return (_jsxs(OptionsContainer, { children: [_jsxs(TableRow, { children: [_jsx(TableCell, { className: classes.labelCell, variant: "head", scope: "row", children: _jsx("label", { htmlFor: `heatmap-gene-expression-colormap-${heatmapOptionsId}`, children: "Gene Expression Colormap" }) }), _jsx(TableCell, { className: classes.inputCell, variant: "body", children: _jsx(OptionSelect, { className: classes.select, value: geneExpressionColormap, onChange: handleGeneExpressionColormapChange, inputProps: {
                                'aria-label': 'Select gene expression colormap',
                                id: `heatmap-gene-expression-colormap-${heatmapOptionsId}`,
                            }, children: GLSL_COLORMAPS.map(cmap => (_jsx("option", { value: cmap, children: cmap }, cmap))) }) })] }), _jsxs(TableRow, { children: [_jsx(TableCell, { className: classes.labelCell, variant: "head", scope: "row", children: _jsx("label", { htmlFor: `heatmap-gene-expression-colormap-tooltip-visibility-${heatmapOptionsId}`, children: "Tooltips Visible" }) }), _jsx(TableCell, { className: classes.inputCell, variant: "body", children: _jsx(Checkbox, { className: classes.checkbox, 
                            /**
                             * We have to use "checked" here, not "value".
                             * The checkbox state is not persisting with value.
                             * For reference, https://v4.mui.com/api/checkbox/
                             */
                            checked: tooltipsVisible, onChange: handleTooltipsVisibilityChange, name: "heatmap-gene-expression-colormap-tooltip-visibility", color: "default", inputProps: {
                                'aria-label': 'Show or hide tooltips',
                                id: `heatmap-gene-expression-colormap-tooltip-visibility-${heatmapOptionsId}`,
                            } }) })] }), _jsxs(TableRow, { children: [_jsx(TableCell, { className: classes.labelCell, variant: "head", scope: "row", children: _jsx("label", { htmlFor: `heatmap-gene-expression-colormap-range-${heatmapOptionsId}`, children: "Gene Expression Colormap Range" }) }), _jsx(TableCell, { className: classes.inputCell, variant: "body", children: _jsx(Slider, { classes: { root: classes.slider, valueLabel: classes.sliderValueLabel }, value: geneExpressionColormapRange, onChange: handleColormapRangeChangeDebounced, getAriaLabel: index => (index === 0 ? 'Low value colormap range slider' : 'High value colormap range slider'), id: `heatmap-gene-expression-colormap-range-${heatmapOptionsId}`, valueLabelDisplay: "auto", step: 0.005, min: 0.0, max: 1.0 }) })] })] }));
}
