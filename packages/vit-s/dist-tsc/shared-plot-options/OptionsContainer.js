import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { Box, Table, TableBody, TableContainer } from '@material-ui/core';
import { useStyles } from './styles.js';
export default function OptionsContainer(props) {
    const { children, } = props;
    const classes = useStyles();
    return (_jsx(Box, { className: classes.box, children: _jsx(TableContainer, { className: classes.tableContainer, children: _jsx(Table, { className: classes.table, size: "small", "aria-label": "Menu of options available for the view", children: _jsx(TableBody, { children: children }) }) }) }));
}
