import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
export default function TooltipContent(props) {
    const { info, } = props;
    return (_jsx("table", { children: _jsx("tbody", { children: Object.entries(info).map(([key, value]) => (_jsxs("tr", { children: [_jsx("th", { children: key }), _jsx("td", { children: value })] }, key))) }) }));
}
