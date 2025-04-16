import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { useId } from 'react-aria';
import { TableCell, TableRow } from '@material-ui/core';
import { capitalize } from '@vitessce/utils';
import OptionSelect from './OptionSelect.js';
import { useStyles } from './styles.js';
export default function CellColorEncodingOption(props) {
    const { observationsLabel, cellColorEncoding, setCellColorEncoding, } = props;
    const classes = useStyles();
    const cellColorEncodingId = useId();
    const observationsLabelNice = capitalize(observationsLabel);
    function handleColorEncodingChange(event) {
        setCellColorEncoding(event.target.value);
    }
    return (_jsxs(TableRow, { children: [_jsx(TableCell, { className: classes.labelCell, variant: "head", scope: "row", children: _jsxs("label", { htmlFor: `cell-color-encoding-select-${cellColorEncodingId}`, children: [observationsLabelNice, " Color Encoding"] }) }), _jsx(TableCell, { className: classes.inputCell, variant: "body", children: _jsxs(OptionSelect, { className: classes.select, value: cellColorEncoding, onChange: handleColorEncodingChange, inputProps: {
                        id: `cell-color-encoding-select-${cellColorEncodingId}`,
                    }, children: [_jsx("option", { value: "cellSetSelection", children: "Cell Sets" }), _jsx("option", { value: "geneSelection", children: "Gene Expression" })] }) })] }));
}
