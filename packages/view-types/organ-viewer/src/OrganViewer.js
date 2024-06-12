/* eslint-disable max-len */
/* eslint-disable no-bitwise */
/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unknown-property */
import React, {Suspense, useEffect, useState} from 'react';
import {Canvas} from '@react-three/fiber';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import {OrbitControls} from '@react-three/drei';
import {Box3, BoxGeometry, Group, Matrix4, Mesh, MeshBasicMaterial, Scene, Vector3} from "three";
import {createUnitBlock, getBlocksFromOrgan, getInfo, getObjSubPathToOntology, getOrganInformation} from "./utils.js";


function OrganScene(props) {
    const [model, setModel] = useState(undefined)
    const [initialLoad, setInitialLoad] = useState(true)
    const {uuidInput} = props
    useEffect(() => {
        async function fetchData() {
            let result = await getInfo([uuidInput])
            let organ = await getObjSubPathToOntology(result.hits.hits[0]._source.rui_location.split("target\": \"")[1].split("\"")[0].split("owl")[1]);
            let loader = new GLTFLoader();
            loader.load(organ.object.file, async function (gltf) {
                let root = gltf.scene;
                let organGroup = root.clone();
                while (root.children.length > 0) {
                    root.remove(root.children[0]);
                }
                let organMatrix = (await getOrganInformation(organ.representation_of, organ.sex)).matrix;
                organGroup.translateX(organMatrix[12])
                organGroup.translateY(organMatrix[13])
                organGroup.translateZ(organMatrix[14])

                organGroup.traverse(function (child) {
                    if (child.isMesh) {
                        // Update material properties if child has MeshStandardMaterial
                        if (Array.isArray(child.material)) {
                            for (let material of child.material) {
                                if (material.isMeshStandardMaterial) {
                                    material.roughness = 1;  // Making it less shiny by setting roughness to 1
                                    material.transparent = true;
                                    material.opacity = 0.5;
                                    material.needsUpdate = true;
                                }
                            }
                        } else {
                            if (child.material.isMeshStandardMaterial) {
                                child.material.roughness = 1;  // Making it less shiny by setting roughness to 1
                                child.material.transparent = true;
                                child.material.opacity = 0.5;
                                child.material.needsUpdate = true;
                            }
                        }
                    }
                });
                setModel(organGroup)


            });
        }

        if (initialLoad) {
            fetchData();
            setInitialLoad(false);
        }
    }, [model, initialLoad])
    return <group>
        {model !== undefined ? (
            <primitive object={model}/>) : null
        }
    </group>
}

function BlockScene(props) {
    const [model, setModel] = useState(undefined)
    const [initialLoad, setInitialLoad] = useState(true)
    const {uuidInput} = props
    useEffect(() => {
        async function fetchData() {
            let sceneGroup = new Group();
            let result = await getInfo([uuidInput])
            let organ = await getObjSubPathToOntology(result.hits.hits[0]._source.rui_location.split("target\": \"")[1].split("\"")[0].split("owl")[1]);
            let blocksInformation = await getBlocksFromOrgan(organ.representation_of, organ.sex);
            // Create a group for the tissue blocks
            let blocksGroup = new Group();
            blocksGroup.position.set(0, 0, 0); // Explicitly set to origin

            let blocksGroupChildren = new Group();
            blocksGroupChildren.position.set(0, 0, 0); // Explicitly set to origin
            blocksInformation.blocks.forEach(rawBlock => {
                let sortingByID = blocksInformation.hubmapEntities.get(rawBlock.id).donor.hubmap_id; // Sorting by donor
                // let sortingByID = blocksInformation.hubmapEntities.get(rawBlock.id).group_name; // Sorting by group
                const block = createUnitBlock(rawBlock, rawBlock.id === uuidInput ? "orange" : "blue");
                const transformationMatrix = new Matrix4().fromArray(blocksInformation.ccfEntities.get(rawBlock.id).transformationMatrix);
                block.applyMatrix4(transformationMatrix);
                blocksGroup.add(block); //TODO TESTING

                // // TESTING
                // const centerOfBlock = new Box3().setFromObject(block).getCenter(new Vector3());
                // const geometryTesting = new BoxGeometry(2 / 1000, 2 / 1000, 2 / 1000);
                // const blockTesting = new Mesh(geometryTesting, new MeshBasicMaterial({color: 0xFF00FFFF}));
                // blockTesting.position.set(centerOfBlock.x, centerOfBlock.y, centerOfBlock.z);
                // blockTesting.name = "blockChild;" + rawBlock.id;
                // blocksGroupChildren.add(blockTesting);
                //
                // block.visible = rawBlock.id === uuidInput;
                // blockTesting.visible = rawBlock.id !== uuidInput;
                // /// TESTING
            })

            // Add to main scene
            sceneGroup.add(blocksGroup);
            // sceneGroup.add(blocksGroupChildren);
            setModel(sceneGroup)
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


export default function OrganViewer(props) {
    const {uuidInput} = props;
    console.log(uuidInput)
    return (
        <div style={{
            width: '100%',
            height: '100%'
        }}>
            <Canvas camera={{zoom: 24}}>
                <OrbitControls/>
                <group>
                    <hemisphereLight skyColor={0x808080} groundColor={0x606060}/>
                    <directionalLight color={0xFFFFFF} position={[0, -800, 0]}/>
                    <OrganScene uuidInput={uuidInput}></OrganScene>
                    <BlockScene uuidInput={uuidInput}></BlockScene>
                </group>
            </Canvas>
        </div>
    );
}
