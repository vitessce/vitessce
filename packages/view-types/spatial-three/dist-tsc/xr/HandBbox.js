import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/* eslint-disable react/no-unknown-property */
import { useXR } from '@react-three/xr';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
export function HandBbox() {
    const { controllers } = useXR();
    const rightTipRef = useRef();
    const leftTipRef = useRef();
    useFrame(() => {
        if (controllers && controllers[0] && controllers[1]) {
            if (controllers[0].controller) {
                const rightTipPosition = controllers[0].hand.joints['index-finger-tip'].position;
                rightTipRef.current.position.copy(rightTipPosition);
            }
            if (controllers[1].controller) {
                const leftTipPosition = controllers[1].hand.joints['index-finger-tip'].position;
                leftTipRef.current.position.copy(leftTipPosition);
            }
        }
    });
    return (_jsxs(_Fragment, { children: [_jsxs("mesh", { name: "leftTipBbox", ref: leftTipRef, children: [_jsx("boxGeometry", { args: [0.02, 0.02, 0.02] }), _jsx("meshStandardMaterial", { color: "blue", transparent: true, opacity: 0 })] }), _jsxs("mesh", { name: "rightTipBbox", ref: rightTipRef, children: [_jsx("boxGeometry", { args: [0.02, 0.02, 0.02] }), _jsx("meshStandardMaterial", { color: "orange", transparent: true, opacity: 0 })] })] }));
}
