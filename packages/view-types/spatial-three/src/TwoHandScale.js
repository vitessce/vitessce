import {useRef, useMemo} from 'react';
import {Object3D, Matrix4, Vector3} from 'three';
import {useFrame} from '@react-three/fiber';
import {Interactive, InteractiveProps, XRController, XRInteractionHandler} from '@react-three/xr';

export function EnhancedRayGrab(
    {onSelectStart, onSelectEnd, children, ...rest}
) {
    const controller1Ref = useRef();
    const controller2Ref = useRef();

    const initialDistance = useRef(0);
    const previousTransform = useMemo(() => new Matrix4(), [])

    useFrame(() => {
        const controller1 = controller1Ref.current;
        const controller2 = controller2Ref.current;

        const obj = intersectedObj.current;
        if (!obj) return
        if (!controller1) return

        if (controller1 && !controller2) {
            // Handle translation and rotation for single controller
            obj.applyMatrix4(previousTransform);
            obj.applyMatrix4(controller1.matrixWorld);
            obj.updateMatrixWorld();
            previousTransform.copy(controller1.matrixWorld).invert();
        } else if (controller1 && controller2) {
            // Handle scaling for two controllers
            const currentDistance = controller1.position.distanceTo(controller2.position);
            if (initialDistance.current === 0) {
                initialDistance.current = currentDistance;
            }

            const scale = currentDistance / initialDistance.current;
            const initScale = initialScale.current
            obj.scale.set(initScale.x, initScale.y, initScale.z);
            obj.scale.multiplyScalar(scale);
        }
    });

    const intersectedObj = useRef();
    const initialScale = useRef();
    const handleSelectStart = (e) => {
        console.debug('handleSelectStart')

        const controller = e.target;
        // Determine if it's the first or second controller
        if (!controller1Ref.current) {
            controller1Ref.current = controller.controller;
            previousTransform.copy(controller.controller.matrixWorld).invert();
            intersectedObj.current = e.intersection?.object
            initialScale.current = intersectedObj.current?.scale.clone()
            onSelectStart?.(e);
        } else if (!controller2Ref.current && controller1Ref.current !== controller.controller) {
            controller2Ref.current = controller.controller;
            initialDistance.current = 0;
        }
    };

    const handleSelectEnd = (e) => {
        const controller = e.target;

        console.log("handleSelectEnd", controller.controller)
        if (controller1Ref.current === controller.controller) {
            controller1Ref.current = undefined
            intersectedObj.current = undefined
            initialScale.current = undefined
        } else if (controller2Ref.current === controller.controller) {
            controller2Ref.current = undefined
        }
        onSelectEnd?.(e);
    };

    return (
        <Interactive
            onSelectStart={handleSelectStart}
            onBlur={handleSelectEnd}
            onSelectEnd={handleSelectEnd}
            {...rest}
        >
            {children}
        </Interactive>
    );
}
