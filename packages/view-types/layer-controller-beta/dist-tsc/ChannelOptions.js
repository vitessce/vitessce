import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* eslint-disable jsx-a11y/label-has-associated-control */
// eslint gets confused by the "id" being within MUI's inputProps.
import React, { useState } from 'react';
import { useId } from 'react-aria';
import { makeStyles, MenuItem, Select } from '@material-ui/core';
import { MoreVert as MoreVertIcon } from '@material-ui/icons';
import { PopperMenu } from '@vitessce/vit-s';
import { useSelectStyles, useEllipsisMenuStyles } from './styles.js';
const useStyles = makeStyles(() => ({
    channelMenuButton: {
        backgroundColor: 'transparent',
        padding: '3px 0',
        marginTop: '3px',
    },
    menuItemButton: {
        padding: '5px',
        width: '100%',
    },
}));
/**
 * Dropdown for options for a channel on the three dots button.
 */
export default function ChannelOptions(props) {
    const { onRemove, onResetWindowUsingIQR, showValueExtent, setShowValueExtent, } = props;
    const [open, setOpen] = useState(false);
    const classes = useStyles();
    const selectClasses = useSelectStyles();
    const menuClasses = useEllipsisMenuStyles();
    function handleRemove() {
        setOpen(false);
        onRemove();
    }
    function handleDomainTypeChange(event) {
        setShowValueExtent(event.target.value === 'Value Min/Max');
    }
    const domainTypeId = useId();
    return (_jsxs(PopperMenu, { open: open, setOpen: setOpen, buttonIcon: _jsx(MoreVertIcon, { fontSize: "small" }), buttonClassName: classes.channelMenuButton, containerClassName: menuClasses.imageLayerPopperContainer, placement: "bottom-end", withPaper: true, "aria-label": "Open channel options menu", children: [_jsxs(MenuItem, { dense: true, disableGutters: true, children: [_jsx("label", { className: menuClasses.imageLayerMenuLabel, htmlFor: domainTypeId, children: "Slider Extent:\u00A0" }), _jsxs(Select, { native: true, onChange: handleDomainTypeChange, value: showValueExtent ? 'Value Min/Max' : 'Dtype Min/Max', inputProps: { id: domainTypeId, 'aria-label': 'Slider extent selector' }, classes: { root: selectClasses.selectRoot }, children: [_jsx("option", { value: "Value Min/Max", children: "Value Min/Max" }), _jsx("option", { value: "Dtype Min/Max", children: "Dtype Min/Max" })] })] }), _jsx(MenuItem, { dense: true, disableGutters: true, component: "button", onClick: onResetWindowUsingIQR, className: classes.menuItemButton, "aria-label": "Click to use IQR for channel", children: "Reset window using IQR" }), _jsx(MenuItem, { dense: true, disableGutters: true, component: "button", onClick: handleRemove, className: classes.menuItemButton, "aria-label": "Click to remove channel", children: "Remove channel" })] }));
}
