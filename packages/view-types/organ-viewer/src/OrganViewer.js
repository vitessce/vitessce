/* eslint-disable max-len */
/* eslint-disable no-bitwise */
/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unknown-property */
import React, { useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { XRButton, XR, RayGrab } from '@react-three/xr';
import { makeStyles } from '@material-ui/core';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from '@react-three/drei';


const useStyles = makeStyles(theme => ({
  description: {
    '& p, details, table': {
      fontSize: '80%',
      opacity: '0.8',
    },
    '& details': {
      marginBottom: '6px',
    },
    '& summary': {
      // TODO(monorepo): lighten color by 10%
      borderBottom: `1px solid ${theme.palette.primaryBackground}`,
      cursor: 'pointer',
    },
  },
}));

function Scene() {
  const gltf = useLoader(GLTFLoader, 'https://ccf-ontology.hubmapconsortium.org/objects/v1.2/VH_M_Kidney_L.glb');
  return <primitive object={gltf.scene}/>;
}

export default function OrganViewer(props) {
  const { description } = props;
  const model = useRef();
  const classes = useStyles();
  let canvasRef;
  return (
    <div style={{
      width: '100%',
      height: '100%'
    }}>
      <Canvas camera={{
        fov: 50,
        position: [0.3, 0.8, 0.1]
      }}>
        <OrbitControls/>
        <group>
          <hemisphereLight skyColor={0x808080} groundColor={0x606060}/>
          <directionalLight color={0xFFFFFF} position={[0, -800, 0]}/>
          <Scene></Scene>
        </group>
        {/* </XR> */}
      </Canvas>
    </div>
  );
}
