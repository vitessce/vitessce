import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
export default function EmptyMessage(props) {
    const { visible, message, } = props;
    return visible ? (_jsx("div", { children: message })) : null;
}
