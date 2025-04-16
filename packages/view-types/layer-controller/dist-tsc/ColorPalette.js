import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { IconButton, makeStyles } from '@material-ui/core';
import { Lens as LensIcon } from '@material-ui/icons';
import { VIEWER_PALETTE } from '@vitessce/utils';
const useStyles = makeStyles(theme => ({
    paletteContainer: {
        width: '70px',
        height: '40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    button: {
        padding: '3px',
        width: '16px',
    },
    icon: {
        width: '17px',
        height: '17px',
        stroke: theme.palette.action.selected,
        'stroke-width': '1px',
    },
}));
const ColorPalette = ({ handleChange }) => {
    const classes = useStyles();
    return (_jsx("div", { className: classes.paletteContainer, "aria-label": "Color swatch", children: VIEWER_PALETTE.map(color => (_jsx(IconButton, { className: classes.button, onClick: () => handleChange(color), "aria-label": `Change color to ${color}`, children: _jsx(LensIcon, { fontSize: "small", style: { color: `rgb(${color})` }, className: classes.icon }) }, color))) }));
};
export default ColorPalette;
