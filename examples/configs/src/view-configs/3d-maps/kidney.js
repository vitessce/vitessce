import {
    VitessceConfig,
    CoordinationLevel as CL,
    hconcat, vconcat,
} from '@vitessce/config';

function generateJainKidney() {
    const config = new VitessceConfig({
        schemaVersion: '1.0.16',
        name: 'Jain Kidney Decimated 2024',
    });
    const dataset = config.addDataset('My dataset').addFile({
        fileType: 'image.ome-tiff',
        url: 'https://vitessce-data-v2.s3.amazonaws.com/data/washu-kidney/LS_20x_5_Stitched.pyramid.ome.tiff',
        options: {
            offsetsUrl: 'https://vitessce-data-v2.s3.amazonaws.com/data/washu-kidney/LS_20x_5_Stitched.pyramid.offsets.json',
        },
        coordinationValues: {
            fileUid: 'kidney',
        },
    });

    const spatialThreeView = config.addView(dataset, 'spatialBeta').setProps({three: true});
    const lcView = config.addView(dataset, 'layerControllerBeta');
    // const organViewer = config.addView(dataset, 'organViewer').setProps({uuidInput: "7d481376b442a45584e2a39da5aaa15d"}); // Block

    const organViewer = config.addView(dataset, 'organViewer').setProps({uuidInput: "d9e64e77d26d9fb8133d7754d1c3f6d0"}); // Block
    // const organViewer = config.addView(dataset, 'organViewer').setProps({uuidInput: "1f4a0534ad5757369603e879ddb0391c"}); // Section
    // const organViewer = config.addView(dataset, 'organViewer').setProps({uuidInput: "b1d41395cc87b8eff3f580cfa168283b"}); //Organ
    // const organViewer = config.addView(dataset, 'organViewer').setProps({uuidInput: "4fb887c5b17d203e20143d9044c0bf94"}); //Suspension
    const blockViewer = config.addView(dataset, 'blockViewer').setProps({uuidInput: "d9e64e77d26d9fb8133d7754d1c3f6d0"});

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
                        spatialChannelColor: [221, 52, 151],
                        spatialChannelVisible: true,
                        spatialChannelOpacity: 1.0,
                        spatialChannelWindow: [773, 7733],
                    },
                    {
                        spatialTargetC: 1,
                        spatialChannelColor: [29, 145, 192],
                        spatialChannelVisible: true,
                        spatialChannelOpacity: 1.0,
                        spatialChannelWindow: [2290, 6724],
                    },
                ]),
            },
        ]),
    });

    config.layout(hconcat(spatialThreeView, vconcat(lcView, hconcat(organViewer, blockViewer))));

    const configJSON = config.toJSON();
    return configJSON;
}

export const jainKidney = generateJainKidney();
