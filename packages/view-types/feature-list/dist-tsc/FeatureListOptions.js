import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React from 'react';
import { useId } from 'react-aria';
import { OptionsContainer, OptionSelect, usePlotOptionsStyles } from '@vitessce/vit-s';
import { TableCell, TableRow, Checkbox } from '@material-ui/core';
import { FEATURELIST_SORT_OPTIONS, ALT_COLNAME } from './constants.js';
export default function FeatureListOptions(props) {
    const { children, featureListSort, setFeatureListSort, featureListSortKey, setFeatureListSortKey, showFeatureTable, setShowFeatureTable, hasFeatureLabels, primaryColumnName, } = props;
    const featureListId = useId();
    function handleFeatureListSortChange(event) {
        setFeatureListSort(event.target.value);
    }
    function handleFeatureListSortKeyChange(event) {
        setFeatureListSortKey(event.target.value);
    }
    function handleShowTableChange(event) {
        setShowFeatureTable(event.target.checked);
    }
    const classes = usePlotOptionsStyles();
    return (_jsxs(OptionsContainer, { children: [children, _jsxs(TableRow, { children: [_jsx(TableCell, { className: classes.labelCell, variant: "head", scope: "row", children: _jsx("label", { htmlFor: `feature-list-sort-option-${featureListId}`, children: "Sort Ordering" }) }), _jsx(TableCell, { variant: "body", children: _jsx(OptionSelect, { className: classes.select, value: featureListSort, onChange: handleFeatureListSortChange, inputProps: {
                                id: `feature-list-sort-option-${featureListId}`,
                            }, children: FEATURELIST_SORT_OPTIONS.map(option => (_jsx("option", { value: option, children: option }, option))) }) })] }), hasFeatureLabels ? (_jsxs(_Fragment, { children: [_jsxs(TableRow, { children: [_jsx(TableCell, { className: classes.labelCell, variant: "head", scope: "row", children: _jsx("label", { htmlFor: `feature-list-sort-key-${featureListId}`, children: "Sort Key" }) }), _jsx(TableCell, { variant: "body", children: _jsx(OptionSelect, { className: classes.select, disabled: featureListSort === 'original', value: featureListSortKey, onChange: handleFeatureListSortKeyChange, inputProps: {
                                        'aria-label': 'Select the feature list sort key',
                                        id: `feature-list-sort-key-${featureListId}`,
                                    }, children: hasFeatureLabels ? (_jsxs(_Fragment, { children: [_jsx("option", { value: "featureLabels", children: primaryColumnName }), _jsx("option", { value: "featureIndex", children: ALT_COLNAME })] })) : (_jsx("option", { value: "featureIndex", children: primaryColumnName })) }) })] }), _jsxs(TableRow, { children: [_jsx(TableCell, { className: classes.labelCell, variant: "head", scope: "row", children: _jsx("label", { htmlFor: `feature-list-show-alternative-ids-${featureListId}`, children: "Show Alternate IDs" }) }), _jsx(TableCell, { className: classes.inputCell, variant: "body", children: _jsx(Checkbox, { className: classes.tableCheckbox, checked: showFeatureTable, onChange: handleShowTableChange, name: "feature-list-show-table", color: "default", inputProps: {
                                        'aria-label': 'Show or hide alternative feature ids',
                                        id: `feature-list-show-alternative-ids-${featureListId}`,
                                    } }) })] })] })) : null] }));
}
