import {
    VitessceConfig,
    CoordinationLevel as CL,
    hconcat, vconcat,
} from '@vitessce/config';


function generateBloodVesselConfig() {
    const config = new VitessceConfig({
        schemaVersion: '1.0.16',
        name: 'Figure3d_tumor_cytoskeleton',
    });
    const dataset = config.addDataset('My dataset').addFile({
        fileType: 'image.ome-tiff',
        url: "https://vitessce-data-v2.s3.amazonaws.com/data/redBloodCell.ome.tiff",
        options: {
            offsetsUrl: "https://vitessce-data-v2.s3.amazonaws.com/data/redBloodCell.offsets.json",
        },
        coordinationValues: {
            fileUid: 'melanoma',
        },
    }).addFile({
        fileType: 'segmentation.glb',
        url: 'https://vitessce-data-v2.s3.amazonaws.com/data/bloodVesselNamed.glb',
        coordinationValues: {
            fileUid: 'skeleton',
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
                fileUid: 'melanoma',
                spatialLayerOpacity: 1,
                photometricInterpretation: 'BlackIsZero',
                spatialTargetResolution: null,
                imageChannel: CL([
                    {
                        spatialTargetC: 11,
                        spatialChannelColor: [255, 255, 0],
                        spatialChannelVisible: true,
                        spatialChannelOpacity: 1.0,
                        spatialChannelWindow: [5, 51],
                    },
                ]),
            },
        ]),
        segmentationLayer: CL([
            {
                fileUid: 'skeleton',
                spatialLayerVisible: true,
                spatialLayerOpacity: 1,
                spatialTargetX: 403,
                spatialTargetY: -582,
                spatialTargetZ: 33,
                spatialScaleX: 1.75,
                spatialScaleY: 1.75,
                spatialScaleZ: -1.75/3.0,
                // spatialRotationX: 1.57079632679,
                spatialRotationZ: 3.14159265359,
                spatialSceneScaleX: 1.0,
                spatialSceneScaleY: 1.0,
                spatialSceneScaleZ: 3.0,
                // spatialSceneRotationX: 1.57079632679,
                spatialMaterialBackside: true,
                segmentationChannel: CL([
                    {
                        //obsType: glomsObsTypeScope,
                        obsType: 'B-Cell',
                        spatialTargetC: 0,
                        featureType: glomsFeatureTypeScope,
                        featureValueType: glomsFeatureValueTypeScope,
                        featureSelection: glomsFeatureSelectionScope,
                        spatialChannelColor: [240, 252, 3],
                        spatialChannelOpacity: 1.0,
                        obsColorEncoding: colorEncodingScope,
                        spatialChannelVisible: true,
                        obsSetSelection: selectionScope,
                    },
                    {
                        obsType: 'Red Blood Cell',
                        spatialTargetC: 1,
                        featureType: glomsFeatureTypeScope,
                        featureValueType: glomsFeatureValueTypeScope,
                        featureSelection: glomsFeatureSelectionScope,
                        spatialChannelColor: [252, 15, 3],
                        obsColorEncoding: colorEncodingScope,
                        spatialChannelOpacity: 1.0,
                        spatialChannelVisible: true,
                        obsSetSelection: selectionScope,
                    },
                    {
                        obsType: 'CD11B+ Cell',
                        spatialTargetC: 2,
                        featureType: glomsFeatureTypeScope,
                        featureValueType: glomsFeatureValueTypeScope,
                        featureSelection: glomsFeatureSelectionScope,
                        spatialChannelColor: [252, 3, 252],
                        obsColorEncoding: colorEncodingScope,
                        spatialChannelOpacity: 1.0,
                        spatialChannelVisible: true,
                        obsSetSelection: selectionScope,
                    },
                    {
                        obsType: 'Vessel',
                        spatialTargetC: 3,
                        featureType: glomsFeatureTypeScope,
                        featureValueType: glomsFeatureValueTypeScope,
                        featureSelection: glomsFeatureSelectionScope,
                        spatialChannelColor: [3,252,82],
                        obsColorEncoding: colorEncodingScope,
                        spatialChannelOpacity: 1.0,
                        spatialChannelVisible: true,
                        obsSetSelection: selectionScope,
                    },
                    {
                        obsType: 'β-Catenin',
                        spatialTargetC: 4,
                        featureType: glomsFeatureTypeScope,
                        featureValueType: glomsFeatureValueTypeScope,
                        featureSelection: glomsFeatureSelectionScope,
                        spatialChannelColor: [3, 7, 252],
                        obsColorEncoding: colorEncodingScope,
                        spatialChannelOpacity: 1.0,
                        spatialChannelVisible: true,
                        obsSetSelection: selectionScope,
                    },
                    {
                        obsType: 'Vimentin',
                        spatialTargetC: 5,
                        featureType: glomsFeatureTypeScope,
                        featureValueType: glomsFeatureValueTypeScope,
                        featureSelection: glomsFeatureSelectionScope,
                        spatialChannelColor: [232, 232, 232],
                        obsColorEncoding: colorEncodingScope,
                        spatialChannelOpacity: 1.0,
                        spatialChannelVisible: true,
                        obsSetSelection: selectionScope,
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

export const bloodVesselNamed = generateBloodVesselConfig();
