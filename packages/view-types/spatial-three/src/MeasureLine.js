import React from "react";
import {Center, Line, Text} from "@react-three/drei";

export const MeasureLine = (props) => {
    const {
        currentLine
    } = props;
    // console.log(currentLine)
    return (
        <group>
            <Center
                bottom
                right
                position={[currentLine.midPoint.x, currentLine.midPoint.y, currentLine.midPoint.z]}
                rotation={[0, 0, 0]}
            >
                <Text color="gray" scale={0.05}>
                    {`${length.toFixed(2)} e^-2`}
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
