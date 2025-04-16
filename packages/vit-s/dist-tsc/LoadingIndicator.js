import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { makeStyles, CircularProgress } from '@material-ui/core';
const useStyles = makeStyles(() => ({
    loadingIndicatorBackdrop: {
        position: 'absolute',
        top: '0',
        left: '0',
        zIndex: '1040',
        width: '100%',
        height: '100%',
        borderRadius: '4px',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    loadingIndicatorContainer: {
        display: 'grid',
        placeItems: 'center',
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    visuallyHidden: {
        position: 'absolute',
        height: '1px',
        width: '1px',
        overflow: 'hidden',
        clip: 'rect(1px, 1px, 1px, 1px)',
        whiteSpace: 'nowrap',
    },
}));
export default function LoadingIndicator() {
    const classes = useStyles();
    return (_jsx("div", { className: classes.loadingIndicatorBackdrop, children: _jsxs("div", { className: classes.loadingIndicatorContainer, role: "status", "aria-live": "polite", children: [_jsx(CircularProgress, {}), _jsx("span", { className: classes.visuallyHidden, children: "Loading..." })] }) }));
}
