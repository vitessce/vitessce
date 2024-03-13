import React from "react";
import {Center, Line, Text} from "@react-three/drei";
import {useThree} from "@react-three/fiber";

export const MeasureLine = (props) => {
    const glThree = useThree();
    const {
        currentLine,
        scale
    } = props;
    return (
        <group>
            <Center
                bottom
                right
                position={[currentLine.midPoint.x, currentLine.midPoint.y, currentLine.midPoint.z]}
                rotation={[0, 0, 0]}
            >
                <Text color="gray" scale={0.05}>
                    {`${(currentLine.startPoint.distanceTo(currentLine.endPoint)*scale).toFixed(2)} µm`}
                </Text>
            </Center>
            <Line
                points={[currentLine.startPoint, currentLine.endPoint]}
                color="white" // Default
                lineWidth={2} // In pixels (default)
                dashed={false} // Default
                segments
            />
        </group>
    );
};
