import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { Checkbox, makeStyles, } from '@material-ui/core';
import { isEqual } from 'lodash-es';
import { toRgbUIString } from '@vitessce/spatial-utils';
const useStyles = makeStyles(() => ({
    visibilityCheckbox: {
        padding: '8px 0',
    },
}));
function getCheckboxColor(colormapOn, color, theme) {
    if (theme !== 'dark' && isEqual(color, [255, 255, 255])) {
        // Use gray instead of white on white background.
        return toRgbUIString(colormapOn, [132, 132, 132], theme);
    }
    return toRgbUIString(colormapOn, color, theme);
}
/**
 * Checkbox for toggling on/off of a channel.
 * @prop {number[]} color Current color for this channel.
 */
export default function ChannelVisibilityCheckbox(props) {
    const { color, visible, setVisible, disabled, theme, colormapOn, } = props;
    const rgbColor = getCheckboxColor(colormapOn, color, theme);
    const classes = useStyles();
    return (_jsx(Checkbox, { onChange: (e, v) => setVisible(v), checked: visible, disabled: disabled, className: classes.visibilityCheckbox, style: { color: rgbColor, '&$checked': { color: rgbColor } }, inputProps: { 'aria-label': 'Toggle channel visibility' } }));
}
