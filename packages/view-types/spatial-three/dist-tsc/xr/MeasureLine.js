import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useRef } from 'react';
import { Center, Line, Text } from '@react-three/drei';
export function MeasureLine(props) {
    const { currentLine, scale, } = props;
    const textRef = useRef();
    // TODO: let the text always face the player/camera
    // useFrame((state) => {
    //     const {gl, scene, camera} = state;
    //     if(textRef.current !== null){
    //         if(gl.xr.isPresenting){
    //             console.log(gl)
    //             textRef.current.lookAt = gl.xr.getCamera().position;
    //         }else{
    //             textRef.current.lookAt = camera.position;
    //         }
    //     }
    // })
    return (_jsxs("group", { children: [_jsx(Center, { bottom: true, right: true, position: [currentLine.midPoint.x, currentLine.midPoint.y, currentLine.midPoint.z], rotation: [0, 0, 0], children: _jsx(Text, { color: "gray", scale: 0.05, ref: textRef, children: `${(currentLine.startPoint.distanceTo(currentLine.endPoint) * scale).toFixed(2)} µm` }) }), _jsx(Line, { points: [currentLine.startPoint, currentLine.endPoint], color: "white" // Default
                , lineWidth: 2, dashed: false, segments: true })] }));
}
