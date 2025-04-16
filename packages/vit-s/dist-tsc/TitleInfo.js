import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useMemo } from 'react';
import clsx from 'clsx';
import { makeStyles, MenuItem, IconButton, Link } from '@material-ui/core';
import { CloudDownload as CloudDownloadIcon, ArrowDropDown as ArrowDropDownIcon, ArrowDropUp as ArrowDropUpIcon, Settings as SettingsIcon, Close as CloseIcon, } from '@material-ui/icons';
import { TOOLTIP_ANCESTOR } from './classNames.js';
import LoadingIndicator from './LoadingIndicator.js';
import { PopperMenu } from './shared-mui/components.js';
import { useTitleStyles } from './title-styles.js';
const useStyles = makeStyles(theme => ({
    iconButton: {
        border: 'none',
        marginLeft: 0,
        background: 'none',
        color: theme.palette.primaryForeground,
        paddingLeft: '0.25em',
        paddingRight: '0.25em',
        borderRadius: '2px',
        '&:hover': {
            backgroundColor: theme.palette.primaryBackgroundLight,
        },
        '&:first-child': {
            marginLeft: '0.25em',
        },
        '&:last-child': {
            marginRight: '0.25em',
        },
        '& svg': {
            width: '0.7em',
            height: '0.7em',
            verticalAlign: 'middle',
            overflow: 'visible',
        },
    },
    downloadLink: {
        color: theme.palette.primaryForeground,
    },
}));
function SettingsIconWithArrow({ open }) {
    return (_jsxs(_Fragment, { children: [_jsx(SettingsIcon, {}), open ? _jsx(ArrowDropUpIcon, {}) : _jsx(ArrowDropDownIcon, {})] }));
}
function PlotOptions(props) {
    const { options } = props;
    const [open, setOpen] = useState(false);
    const classes = useStyles();
    const buttonIcon = useMemo(() => (_jsx(SettingsIconWithArrow, { open: open })), [open]);
    return (options ? (_jsx(PopperMenu, { open: open, setOpen: setOpen, buttonIcon: buttonIcon, buttonClassName: classes.iconButton, placement: "bottom-end", "aria-label": "Open plot options menu", children: options })) : null);
}
function CloudDownloadIconWithArrow({ open }) {
    return (_jsxs(_Fragment, { children: [_jsx(CloudDownloadIcon, {}), open ? _jsx(ArrowDropUpIcon, {}) : _jsx(ArrowDropDownIcon, {})] }));
}
function DownloadOptions(props) {
    const { urls } = props;
    const [open, setOpen] = useState(false);
    const classes = useStyles();
    const buttonIcon = useMemo(() => (_jsx(CloudDownloadIconWithArrow, { open: open })), [open]);
    return (urls && urls.length ? (_jsx(PopperMenu, { open: open, setOpen: setOpen, buttonIcon: buttonIcon, buttonClassName: classes.iconButton, placement: "bottom-end", "aria-label": "Open download options menu", children: urls.map(({ url, name }) => (_jsx(MenuItem, { dense: true, "aria-label": `Click to download ${name}`, children: _jsxs(Link, { underline: "always", href: url, target: "_blank", rel: "noopener", className: classes.downloadLink, children: ["Download ", name] }) }, `${url}_${name}`))) })) : null);
}
function ClosePaneButton(props) {
    const { removeGridComponent } = props;
    const classes = useStyles();
    return (_jsx(IconButton, { onClick: removeGridComponent, size: "small", className: classes.iconButton, title: "close", "aria-label": "Close panel button", children: _jsx(CloseIcon, {}) }));
}
export function TitleInfo(props) {
    const { title, info, children, isScroll, isSpatial, removeGridComponent, urls, isReady, options, closeButtonVisible = true, downloadButtonVisible = true, } = props;
    const classes = useTitleStyles();
    return (
    // d-flex without wrapping div is not always full height; I don't understand the root cause.
    _jsxs(_Fragment, { children: [_jsxs("div", { className: classes.title, role: "banner", children: [_jsx("div", { className: classes.titleLeft, role: "heading", "aria-level": "1", children: title }), _jsx("div", { className: classes.titleInfo, title: info, role: "note", children: info }), _jsxs("div", { className: classes.titleButtons, role: "toolbar", "aria-label": "Plot options and controls", children: [_jsx(PlotOptions, { options: options }), downloadButtonVisible ? (_jsx(DownloadOptions, { urls: urls })) : null, closeButtonVisible ? (_jsx(ClosePaneButton, { removeGridComponent: removeGridComponent })) : null] })] }), _jsxs("div", { className: clsx(TOOLTIP_ANCESTOR, classes.card, {
                    [classes.scrollCard]: isScroll,
                    [classes.spatialCard]: isSpatial,
                    [classes.noScrollCard]: !isScroll && !isSpatial,
                }), "aria-busy": !isReady, role: "main", children: [!isReady && _jsx(LoadingIndicator, {}), children] })] })
    // "pl-2" only matters when the window is very narrow.
    );
}
