/* eslint-disable max-len */
/* eslint-disable no-bitwise */
/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unknown-property */
import React, {useEffect, useRef, useState} from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import {
  Box3,
  BoxGeometry,
  EdgesGeometry,
  Group,
  LineBasicMaterial, LineSegments,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  Vector3
} from "three";
import {createUnitBlock, getBlocksFromOrgan, getInfo, getObjSubPathToOntology} from "./utils.js";

function BlockScene(props) {
  const [model, setModel] = useState(undefined)
  const [initialLoad, setInitialLoad] = useState(true)
  const {uuidInput} = props
  useEffect(() => {
    async function fetchData() {
      let blockGroup = new Group()
      let result = await getInfo([uuidInput])
      let x = result.hits.hits[0]._source.rui_location.split("\"x_dimension\": ")[1].split(",")[0]
      let y = result.hits.hits[0]._source.rui_location.split("\"y_dimension\": ")[1].split(",")[0]
      let z = result.hits.hits[0]._source.rui_location.split("\"z_dimension\": ")[1].split(",")[0]
      const geometry = new BoxGeometry(parseInt(x), parseInt(y), parseInt(z));
      const block = new Mesh(geometry, new MeshBasicMaterial({color: "orange", transparent:true,opacity:0.5}));
      block.position.set(0, 0, 0);
      var geo = new EdgesGeometry( block.geometry );
      var mat = new LineBasicMaterial( { color: "darkorange" } );
      var wireframe = new LineSegments( geo, mat );
      block.add( wireframe );

      blockGroup.add(block)

      let planeGeometry = new BoxGeometry(parseInt(x)*0.9, parseInt(y)*0.9, parseInt(z)/10.0);
      let plane = new Mesh(planeGeometry, new MeshBasicMaterial({color: "blue"}));
      plane.position.set(0, 0, 0);
      blockGroup.add(plane)

      planeGeometry = new BoxGeometry(parseInt(x)*0.9, parseInt(y)*0.9, parseInt(z)/10.0);
      plane = new Mesh(planeGeometry, new MeshBasicMaterial({color: "green"}));
      plane.position.set(0, 0, parseInt(z)/10.0*2.0);
      blockGroup.add(plane)

      planeGeometry = new BoxGeometry(parseInt(x)*0.9, parseInt(y)*0.9, parseInt(z)/10.0);
      plane = new Mesh(planeGeometry, new MeshBasicMaterial({color: "red"}));
      plane.position.set(0, 0, -parseInt(z)/10.0*2.0);
      blockGroup.add(plane)


      blockGroup.rotateX(Math.PI * 0.25)
      blockGroup.rotateZ(Math.PI * 0.25)
      setModel(blockGroup)
    }

    if (initialLoad) {
      fetchData();
      setInitialLoad(false)
    }
  }, [initialLoad, model])
  return <group>
    {model !== undefined ? (
        <primitive object={model}/>) : null
    }
  </group>
}

export default function BlockViewer(props) {
  const { uuidInput } = props;
  return (
    <div style={{
      width: '100%',
      height: '100%'
    }}>
      <Canvas camera={{position:[0,0,-50.0]}}>
        <OrbitControls/>
        <group>
          <BlockScene uuidInput={uuidInput}></BlockScene>
        </group>
      </Canvas>
    </div>
  );
}
