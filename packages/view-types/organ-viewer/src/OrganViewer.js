/* eslint-disable max-len */
/* eslint-disable no-bitwise */
/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unknown-property */
import React, {Suspense, useEffect, useState} from 'react';
import {Canvas} from '@react-three/fiber';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import {OrbitControls} from '@react-three/drei';
import {Box3, BoxGeometry, Group, Matrix4, Mesh, MeshBasicMaterial, Scene, Vector3} from "three";
import {
    createUnitBlock,
    getBlocksFromOrgan,
    getInfo,
    getObjSubPathToOntology,
    getOrganInformation,
    getOrganUberonToOntologyOrganFile
} from "./utils.js";


async function getOrgan(searchResult, uuid) {
    let organFile = ""
    let blockID = null
    if (searchResult.sample_category === "block") {
        console.log("Block Level")
        organFile = searchResult.rui_location.split("target\": \"")[1].split("\"")[0].split("owl")[1]
        blockID = uuid;
    } else if (searchResult.sample_category === "organ") {
        console.log("Organ Level")
        if (searchResult.immediate_descendants[0].rui_location !== undefined) {
            organFile = searchResult.immediate_descendants[0].rui_location.split("target\": \"")[1].split("\"")[0].split("owl")[1]
        } else {
            let newSearchResult = (await getInfo([searchResult.immediate_descendants[0].uuid])).hits.hits[0]._source
            // console.log(newSearchResult)
            organFile = newSearchResult.rui_location.split("target\": \"")[1].split("\"")[0].split("owl")[1]
        }
    } else if (searchResult.sample_category === "section") {
        console.log("Section Level")
        blockID = searchResult.immediate_ancestors[0].uuid
        let newSearchResult = (await getInfo([searchResult.immediate_ancestors[0].uuid])).hits.hits[0]._source
        organFile = newSearchResult.rui_location.split("target\": \"")[1].split("\"")[0].split("owl")[1]
    } else if (searchResult.sample_category === "suspension") {
        console.log("Suspension Level")
        if (searchResult.rui_location !== undefined) {
            organFile = searchResult.rui_location.split("target\": \"")[1].split("\"")[0].split("owl")[1]
        } else {
            if (searchResult.immediate_ancestors[0].sample_category == "organ") {
                let newSearchResult = (await getInfo([searchResult.immediate_ancestors[0].uuid])).hits.hits[0]._source
                // console.log(newSearchResult)
                organFile = newSearchResult.immediate_descendants[0].rui_location.split("target\": \"")[1].split("\"")[0].split("owl")[1]
            } else if (searchResult.immediate_ancestors[0].sample_category == "block") {
                blockID = searchResult.immediate_ancestors[0].uuid
                let newSearchResult = (await getInfo([searchResult.immediate_ancestors[0].uuid])).hits.hits[0]._source
                organFile = newSearchResult.rui_location.split("target\": \"")[1].split("\"")[0].split("owl")[1]
            }
        }
    }
    // console.log(organFile)
    let organ = await getObjSubPathToOntology(organFile);
    // console.log(organ)
    return [organ, blockID];
}

function OrganScene(props) {
    const [model, setModel] = useState(undefined)
    const [initialLoad, setInitialLoad] = useState(true)
    const {uuidInput, uberon} = props
    console.log(uuidInput, uberon)
    useEffect(() => {
        async function fetchData() {
            let organ = null;
            if (uberon !== undefined) {
                organ = await getOrganUberonToOntologyOrganFile(uberon)
            } else {
                console.log("Here")
                let result = await getInfo([uuidInput])
                let searchResult = result.hits.hits[0]._source
                let [organRes, blockID] = await getOrgan(searchResult, uuidInput)
                organ = organRes;
                console.log(organ)
            }
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
    const {uuidInput, uberon} = props
    useEffect(() => {
        async function fetchData() {
            let sceneGroup = new Group();
            let organ = null, blockID = null;
            if (uberon !== undefined) {
                organ = await getOrganUberonToOntologyOrganFile(uberon)
            } else {
                let result = await getInfo([uuidInput])
                let searchResult = result.hits.hits[0]._source
                let [organRetval, blockIDRetval] = await getOrgan(searchResult, uuidInput)
                organ = organRetval;
                blockID = blockIDRetval
            }
            let blocksInformation = await getBlocksFromOrgan(organ.representation_of, organ.sex, uuidInput);
            // Create a group for the tissue blocks
            let blocksGroup = new Group();
            blocksGroup.position.set(0, 0, 0); // Explicitly set to origin
            let blocksGroupChildren = new Group();
            blocksGroupChildren.position.set(0, 0, 0); // Explicitly set to origin
            blocksInformation.blocks.forEach(rawBlock => {
                const block = createUnitBlock(rawBlock, rawBlock.id === blockID ? "orange" : "blue");
                const transformationMatrix = new Matrix4().fromArray(blocksInformation.ccfEntities.get(rawBlock.id).transformationMatrix);
                block.applyMatrix4(transformationMatrix);
                blocksGroup.add(block);
            })
            sceneGroup.add(blocksGroup);
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
    const {uuidInput, uberon} = props;
    console.log(uuidInput)
    console.log(uberon)
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
                    <OrganScene uuidInput={uuidInput} uberon={uberon}></OrganScene>
                    <BlockScene uuidInput={uuidInput} uberon={uberon}></BlockScene>
                </group>
            </Canvas>
        </div>
    );
}
