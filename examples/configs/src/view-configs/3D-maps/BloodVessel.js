import {
    VitessceConfig,
    CoordinationLevel as CL,
    hconcat, vconcat,
} from '@vitessce/config';


function generateBloodVesselConfiguration() {
    const config = new VitessceConfig({
        schemaVersion: '1.0.16',
        name: 'Minimal Three',
    });
    const dataset = config.addDataset('My dataset').addFile({
        fileType: 'image.ome-tiff',
        //
        //
        //url: "http://127.0.0.1:8080/VAN0038-LK-4-preAF-MxIF-3d-registered.companion.ome",
        //url: "https://viv-demo.storage.googleapis.com/2018-12-18_ASY_H2B_bud_05_3D_8_angles.ome.tif",
        url: "https://vitessce-data-v2.s3.amazonaws.com/data/redBloodCell.ome.tiff",
        options: {
            offsetsUrl: "https://vitessce-data-v2.s3.amazonaws.com/data/redBloodCell.offsets.json",
        },
        coordinationValues: {
            fileUid: 'kidney',
        },
    });

    const spatialThreeView = config.addView(dataset, 'spatialThree');
    const lcView = config.addView(dataset, 'layerControllerBeta');
    config.linkViewsByObject([spatialThreeView, lcView], {
        spatialTargetZ: 0,
        spatialTargetT: 0,
        imageLayer: CL([
            {
                fileUid: 'kidney',
                spatialLayerOpacity: 1,
                spatialTargetResolution: null,
                imageChannel: CL([
                    {
                        spatialTargetC: 1,
                        spatialChannelColor: [0, 255, 0],
                        spatialChannelVisible: true,
                        spatialChannelOpacity: 1.0,
                        spatialChannelWindow: null,
                    },
                    {
                        spatialTargetC: 2,
                        spatialChannelColor: [255, 0, 255],
                        spatialChannelVisible: true,
                        spatialChannelOpacity: 1.0,
                        spatialChannelWindow: null,
                    },
                ]),
            },
        ])
    });

    config.layout(hconcat(spatialThreeView, lcView));

    const configJSON = config.toJSON();
    return configJSON;
}

export const bloodVessel = generateBloodVesselConfiguration();
