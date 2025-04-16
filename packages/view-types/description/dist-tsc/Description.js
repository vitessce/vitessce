import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { makeStyles } from '@material-ui/core';
const useStyles = makeStyles(theme => ({
    description: {
        '& p, details, table': {
            fontSize: '80%',
            opacity: '0.8',
        },
        '& details': {
            marginBottom: '6px',
        },
        '& summary': {
            // TODO(monorepo): lighten color by 10%
            borderBottom: `1px solid ${theme.palette.primaryBackground}`,
            cursor: 'pointer',
        },
    },
    metadataContainer: {
        paddingLeft: '14px',
        '& table': {
            width: '100%',
            '& td, th': {
                outline: 'none',
                padding: '2px 2px',
                maxWidth: '0',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                width: '50%',
            },
            '& tr:nth-child(even)': {
                // TODO(monorepo): lighten color by 5%
                backgroundColor: `1px solid ${theme.palette.primaryBackground}`,
            },
        },
    },
}));
export default function Description(props) {
    const { description, metadata } = props;
    const classes = useStyles();
    return (_jsxs("div", { className: classes.description, children: [_jsx("p", { children: description }), metadata && Array.from(metadata.entries())
                .map(([layerIndex, { name: layerName, metadata: metadataRecord }]) => (metadataRecord && Object.entries(metadataRecord).length > 0 ? (_jsxs("details", { children: [_jsx("summary", { children: layerName }), _jsx("div", { className: classes.metadataContainer, children: _jsx("table", { children: _jsx("tbody", { children: Object.entries(metadataRecord)
                                    .map(([key, value]) => (_jsxs("tr", { children: [_jsx("th", { title: key, children: key }), _jsx("td", { title: value, children: value })] }, key))) }) }) })] }, layerIndex)) : null))] }));
}
