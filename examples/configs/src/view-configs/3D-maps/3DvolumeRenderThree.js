import {
    VitessceConfig,
    CoordinationLevel as CL,
    hconcat, vconcat,
} from '@vitessce/config';


function generateBlinConfig() {
    const config = new VitessceConfig({
        schemaVersion: '1.0.16',
        name: 'Blin et al., PLoS Biol 2019',
    });
    const dataset = config.addDataset('My dataset').addFile({
        fileType: 'image.ome-tiff',
        url: "http://127.0.0.1:8080/kidney.ome.tiff",
        options: {
            offsetsUrl: "http://127.0.0.1:8080/kidney.offsets.json"
        },
        coordinationValues: {
            fileUid: 'kidney',
        },
    }).addFile({
        fileType: 'meshSegmentation.glb',
        url: 'http://127.0.0.1:8080/glom_surface_export_reduced_draco.glb',
        coordinationValues: {
            fileUid: 'gloms',
        }
    });

    const spatialThreeView = config.addView(dataset, 'spatialThree');
    const lcView = config.addView(dataset, 'layerControllerBeta');
    // const obsSetsView = config.addView(dataset, 'obsSets');
    const [selectionScope, colorScope] = config.addCoordination('obsSetSelection', 'obsSetColor');

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
                        spatialChannelColor: [255, 0, 0],
                        spatialChannelVisible: true,
                        spatialChannelOpacity: 1.0,
                        spatialChannelWindow: null,
                    },
                    {
                        spatialTargetC: 1,
                        spatialChannelColor: [0, 255, 0],
                        spatialChannelVisible: true,
                        spatialChannelOpacity: 1.0,
                        spatialChannelWindow: null,
                    },
                ]),
            },
        ]),
        segmentationLayer: CL([
            {
                fileUid: 'gloms',
                spatialLayerVisible: true,
                spatialLayerOpacity: 1,
                segmentationChannel: CL([
                    {
                        obsType: 'gloms',
                        spatialTargetC: 0,
                        spatialChannelColor: [255, 255, 255],
                        spatialChannelOpacity: 1.0,
                        featureType: 'gloms',
                        featureValueType: 'expression',
                        spatialChannelVisible: true,
                        obsColorEncoding: 'spatialChannelColor',
                        spatialSegmentationFilled: false,
                        spatialSegmentationStrokeWidth: 0.01,
                        obsHighlight: null,
                        obsSetSelection: selectionScope,
                        obsSetColor: colorScope,
                    }
                ])
            }
        ])
    });

    config.layout(hconcat(spatialThreeView, lcView));

    const configJSON = config.toJSON();
    return configJSON;
}

export const blinOop2019Three = generateBlinConfig();
