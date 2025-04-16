import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { Select } from '@material-ui/core';
import { useStyles } from './styles.js';
export default function OptionSelect(props) {
    const { classes: classesProp = {} } = props;
    const classes = useStyles();
    return (_jsx(Select, { native: true, disableUnderline: true, ...props, classes: {
            root: classes.optionSelectRoot,
            ...classesProp,
        }, "aria-label": "Select an option" }));
}
