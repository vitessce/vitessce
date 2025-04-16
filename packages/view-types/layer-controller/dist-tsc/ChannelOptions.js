import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { makeStyles, MenuItem } from '@material-ui/core';
import { MoreVert as MoreVertIcon } from '@material-ui/icons';
import { PopperMenu } from '@vitessce/vit-s';
import { useSpanStyles } from './styles.js';
import ColorPalette from './ColorPalette.js';
const useStyles = makeStyles(() => ({
    menuButton: {
        backgroundColor: 'transparent',
    },
    colors: {
        '&:hover': {
            backgroundColor: 'transparent',
        },
        paddingLeft: '2px',
        paddingRight: '2px',
    },
}));
function MuiSpan(props) {
    const { children } = props;
    const classes = useSpanStyles();
    return _jsx("span", { className: classes.span, children: children });
}
/**
 * Dropdown for options for a channel on the three dots button.
 * @prop {function} handlePropertyChange Callback for changing property (color, IQR of sliders).
 * @prop {function} handleChannelRemove Callback for channel removal.
 * @prop {function} handleIQRUpdate Callback for IQR slider update.
 */
function ChannelOptions({ handlePropertyChange, handleChannelRemove, handleIQRUpdate }) {
    const [open, setOpen] = useState(false);
    const classes = useStyles();
    const handleColorSelect = (color) => {
        handlePropertyChange('color', color);
    };
    const handleRemove = () => {
        setOpen(false);
        handleChannelRemove();
    };
    return (_jsxs(PopperMenu, { open: open, setOpen: setOpen, buttonIcon: _jsx(MoreVertIcon, { fontSize: "small" }), buttonClassName: classes.menuButton, "aria-label": "Open channel options menu", children: [_jsx(MenuItem, { dense: true, disableGutters: true, onClick: handleRemove, "aria-label": "Click to remove channel", children: _jsx(MuiSpan, { children: "Remove" }) }), _jsx(MenuItem, { dense: true, disableGutters: true, onClick: handleIQRUpdate, "aria-label": "Click to use IQR for channel", children: _jsx(MuiSpan, { children: "Use IQR" }) }), _jsx(MenuItem, { dense: true, disableGutters: true, className: classes.colors, "aria-label": "Click to select color for channel", children: _jsx(ColorPalette, { handleChange: handleColorSelect }) })] }));
}
export default ChannelOptions;
