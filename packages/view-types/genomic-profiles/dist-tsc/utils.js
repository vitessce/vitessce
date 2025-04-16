import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
export function createWarningComponent(props) {
    // eslint-disable-next-line react/display-name
    return () => {
        const { title, message, } = props;
        return (_jsxs("div", { children: [_jsx("h1", { children: title }), _jsx("p", { children: message })] }));
    };
}
