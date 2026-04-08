import React, { useRef } from 'react';
import { Center, Line, Text } from '@react-three/drei';
import type { MeasureLineData } from '../types.js';

interface MeasureLineProps {
  currentLine: MeasureLineData;
  scale: number;
}

export function MeasureLine({ currentLine, scale }: MeasureLineProps) {
  const textRef = useRef(null);
  // TODO: let the text always face the player/camera
  return (
    <group>
      <Center
        bottom
        right
        position={[currentLine.midPoint.x, currentLine.midPoint.y, currentLine.midPoint.z]}
        rotation={[0, 0, 0]}
      >
        <Text color="gray" scale={0.05} ref={textRef}>
          {`${(currentLine.startPoint.distanceTo(currentLine.endPoint) * scale).toFixed(2)} µm`}
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
}
