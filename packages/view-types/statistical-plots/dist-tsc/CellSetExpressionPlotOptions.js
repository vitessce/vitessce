import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { useId } from 'react-aria';
import { TableCell, TableRow, TextField } from '@material-ui/core';
import { usePlotOptionsStyles, OptionsContainer, OptionSelect } from '@vitessce/vit-s';
export default function CellSetExpressionPlotOptions(props) {
    const { featureValueTransform, setFeatureValueTransform, featureValueTransformCoefficient, setFeatureValueTransformCoefficient, transformOptions, } = props;
    const cellSetExpressionPlotOptionsId = useId();
    const classes = usePlotOptionsStyles();
    const handleTransformChange = (event) => {
        setFeatureValueTransform(event.target.value === '' ? null : event.target.value);
    };
    // Feels a little hacky, but I think this is the best way to handle
    // the limitations of the v4 material-ui number input.
    const handleTransformCoefficientChange = (event) => {
        const { value } = event.target;
        if (!value) {
            setFeatureValueTransformCoefficient(value);
        }
        else {
            const newCoefficient = Number(value);
            if (!Number.isNaN(newCoefficient) && newCoefficient >= 0) {
                setFeatureValueTransformCoefficient(value);
            }
        }
    };
    return (_jsxs(OptionsContainer, { children: [_jsxs(TableRow, { children: [_jsx(TableCell, { className: classes.labelCell, variant: "head", scope: "row", children: _jsx("label", { htmlFor: `cellset-expression-transform-select-${cellSetExpressionPlotOptionsId}`, children: "Transform" }) }), _jsx(TableCell, { className: classes.inputCell, variant: "body", children: _jsx(OptionSelect, { className: classes.select, value: featureValueTransform === null ? '' : featureValueTransform, onChange: handleTransformChange, inputProps: {
                                id: `cellset-expression-transform-select-${cellSetExpressionPlotOptionsId}`,
                            }, children: transformOptions.map(opt => (_jsx("option", { value: opt.value === null ? '' : opt.value, children: opt.name }, opt.name))) }) })] }), _jsxs(TableRow, { children: [_jsx(TableCell, { className: classes.labelCell, variant: "head", scope: "row", children: _jsx("label", { htmlFor: `cellset-expression-transform-coeff-${cellSetExpressionPlotOptionsId}`, children: "Transform Coefficient" }) }), _jsx(TableCell, { className: classes.inputCell, variant: "body", children: _jsx(TextField, { label: "Transform Coefficient", type: "number", onChange: handleTransformCoefficientChange, value: featureValueTransformCoefficient, InputLabelProps: {
                                shrink: true,
                            }, id: `cellset-expression-transform-coeff-${cellSetExpressionPlotOptionsId}` }) })] })] }));
}
