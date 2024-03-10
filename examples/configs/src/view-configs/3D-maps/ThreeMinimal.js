import {
    VitessceConfig,
    CoordinationLevel as CL,
    hconcat, vconcat,
} from '@vitessce/config';


function generateThreeMinimalConfiguration() {
    const config = new VitessceConfig({
        schemaVersion: '1.0.16',
        name: 'Minimal Three',
    });
    const dataset = config.addDataset('My dataset').addFile({
        fileType: 'image.ome-tiff',
        // url: "https://assets.hubmapconsortium.org/30bc1823e0c19be58557fb979499bac2/ometiff-pyramids/data/3D_image_stack.ome.tif?token=",
        // url: "https://vitessce-data-v2.s3.amazonaws.com/data/kiemenetal/5xHE.ome.tiff",
        // url: "http://127.0.0.1:8080/cell_community.ome.tif",
       // url: "https://vitessce-data-v2.s3.amazonaws.com/data/redBloodCell.ome.tiff",
        url: "https://vitessce-data-v2.s3.amazonaws.com/data/sorger/f8ii.ome.tiff",
        // options: {
        //        offsetsUrl: "https://vitessce-data-v2.s3.amazonaws.com/data/kiemenetal/5xHE.offsets.json",
        // },
        coordinationValues: {
            fileUid: 'kidney',
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
                fileUid: 'kidney',
                spatialLayerOpacity: 1,
                spatialTargetResolution: null,
                imageChannel: CL([
                    {
                        spatialTargetC: 0,
                        spatialChannelColor: [0, 255, 0],
                        spatialChannelVisible: true,
                        spatialChannelOpacity: 1.0,
                        spatialChannelWindow: null,
                    }
                ]),
            },
        ])
    });

    config.layout(hconcat(spatialThreeView, lcView));

    const configJSON = config.toJSON();
    return configJSON;
}

export const threeMinimal = generateThreeMinimalConfiguration();
