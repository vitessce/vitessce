import {
    VitessceConfig,
    CoordinationLevel as CL,
    hconcat, vconcat,
} from '@vitessce/config';


function generateBloodVesselNeighborhood() {
    const config = new VitessceConfig({
        schemaVersion: '1.0.16',
        name: 'Blood Vessel Neighborhood',
    });
    const dataset = config.addDataset('My dataset').addFile({
        fileType: 'image.ome-tiff',
        url: 'https://vitessce-data-v2.s3.amazonaws.com/data/sorger/bloodVessel_bigger.ome.tiff',
        options: {
            offsetsUrl: "https://vitessce-data-v2.s3.amazonaws.com/data/sorger/bloodVessel_bigger.offsets.json",
        },
        coordinationValues: {
            fileUid: 'melanoma',
        },
    })

    const spatialThreeView = config.addView(dataset, 'spatialThree');
    const lcView = config.addView(dataset, 'layerControllerBeta');
    config.linkViewsByObject([spatialThreeView, lcView], {
        spatialTargetZ: 0,
        spatialTargetT: 0,
        spatialRenderingMode:'3D',
        imageLayer: CL([
            {
                fileUid: 'melanoma',
                spatialLayerOpacity: 1,
                spatialTargetResolution: null,
                imageChannel: CL([
                    {
                        spatialTargetC: 0,
                        spatialChannelColor: [0, 0, 255],
                        spatialChannelVisible: true,
                        spatialChannelOpacity: 1.0,
                        spatialChannelWindow: [3389,33551],
                    },
                    {
                        spatialTargetC: 3,
                        spatialChannelColor: [255, 0, 0],
                        spatialChannelVisible: true,
                        spatialChannelOpacity: 1.0,
                        spatialChannelWindow: [1245,26447],
                    },
                    {
                        spatialTargetC: 13,
                        spatialChannelColor: [255, 255, 0],
                        spatialChannelVisible: true,
                        spatialChannelOpacity: 1.0,
                        spatialChannelWindow: [2,53],
                    },
                    {
                        spatialTargetC: 4,
                        spatialChannelColor: [0, 255, 255],
                        spatialChannelVisible: true,
                        spatialChannelOpacity: 1.0,
                        spatialChannelWindow: [525,5863],
                    },
                    {
                        spatialTargetC: 8,
                        spatialChannelColor: [255, 0, 255],
                        spatialChannelVisible: true,
                        spatialChannelOpacity: 1.0,
                        spatialChannelWindow: [134,24050],
                    },
                    {
                        spatialTargetC: 5,
                        spatialChannelColor: [0, 255, 0],
                        spatialChannelVisible: true,
                        spatialChannelOpacity: 1.0,
                        spatialChannelWindow: [457,20591],
                    }
                ]),
            },
        ])
    });

    config.layout(hconcat(spatialThreeView, lcView));

    const configJSON = config.toJSON();
    return configJSON;
}

export const bloodVesselNeighborhood = generateBloodVesselNeighborhood();
