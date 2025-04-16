import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unknown-property */
import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Bvh } from '@react-three/drei';
import { useXR, RayGrab } from '@react-three/xr';
import { FrontSide, Vector3, Box3 } from 'three';
import { MeasureLine } from './xr/MeasureLine.js';
// Rendering a combination of a volume dataset and segmentations (meshes)
export function GeometryAndMesh(props) {
    const { segmentationGroup, segmentationSettings, segmentationSceneScale, renderingSettings, materialRef, highlightEntity, setObsHighlight, } = props;
    const model = useRef();
    const distanceRef = useRef();
    const rayGrabGroup = useRef();
    // -----------------------------------------------------------------
    //                          XR
    // -----------------------------------------------------------------
    const { isPresenting } = useXR();
    useEffect(() => {
        if (isPresenting && model?.current) {
            // Needed to get the Fragment Depth Value Right
            if (materialRef !== null) {
                materialRef.current.material.uniforms.u_physical_Pixel.value = 0.2;
            }
        }
        else if (!isPresenting) {
            // Needed to get the Fragment Depth Value Right
            if (materialRef !== null) {
                materialRef.current.material.uniforms.u_physical_Pixel.value = 2.5;
            }
        }
    }, [isPresenting]);
    const { scene } = useThree();
    const { controllers } = useXR();
    const [measureState, setMeasureState] = useState(false);
    const [highlighted, setHighlighted] = useState(false);
    const [showLine, setShowLine] = useState(false);
    const [currentLine, setCurrentLine] = useState({
        startPoint: new Vector3(),
        midPoint: new Vector3(),
        endPoint: new Vector3(),
        setStartPoint: false,
        setEndPoint: false,
    });
    const [lines, setLines] = useState([]);
    const [debounce, setDebounce] = useState(0);
    // This Block is used to handle Hande Interactions in XR to create measurements
    useFrame(() => {
        if (isPresenting) {
            const rightTipBbox = scene.getObjectByName('rightTipBbox');
            const leftTipBbox = scene.getObjectByName('leftTipBbox');
            const leftTipBB = new Box3().setFromObject(leftTipBbox);
            const rightTipBB = new Box3().setFromObject(rightTipBbox);
            let intersected = false;
            setDebounce(debounce - 1.0);
            if (leftTipBB.intersectsBox(rightTipBB) && leftTipBB.max.x !== -rightTipBB.min.x) {
                setMeasureState(true);
                setShowLine(true);
                setCurrentLine({
                    startPoint: new Vector3(),
                    midPoint: new Vector3(),
                    endPoint: new Vector3(),
                    setStartPoint: false,
                    setEndPoint: false,
                });
            }
            if (measureState) {
                let leftFingerPosition = controllers[1].hand.joints['index-finger-tip'].position.clone();
                let rightFingerPosition = controllers[0].hand.joints['index-finger-tip'].position.clone();
                leftFingerPosition = leftFingerPosition.applyMatrix4(rayGrabGroup.current.matrixWorld.clone().invert());
                rightFingerPosition = rightFingerPosition.applyMatrix4(rayGrabGroup.current.matrixWorld.clone().invert());
                let currentStart = leftFingerPosition.clone();
                let currentEnd = rightFingerPosition.clone();
                if (currentLine.setStartPoint) {
                    currentStart = currentLine.startPoint;
                }
                if (currentLine.setEndPoint) {
                    currentEnd = currentLine.endPoint;
                }
                setCurrentLine({
                    startPoint: currentStart,
                    midPoint: new Vector3().addVectors(currentStart, currentEnd).multiplyScalar(0.5),
                    endPoint: currentEnd,
                    setStartPoint: currentLine.setStartPoint,
                    setEndPoint: currentLine.setEndPoint,
                });
                if (controllers[0].hand.inputState.pinching === true) {
                    // right hand set measure point
                    setCurrentLine({
                        startPoint: currentLine.startPoint,
                        midPoint: currentLine.midPoint,
                        endPoint: currentLine.endPoint,
                        setStartPoint: currentLine.setStartPoint,
                        setEndPoint: true,
                    });
                }
                if (controllers[1].hand.inputState.pinching === true) {
                    // left hand set measure point
                    setCurrentLine({
                        startPoint: currentLine.startPoint,
                        midPoint: currentLine.midPoint,
                        endPoint: currentLine.endPoint,
                        setStartPoint: true,
                        setEndPoint: currentLine.setEndPoint,
                    });
                }
                if (currentLine.setStartPoint && currentLine.setEndPoint) {
                    lines.push(currentLine);
                    setLines(lines);
                    setShowLine(false);
                    setMeasureState(false);
                    setDebounce(8);
                }
            }
            else if (debounce <= 0 && model?.current && isPresenting) {
                model.current.children[0].children.forEach((childVal, childID) => {
                    const child = model.current.children[0].children[childID];
                    const currentObjectBB = new Box3().setFromObject(child);
                    const intersectsLeftTip = leftTipBB.intersectsBox(currentObjectBB);
                    const intersectsRightTip = rightTipBB.intersectsBox(currentObjectBB);
                    if (intersectsLeftTip || intersectsRightTip) {
                        intersected = true;
                        setObsHighlight(child.name);
                        setHighlighted(true);
                        if (controllers[1] !== undefined && intersectsLeftTip && controllers[1].hand.inputState.pinching === true) {
                            setDebounce(10);
                            intersected = false;
                            controllers[1].hand.inputState.pinching = false;
                        }
                        if (controllers[0] !== undefined && intersectsRightTip && controllers[0].hand.inputState.pinching === true) {
                            setDebounce(10);
                            intersected = false;
                            controllers[0].hand.inputState.pinching = false;
                        }
                    }
                });
                if (!intersected && highlighted) {
                    setObsHighlight(null);
                    setHighlighted(false);
                }
            }
        }
    }, [measureState, highlighted, currentLine, lines, showLine, debounce, isPresenting]);
    // TODO: IF we want to have a ZoomGrab than it needs to adapt the 0.002 value
    // TODO: The measurement from time to time intersects with the rayGrab (maybe "tell it" that we are in measurement mode)
    return (_jsx("group", { children: useXR().isPresenting ? (_jsxs(RayGrab, { children: [_jsxs("group", { ref: rayGrabGroup, children: [segmentationGroup?.visible ? (_jsxs("group", { children: [_jsx("hemisphereLight", { skyColor: 0x808080, groundColor: 0x606060 }), _jsx("directionalLight", { color: 0xFFFFFF, position: [0, -800, 0] }), _jsx("primitive", { ref: model, object: segmentationGroup, position: [-0.18, 1.13, -1], scale: [0.002 * segmentationSceneScale[0],
                                        0.002 * segmentationSceneScale[1],
                                        0.002 * segmentationSceneScale[2]] })] })) : null, renderingSettings.uniforms && renderingSettings.shader ? (_jsx("group", { children: _jsxs("mesh", { name: "cube", position: [-0.18, 1.13, -1], rotation: [0, 0, 0], scale: [0.002 * renderingSettings.meshScale[0],
                                    0.002 * renderingSettings.meshScale[1],
                                    0.002 * renderingSettings.meshScale[2]], ref: materialRef, children: [_jsx("boxGeometry", { args: renderingSettings.geometrySize }), _jsx("shaderMaterial", { customProgramCacheKey: () => '1', side: FrontSide, uniforms: renderingSettings.uniforms, needsUpdate: true, transparent: true, vertexShader: renderingSettings.shader.vertexShader, fragmentShader: renderingSettings.shader.fragmentShader })] }) })) : null] }), _jsx("group", { name: "currentLine", ref: distanceRef, children: showLine ? (_jsx(MeasureLine, { currentLine: currentLine, scale: (1 / 0.002) * 0.4 })) : null }), _jsx("group", { name: "lines", children: lines.map(object => _jsx(MeasureLine, { currentLine: object, scale: (1 / 0.002) * 0.4 })) })] })) : (_jsxs("group", { children: [_jsxs("group", { children: [segmentationGroup?.visible ? (_jsxs("group", { children: [_jsx("hemisphereLight", { skyColor: 0x808080, groundColor: 0x606060 }), _jsx("directionalLight", { color: 0xFFFFFF, position: [0, -800, 0] }), _jsx("directionalLight", { color: 0xFFFFFF, position: [0, 800, 0] }), _jsx(Bvh, { firstHitOnly: true, children: _jsx("primitive", { ref: model, object: segmentationGroup, position: [0, 0, 0], onClick: (e) => {
                                            if (e.object.parent.userData.name === 'finalPass') {
                                                highlightEntity(e.object.name, e.object.userData.layerScope, e.object.userData.channelScope);
                                            }
                                        }, onPointerOver: (e) => {
                                            setObsHighlight(e.object.name);
                                        }, onPointerOut: e => setObsHighlight(null) }) })] })) : null, (renderingSettings.uniforms && renderingSettings.shader) ? (_jsx("group", { children: _jsxs("mesh", { scale: renderingSettings.meshScale, ref: materialRef, children: [_jsx("boxGeometry", { args: renderingSettings.geometrySize }), _jsx("shaderMaterial", { customProgramCacheKey: () => '1', side: FrontSide, uniforms: renderingSettings.uniforms, needsUpdate: true, transparent: true, vertexShader: renderingSettings.shader.vertexShader, fragmentShader: renderingSettings.shader.fragmentShader })] }) })) : null] }), _jsx("group", { name: "lines", children: lines.map(object => _jsx(MeasureLine, { currentLine: object, scale: 1 })) })] })) }));
}
