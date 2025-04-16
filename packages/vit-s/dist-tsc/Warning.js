import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core';
import { VITESSCE_CONTAINER } from './classNames.js';
const useStyles = makeStyles(theme => ({
    warningLayout: {
        backgroundColor: theme.palette.gridLayoutBackground,
        position: 'absolute',
        width: '100%',
        height: '100vh',
    },
    containerFluid: {
        width: '100%',
        padding: '15px',
        marginRight: 'auto',
        marginLeft: 'auto',
        boxSizing: 'border-box',
        display: 'flex',
    },
    row: {
        flexGrow: '1',
    },
    warningCard: {
        border: `1px solid ${theme.palette.cardBorder}`,
        flex: '1 1 auto',
        minHeight: '1px',
        padding: '12px',
        marginTop: '8px',
        marginBottom: '8px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        minWidth: '0',
        wordWrap: 'break-word',
        backgroundClip: 'border-box',
        borderRadius: '4px',
        backgroundColor: theme.palette.primaryBackground,
        color: theme.palette.primaryForeground,
    },
}));
export function Warning(props) {
    const { title, preformatted, unformatted, } = props;
    const classes = useStyles();
    return (_jsx("div", { className: VITESSCE_CONTAINER, children: _jsx("div", { className: clsx(classes.warningLayout, classes.containerFluid), children: _jsx("div", { className: classes.row, children: _jsxs("div", { className: classes.warningCard, children: [_jsx("h1", { children: title }), preformatted ? (_jsx("pre", { children: preformatted })) : null, _jsx("p", { children: unformatted })] }) }) }) }));
}
