import {
    VitessceConfig,
    CoordinationLevel as CL,
    hconcat, vconcat,
} from '@vitessce/config';


function generateCellNeighborhoodConfig() {
    const config = new VitessceConfig({
        schemaVersion: '1.0.16',
        name: 'Peter Sorger Blood Vessel',
    });
    const dataset = config.addDataset('My dataset').addFile({
        fileType: 'image.ome-tiff',
        url: "https://vitessce-data-v2.s3.amazonaws.com/data/sorger/cell_community_new.ome.tiff",
        options: {
            offsetsUrl: "https://vitessce-data-v2.s3.amazonaws.com/data/sorger/cell_community_new.offsets.json",
        },
        coordinationValues: {
            fileUid: 'kidney',
        },
    }).addFile({
        fileType: 'segmentation.glb',
        // url: 'https://vitessce-data-v2.s3.amazonaws.com/data/sorger/SceneNew.glb',
        // url: 'http://127.0.0.1:8080/Scene%20(1).glb',
        url: 'http://127.0.0.1:8080/scene.glb',
        coordinationValues: {
            fileUid: 'Cells',
        }
    })

    const spatialThreeView = config.addView(dataset, 'spatialThree');
    // const spatialVolumeView = config.addView(dataset, 'spatialBeta').setProps({ title: 'MIP' });
    const lcView = config.addView(dataset, 'layerControllerBeta');

    const [
        selectionScope,
        colorScope,
        highlightScope,
        colorEncodingScope,
        glomsObsTypeScope,
        glomsFeatureTypeScope,
        glomsFeatureValueTypeScope,
        glomsFeatureSelectionScope,
    ] = config.addCoordination(
        'obsSetSelection',
        'obsSetColor',
        'obsHighlight',
        'obsColorEncoding',
        'obsType',
        'featureType',
        'featureValueType',
        'featureSelection',
    );

    colorEncodingScope.setValue('spatialChannelColor');

    glomsObsTypeScope.setValue('Cells');
    glomsFeatureTypeScope.setValue('feature');
    glomsFeatureValueTypeScope.setValue('value');
    glomsFeatureSelectionScope.setValue(['Volume']);

    //const [selectionScope, colorScope] = config.addCoordination('obsSetSelection', 'obsSetColor');

    //config.linkViewsByObject([spatialThreeView,spatialVolumeView, lcView], {
    config.linkViewsByObject([spatialThreeView, lcView], {
        spatialTargetZ: 0,
        spatialTargetT: 0,
        imageLayer: CL([
            {
                fileUid: 'kidney',
                spatialLayerOpacity: 1,
                photometricInterpretation: 'BlackIsZero',
                spatialTargetResolution: null,
                imageChannel: CL([
                    {
                        spatialTargetC: 7,
                        spatialChannelColor: [255, 255, 0],
                        spatialChannelVisible: true,
                        spatialChannelOpacity: 1.0,
                        spatialChannelWindow: [245, 2542],
                    },
                ]),
            },
        ]),
        segmentationLayer: CL([
            {
                fileUid: 'Cells',
                spatialLayerVisible: true,
                spatialLayerOpacity: 1,
                spatialTargetX: -1467,
                spatialTargetY: -22,
                spatialTargetZ: 90,
                spatialScaleX: 4.0,
                spatialScaleY: 2.75,
                spatialScaleZ: 4.0,
                // spatialRotationX: 1.57079632679,
                spatialRotationX: 1.57079632679,
                spatialSceneScaleX: 1.0,
                spatialSceneScaleY: -1.0,
                spatialSceneScaleZ: 1.0,
                // spatialSceneRotationX: 1.57079632679,
                spatialMaterialBackside: false,
                segmentationChannel: CL([
                    {
                        //obsType: glomsObsTypeScope,
                        obsType: 'MART1',
                        spatialTargetC: 0,
                        spatialChannelColor: [0, 217, 3],
                        spatialChannelOpacity: 1.0,
                        obsColorEncoding: colorEncodingScope,
                        spatialChannelVisible: true,
                    },
                    {
                        obsType: 'PD1',
                        spatialTargetC: 1,
                        spatialChannelColor: [220, 128, 0],
                        obsColorEncoding: colorEncodingScope,
                        spatialChannelOpacity: 1.0,
                        spatialChannelVisible: true,
                    },
                    {
                        obsType: 'FOXP3',
                        spatialTargetC: 2,
                        spatialChannelColor: [187, 0, 0],
                        obsColorEncoding: colorEncodingScope,
                        spatialChannelOpacity: 1.0,
                        spatialChannelVisible: true,
                    },
                    {
                        obsType: 'CD8',
                        spatialTargetC: 3,
                        spatialChannelColor: [226,0,226],
                        obsColorEncoding: colorEncodingScope,
                        spatialChannelOpacity: 1.0,
                        spatialChannelVisible: true,
                    },
                    {
                        obsType: 'CD11c',
                        spatialTargetC: 4,
                        spatialChannelColor: [180,193,0],
                        obsColorEncoding: colorEncodingScope,
                        spatialChannelOpacity: 1.0,
                        spatialChannelVisible: true,
                    },
                    {
                        obsType: 'CD103',
                        spatialTargetC: 5,
                        spatialChannelColor: [106,155,255],
                        obsColorEncoding: colorEncodingScope,
                        spatialChannelOpacity: 1.0,
                        spatialChannelVisible: true,
                    },
                    {
                        obsType: 'CD4',
                        spatialTargetC: 5,
                        spatialChannelColor: [0,144,144],
                        obsColorEncoding: colorEncodingScope,
                        spatialChannelOpacity: 1.0,
                        spatialChannelVisible: true,
                    }
                ])
            }
        ])
    });

    // config.layout(hconcat(vconcat(spatialThreeView,spatialVolumeView), vconcat(lcView,obsSetsView, barPlot)));
    config.layout(hconcat(spatialThreeView, vconcat(lcView)));

    const configJSON = config.toJSON();
    return configJSON;
}

export const cellNeighborhood = generateCellNeighborhoodConfig();
