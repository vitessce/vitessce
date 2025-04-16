import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { useId } from 'react-aria';
import { TableCell, TableRow } from '@material-ui/core';
import { usePlotOptionsStyles, OptionSelect } from '@vitessce/vit-s';
export default function EmbeddingScatterplotOptions(props) {
    const { mappingSelectEnabled, mappings, selectedMapping, setSelectedMapping, } = props;
    const classes = usePlotOptionsStyles();
    const scatterplotOptionsId = useId();
    // Handlers for custom option field changes.
    const handleSelectedMappingChange = (event) => {
        setSelectedMapping(event.target.value);
    };
    return mappingSelectEnabled
        ? (_jsxs(TableRow, { children: [_jsx(TableCell, { className: classes.labelCell, variant: "head", scope: "row", children: _jsx("label", { htmlFor: `scatterplot-mapping-select-${scatterplotOptionsId}`, children: "Embedding Type" }) }), _jsx(TableCell, { className: classes.inputCell, variant: "body", children: _jsx(OptionSelect, { className: classes.select, value: selectedMapping, onChange: handleSelectedMappingChange, inputProps: {
                            id: `scatterplot-mapping-select-${scatterplotOptionsId}`,
                        }, children: mappings.map(name => (_jsx("option", { value: name, children: name }, name))) }) })] }))
        : null;
}
