import { useFrame } from '@react-three/fiber';
import { useXR } from '@react-three/xr';
// TODO: can this just be a hook (since it does not return any JSX)?
export function HandDecorate() {
    const { controllers } = useXR();
    useFrame(() => {
        if (controllers?.[0] && controllers?.[1]) {
            if (controllers[0]?.hand?.children?.[25]?.children?.[0]?.children?.[0]) {
                controllers[0].hand.children[25].children[0].children[0].material.transparent = true;
                controllers[0].hand.children[25].children[0].children[0].material.opacity = 0.5;
            }
            if (controllers[1]?.hand?.children?.[25]?.children?.[0]?.children?.[0]) {
                controllers[1].hand.children[25].children[0].children[0].material.transparent = true;
                controllers[1].hand.children[25].children[0].children[0].material.opacity = 0.5;
            }
        }
    });
    return null;
}
