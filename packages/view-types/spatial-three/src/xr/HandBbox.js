import { useXR } from "@react-three/xr";
import { useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Box3 } from "three";

export const HandBbox = () => {
	const { controllers } = useXR();
	const { scene } = useThree();
	const rightTipRef = useRef();
	const leftTipRef = useRef();
	let leftTipBB = useState();
	let rightTipBB = useState();

	useFrame(() => {
		if (controllers && controllers[0] && controllers[1]) {
			if (controllers[0].controller) {
				const rightTipPosition =
					controllers[0].hand.joints["index-finger-tip"].position;
				rightTipRef.current.position.copy(rightTipPosition);
			}
			if (controllers[1].controller) {
				const leftTipPosition =
					controllers[1].hand.joints["index-finger-tip"].position;
				leftTipRef.current.position.copy(leftTipPosition);
			}
			// let rightTipBbox = scene.getObjectByName("rightTipBbox");
			// let leftTipBbox = scene.getObjectByName("leftTipBbox");
			// leftTipBB = new Box3().setFromObject(leftTipBbox);
			// rightTipBB = new Box3().setFromObject(rightTipBbox);
		}
	});

	return (
		<>
			<mesh name="leftTipBbox" ref={leftTipRef}>
				<boxGeometry args={[0.02, 0.02, 0.02]} />
				<meshStandardMaterial color={"blue"} transparent={true} opacity={0} />
			</mesh>
			<mesh name="rightTipBbox" ref={rightTipRef}>
				<boxGeometry args={[0.02, 0.02, 0.02]} />
				<meshStandardMaterial color={"orange"} transparent={true} opacity={0} />
			</mesh>
		</>
	);
};
