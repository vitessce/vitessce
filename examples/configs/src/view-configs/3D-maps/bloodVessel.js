import {
    VitessceConfig,
    CoordinationLevel as CL,
    hconcat, vconcat,
} from '@vitessce/config';


function generateBloodVesselConfig() {
    const config = new VitessceConfig({
        schemaVersion: '1.0.16',
        name: 'Peter Sorger Blood Vessel',
    });
    const dataset = config.addDataset('My dataset').addFile({
        fileType: 'image.ome-tiff',
        url: "https://vitessce-data-v2.s3.amazonaws.com/data/redBloodCell.ome.tiff",
        options: {
            offsetsUrl: "https://vitessce-data-v2.s3.amazonaws.com/data/redBloodCell.offsets.json",
        },
        coordinationValues: {
            fileUid: 'kidney',
        },
    }).addFile({
        fileType: 'segmentation.glb',
        // url: 'https://vitessce-data-v2.s3.amazonaws.com/data/bloodVessel.glb',
        url: 'http://127.0.0.1:8081/bloodVEssel.glb',
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
                        spatialTargetC: 0,
                        spatialChannelColor: [0, 0, 255],
                        spatialChannelVisible: true,
                        spatialChannelOpacity: 1.0,
                        spatialChannelWindow: [1048, 5060],
                    },
                    // {
                    //     spatialTargetC: 1,
                    //     spatialChannelColor: [0, 255, 0],
                    //     spatialChannelVisible: true,
                    //     spatialChannelOpacity: 1.0,
                    //     spatialChannelWindow: [325,721],
                    // },
                    // {
                    //     spatialTargetC: 2,
                    //     spatialChannelColor: [255, 0, 255],
                    //     spatialChannelVisible: true,
                    //     spatialChannelOpacity: 1.0,
                    //     spatialChannelWindow: [463,680],
                    // },
                    // {
                    //     spatialTargetC: 9,
                    //     spatialChannelColor: [255, 0, 0],
                    //     spatialChannelVisible: true,
                    //     spatialChannelOpacity: 1.0,
                    //     spatialChannelWindow: [643,810],
                    // },
                    // {
                    //     spatialTargetC: 4,
                    //     spatialChannelColor: [255, 255, 255],
                    //     spatialChannelVisible: true,
                    //     spatialChannelOpacity: 1.0,
                    //     spatialChannelWindow: [419,2175],
                    // },
                ]),
            },
        ]),
        segmentationLayer: CL([
            {
                fileUid: 'Cells',
                spatialLayerVisible: true,
                spatialLayerOpacity: 1,
                segmentationChannel: CL([
                    {
                        obsType: glomsObsTypeScope,
                        featureType: glomsFeatureTypeScope,
                        featureValueType: glomsFeatureValueTypeScope,
                        featureSelection: glomsFeatureSelectionScope,
                        spatialTargetC: 0,
                        spatialChannelColor: [202, 122, 166],
                        spatialChannelOpacity: 0.5,
                        spatialChannelVisible: true,
                        obsColorEncoding: colorEncodingScope,
                        spatialSegmentationFilled: false,
                        spatialSegmentationStrokeWidth: 0.01,
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

export const bloodVessel = generateBloodVesselConfig();
