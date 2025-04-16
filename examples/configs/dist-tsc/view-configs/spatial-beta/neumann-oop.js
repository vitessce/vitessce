import { VitessceConfig, CoordinationLevel as CL, hconcat, } from '@vitessce/config';
function generateImsConfig() {
    const config = new VitessceConfig({
        schemaVersion: '1.0.16',
        name: 'My config',
    });
    const dataset = config.addDataset('My dataset').addFile({
        fileType: 'image.ome-tiff',
        url: 'https://assets.hubmapconsortium.org/f4188a148e4c759092d19369d310883b/ometiff-pyramids/processedMicroscopy/VAN0006-LK-2-85-PAS_images/VAN0006-LK-2-85-PAS_registered.ome.tif?token=',
        coordinationValues: {
            fileUid: 'PAS',
        },
    }).addFile({
        fileType: 'image.ome-tiff',
        url: 'https://assets.hubmapconsortium.org/2130d5f91ce61d7157a42c0497b06de8/ometiff-pyramids/processedMicroscopy/VAN0006-LK-2-85-AF_preIMS_images/VAN0006-LK-2-85-AF_preIMS_registered.ome.tif?token=',
        coordinationValues: {
            fileUid: 'AF',
        },
    }).addFile({
        fileType: 'image.ome-tiff',
        url: 'https://assets.hubmapconsortium.org/be503a021ed910c0918842e318e6efa2/ometiff-pyramids/ometiffs/VAN0006-LK-2-85-IMS_PosMode_multilayer.ome.tif?token=',
        coordinationValues: {
            fileUid: 'IMS PosMode',
        },
    })
        .addFile({
        fileType: 'image.ome-tiff',
        url: 'https://assets.hubmapconsortium.org/ca886a630b2038997a4cfbbf4abfd283/ometiff-pyramids/ometiffs/VAN0006-LK-2-85-IMS_NegMode_multilayer.ome.tif?token=',
        coordinationValues: {
            fileUid: 'IMS NegMode',
        },
    });
    const imageScopes = config.addCoordinationByObject({
        imageLayer: CL([
            {
                fileUid: 'PAS',
                spatialLayerOpacity: 1,
                spatialLayerVisible: true,
                photometricInterpretation: 'RGB',
                imageChannel: CL([
                    {
                        spatialTargetC: 0,
                        spatialChannelColor: [255, 0, 0],
                        spatialChannelVisible: true,
                        spatialChannelOpacity: 1.0,
                        spatialChannelWindow: [0, 255],
                    },
                    {
                        spatialTargetC: 1,
                        spatialChannelColor: [0, 255, 0],
                        spatialChannelVisible: true,
                        spatialChannelOpacity: 1.0,
                        spatialChannelWindow: [0, 255],
                    },
                    {
                        spatialTargetC: 2,
                        spatialChannelColor: [0, 0, 255],
                        spatialChannelVisible: true,
                        spatialChannelOpacity: 1.0,
                        spatialChannelWindow: [0, 255],
                    },
                ]),
            },
            {
                fileUid: 'AF',
                spatialLayerOpacity: 1,
                spatialLayerVisible: true,
                spatialLayerTransparentColor: [0, 0, 0],
                photometricInterpretation: 'BlackIsZero',
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
                    {
                        spatialTargetC: 2,
                        spatialChannelColor: [0, 0, 255],
                        spatialChannelVisible: true,
                        spatialChannelOpacity: 1.0,
                        spatialChannelWindow: null,
                    },
                ]),
            },
            {
                fileUid: 'IMS PosMode',
                spatialLayerOpacity: 1,
                spatialLayerVisible: true,
                spatialLayerTransparentColor: [0, 0, 0],
                photometricInterpretation: 'BlackIsZero',
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
                    {
                        spatialTargetC: 2,
                        spatialChannelColor: [0, 0, 255],
                        spatialChannelVisible: true,
                        spatialChannelOpacity: 1.0,
                        spatialChannelWindow: null,
                    },
                ]),
            },
            {
                fileUid: 'IMS NegMode',
                spatialLayerOpacity: 1,
                spatialLayerVisible: true,
                spatialLayerTransparentColor: [0, 0, 0],
                photometricInterpretation: 'BlackIsZero',
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
                    {
                        spatialTargetC: 2,
                        spatialChannelColor: [0, 0, 255],
                        spatialChannelVisible: true,
                        spatialChannelOpacity: 1.0,
                        spatialChannelWindow: null,
                    },
                ]),
            },
        ]),
    });
    const metaCoordinationScope = config.addMetaCoordination();
    metaCoordinationScope.useCoordinationByObject(imageScopes);
    const spatialViewSimple = config.addView(dataset, 'spatialBeta');
    const lcViewSimple = config.addView(dataset, 'layerControllerBeta');
    spatialViewSimple.useMetaCoordination(metaCoordinationScope);
    lcViewSimple.useMetaCoordination(metaCoordinationScope);
    config.layout(hconcat(spatialViewSimple, lcViewSimple));
    const configJSON = config.toJSON();
    return configJSON;
}
export const neumanOop2023 = generateImsConfig();
