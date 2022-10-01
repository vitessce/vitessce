import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
export function Warning(props) {
    const { title, preformatted, unformatted, theme, } = props;
    return (_jsx("div", { className: `vitessce-container vitessce-theme-${theme}`, children: _jsx("div", { className: "warning-layout container-fluid", children: _jsx("div", { className: "row", children: _jsx("div", { className: "col-12", children: _jsxs("div", { className: "card card-body my-2 tooltip-ancestor bg-primary", children: [_jsx("h1", { children: title }), _jsx("pre", { children: preformatted }), _jsx("div", { children: unformatted })] }) }) }) }) }));
}
