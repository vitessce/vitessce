import {
    VitessceConfig,
    CoordinationLevel as CL,
    hconcat, vconcat,
} from '@vitessce/config';

function generateJainKidneyDecimatedConfig() {
    const config = new VitessceConfig({
        schemaVersion: '1.0.16',
        name: 'Jain Kidney Decimated 2024',
    });
    const dataset = config.addDataset('My dataset').addFile({
        fileType: 'image.ome-tiff',
        url: 'https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/LS_20x_5_Stitched.pyramid.ome.tiff?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEHAaCXVzLWVhc3QtMSJHMEUCIDWS4KLuwMknKdrwY%2FF6EzSGipsM4qvn131iTxISWC9%2FAiEA2YoN8QmuiQzQK2VruSpT5a%2FzMQHb9uyhQkFuXY1qlAEq7AMIeRABGgwxMzY1NzY1MjIwNDgiDC9Zd3NTxDZF%2BZS6oSrJAy8AXFOzee5KbemlcnFNTGqylghaSlDjIaCx345q2Ilr3H5MrBuX1%2B94a6rUfCIWWMic%2BuJZufKhjftKnXbJ0aDATKVAUEPpZpJHur2A5b%2FAuqajDSthvt5qlQQR71d7RX3SgH7kmKwfr0Sz3Wk0AxayVSd9%2FZYAXuRmkey82oUCVfyWUQUeHwgP4z5QhBibbfuAV5Jj7YsDKBHPABtIQ5BO6d7%2F2SqNcwLCtJT5Eq62FcGKmH1UvdjhiIXz3cTyLlF7T35z8eFMQgERNU9umfkKHBtp%2BGfhnELibCFEdoRoI8fEDWnO%2F5VQZsVA%2BCVVExOSZRmmc7T32UpPcvbZuqEkhqAQ1F2PFgLHwnR26It%2FwRxTyabP7D5bB2CfD06BWWiI9w5%2Fjt%2BWk75h72irfyKG2%2FiXW3HPyt%2FbYcMBQBgzduAAEXEm%2BStx%2B1ijbhVe79K5EcHBV4J1ubyYjfY3Ztl%2FgmGwcOkiiH62xtIcyLPkDPV42%2BFoE24m3z6LKGXm9kArnwC8fAxe18D2olQQ5kr%2Fye20IdItGyX34GIwg923D%2Fa5X9aYBTLlREjMSiHGvlkUGBlES3nzBSTpqPwxncSX7MsFOAdCQPsw4rPMrwY6lAI9u6fmBwCN6Zq%2Bsl4Lv4eNO4GoWB%2BPugivI5iiXllvm4o85ze2Sd7d0qpEo9Cf5QigZuPUXScEDFaUMfSL33EaHjvrNEJOJzJyvyfDqiGKxJLZhUrr6AmsPLMaYH6zvtLi8r%2F%2B6a1MOqQmVd89Pon1Dhz7AGZMspNYvDdOZjJZ0f%2Fb%2Bb0uxT5d4VL3KHxhW6JFISS8S8kot%2BJpxzM2LgVtiEDsUQgi6ziW1BfoNIsSTnvCoWAUPGI1ySzd98l8up7DtceGp6eZ93iC0utJzkeadlo89zmwjsxMVkw4J6N5%2BXitJUeTAnIe9djiAh%2FKK6ZyDjAduQXvj2wQx3oT1iB5cOHKzMW2wSn2AN0AskvsTr%2BtkYo%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240314T153913Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5ADFH2H25X%2F20240314%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=f9da113381a5ba9f34167c48c260b30e1fcdb3a6f05bfca04600b355da59d59c',
        options: {
            offsetsUrl: 'https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/LS_20x_5_Stitched.pyramid.offsets.json?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEHAaCXVzLWVhc3QtMSJHMEUCIDWS4KLuwMknKdrwY%2FF6EzSGipsM4qvn131iTxISWC9%2FAiEA2YoN8QmuiQzQK2VruSpT5a%2FzMQHb9uyhQkFuXY1qlAEq7AMIeRABGgwxMzY1NzY1MjIwNDgiDC9Zd3NTxDZF%2BZS6oSrJAy8AXFOzee5KbemlcnFNTGqylghaSlDjIaCx345q2Ilr3H5MrBuX1%2B94a6rUfCIWWMic%2BuJZufKhjftKnXbJ0aDATKVAUEPpZpJHur2A5b%2FAuqajDSthvt5qlQQR71d7RX3SgH7kmKwfr0Sz3Wk0AxayVSd9%2FZYAXuRmkey82oUCVfyWUQUeHwgP4z5QhBibbfuAV5Jj7YsDKBHPABtIQ5BO6d7%2F2SqNcwLCtJT5Eq62FcGKmH1UvdjhiIXz3cTyLlF7T35z8eFMQgERNU9umfkKHBtp%2BGfhnELibCFEdoRoI8fEDWnO%2F5VQZsVA%2BCVVExOSZRmmc7T32UpPcvbZuqEkhqAQ1F2PFgLHwnR26It%2FwRxTyabP7D5bB2CfD06BWWiI9w5%2Fjt%2BWk75h72irfyKG2%2FiXW3HPyt%2FbYcMBQBgzduAAEXEm%2BStx%2B1ijbhVe79K5EcHBV4J1ubyYjfY3Ztl%2FgmGwcOkiiH62xtIcyLPkDPV42%2BFoE24m3z6LKGXm9kArnwC8fAxe18D2olQQ5kr%2Fye20IdItGyX34GIwg923D%2Fa5X9aYBTLlREjMSiHGvlkUGBlES3nzBSTpqPwxncSX7MsFOAdCQPsw4rPMrwY6lAI9u6fmBwCN6Zq%2Bsl4Lv4eNO4GoWB%2BPugivI5iiXllvm4o85ze2Sd7d0qpEo9Cf5QigZuPUXScEDFaUMfSL33EaHjvrNEJOJzJyvyfDqiGKxJLZhUrr6AmsPLMaYH6zvtLi8r%2F%2B6a1MOqQmVd89Pon1Dhz7AGZMspNYvDdOZjJZ0f%2Fb%2Bb0uxT5d4VL3KHxhW6JFISS8S8kot%2BJpxzM2LgVtiEDsUQgi6ziW1BfoNIsSTnvCoWAUPGI1ySzd98l8up7DtceGp6eZ93iC0utJzkeadlo89zmwjsxMVkw4J6N5%2BXitJUeTAnIe9djiAh%2FKK6ZyDjAduQXvj2wQx3oT1iB5cOHKzMW2wSn2AN0AskvsTr%2BtkYo%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240314T153859Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5ADFH2H25X%2F20240314%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=7eb4d09a5b90eca7725a008eb0401de6f0c8fa2f2b1250e13c568ed36707f5db',
        },
        coordinationValues: {
            fileUid: 'kidney',
        },
    }).addFile({
        fileType: 'segmentation.glb',
        url: 'https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/decimated.glb?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEHAaCXVzLWVhc3QtMSJHMEUCIDWS4KLuwMknKdrwY%2FF6EzSGipsM4qvn131iTxISWC9%2FAiEA2YoN8QmuiQzQK2VruSpT5a%2FzMQHb9uyhQkFuXY1qlAEq7AMIeRABGgwxMzY1NzY1MjIwNDgiDC9Zd3NTxDZF%2BZS6oSrJAy8AXFOzee5KbemlcnFNTGqylghaSlDjIaCx345q2Ilr3H5MrBuX1%2B94a6rUfCIWWMic%2BuJZufKhjftKnXbJ0aDATKVAUEPpZpJHur2A5b%2FAuqajDSthvt5qlQQR71d7RX3SgH7kmKwfr0Sz3Wk0AxayVSd9%2FZYAXuRmkey82oUCVfyWUQUeHwgP4z5QhBibbfuAV5Jj7YsDKBHPABtIQ5BO6d7%2F2SqNcwLCtJT5Eq62FcGKmH1UvdjhiIXz3cTyLlF7T35z8eFMQgERNU9umfkKHBtp%2BGfhnELibCFEdoRoI8fEDWnO%2F5VQZsVA%2BCVVExOSZRmmc7T32UpPcvbZuqEkhqAQ1F2PFgLHwnR26It%2FwRxTyabP7D5bB2CfD06BWWiI9w5%2Fjt%2BWk75h72irfyKG2%2FiXW3HPyt%2FbYcMBQBgzduAAEXEm%2BStx%2B1ijbhVe79K5EcHBV4J1ubyYjfY3Ztl%2FgmGwcOkiiH62xtIcyLPkDPV42%2BFoE24m3z6LKGXm9kArnwC8fAxe18D2olQQ5kr%2Fye20IdItGyX34GIwg923D%2Fa5X9aYBTLlREjMSiHGvlkUGBlES3nzBSTpqPwxncSX7MsFOAdCQPsw4rPMrwY6lAI9u6fmBwCN6Zq%2Bsl4Lv4eNO4GoWB%2BPugivI5iiXllvm4o85ze2Sd7d0qpEo9Cf5QigZuPUXScEDFaUMfSL33EaHjvrNEJOJzJyvyfDqiGKxJLZhUrr6AmsPLMaYH6zvtLi8r%2F%2B6a1MOqQmVd89Pon1Dhz7AGZMspNYvDdOZjJZ0f%2Fb%2Bb0uxT5d4VL3KHxhW6JFISS8S8kot%2BJpxzM2LgVtiEDsUQgi6ziW1BfoNIsSTnvCoWAUPGI1ySzd98l8up7DtceGp6eZ93iC0utJzkeadlo89zmwjsxMVkw4J6N5%2BXitJUeTAnIe9djiAh%2FKK6ZyDjAduQXvj2wQx3oT1iB5cOHKzMW2wSn2AN0AskvsTr%2BtkYo%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240314T153842Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5ADFH2H25X%2F20240314%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=6350246c8985c9ff7a4b874987d396af3d68798bdbdc7d43ab3931a51e542efa',
        coordinationValues: {
            fileUid: 'gloms',
        }
    }).addFile({
        fileType: 'obsFeatureMatrix.csv',
        url: 'https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/statistics.csv?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEHAaCXVzLWVhc3QtMSJHMEUCIDWS4KLuwMknKdrwY%2FF6EzSGipsM4qvn131iTxISWC9%2FAiEA2YoN8QmuiQzQK2VruSpT5a%2FzMQHb9uyhQkFuXY1qlAEq7AMIeRABGgwxMzY1NzY1MjIwNDgiDC9Zd3NTxDZF%2BZS6oSrJAy8AXFOzee5KbemlcnFNTGqylghaSlDjIaCx345q2Ilr3H5MrBuX1%2B94a6rUfCIWWMic%2BuJZufKhjftKnXbJ0aDATKVAUEPpZpJHur2A5b%2FAuqajDSthvt5qlQQR71d7RX3SgH7kmKwfr0Sz3Wk0AxayVSd9%2FZYAXuRmkey82oUCVfyWUQUeHwgP4z5QhBibbfuAV5Jj7YsDKBHPABtIQ5BO6d7%2F2SqNcwLCtJT5Eq62FcGKmH1UvdjhiIXz3cTyLlF7T35z8eFMQgERNU9umfkKHBtp%2BGfhnELibCFEdoRoI8fEDWnO%2F5VQZsVA%2BCVVExOSZRmmc7T32UpPcvbZuqEkhqAQ1F2PFgLHwnR26It%2FwRxTyabP7D5bB2CfD06BWWiI9w5%2Fjt%2BWk75h72irfyKG2%2FiXW3HPyt%2FbYcMBQBgzduAAEXEm%2BStx%2B1ijbhVe79K5EcHBV4J1ubyYjfY3Ztl%2FgmGwcOkiiH62xtIcyLPkDPV42%2BFoE24m3z6LKGXm9kArnwC8fAxe18D2olQQ5kr%2Fye20IdItGyX34GIwg923D%2Fa5X9aYBTLlREjMSiHGvlkUGBlES3nzBSTpqPwxncSX7MsFOAdCQPsw4rPMrwY6lAI9u6fmBwCN6Zq%2Bsl4Lv4eNO4GoWB%2BPugivI5iiXllvm4o85ze2Sd7d0qpEo9Cf5QigZuPUXScEDFaUMfSL33EaHjvrNEJOJzJyvyfDqiGKxJLZhUrr6AmsPLMaYH6zvtLi8r%2F%2B6a1MOqQmVd89Pon1Dhz7AGZMspNYvDdOZjJZ0f%2Fb%2Bb0uxT5d4VL3KHxhW6JFISS8S8kot%2BJpxzM2LgVtiEDsUQgi6ziW1BfoNIsSTnvCoWAUPGI1ySzd98l8up7DtceGp6eZ93iC0utJzkeadlo89zmwjsxMVkw4J6N5%2BXitJUeTAnIe9djiAh%2FKK6ZyDjAduQXvj2wQx3oT1iB5cOHKzMW2wSn2AN0AskvsTr%2BtkYo%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240314T153930Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5ADFH2H25X%2F20240314%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=5ef646dd73c0763d4ded4d30a43b93e467ca5119ee1813481fe785728eecde75',
        coordinationValues: {
            obsType: 'gloms',
            featureType: 'feature',
            featureValueType: 'value',
        },
    });

    const spatialThreeView = config.addView(dataset, 'spatialThree');
    const lcView = config.addView(dataset, 'layerControllerBeta');
    const obsSetsView = config.addView(dataset, 'obsSets');
    const barPlot = config.addView(dataset, 'featureBarPlot').setProps({
        yUnits: 'microns cubed'
    });

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

    glomsObsTypeScope.setValue('gloms');
    glomsFeatureTypeScope.setValue('feature');
    glomsFeatureValueTypeScope.setValue('value');
    glomsFeatureSelectionScope.setValue(['Volume']);

    //const [selectionScope, colorScope] = config.addCoordination('obsSetSelection', 'obsSetColor');
    obsSetsView.useCoordination(selectionScope, colorScope);

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
                spatialTargetX: 430,
                spatialTargetY: -520,
                spatialTargetZ: -420,
                spatialScaleX: -0.275,
                spatialScaleY: 0.034375,
                spatialScaleZ: 0.275,
                spatialRotationX: 1.57079632679,
                spatialSceneScaleX: 1.0,
                spatialSceneScaleY: 1.0,
                spatialSceneScaleZ: 8.0,
                spatialMaterialBackside: true,
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
                        obsHighlight: highlightScope,
                        obsSetSelection: selectionScope,
                        obsSetColor: colorScope,
                    }
                ])
            }
        ])
    });
    config.linkViewsByObject([barPlot], {
        obsType: glomsObsTypeScope,
        featureType: glomsFeatureTypeScope,
        featureValueType: glomsFeatureValueTypeScope,
        featureSelection: glomsFeatureSelectionScope,
        obsHighlight: highlightScope,
        obsSetSelection: selectionScope,
        obsSetColor: colorScope,
        obsColorEncoding: colorEncodingScope,
    }, false);

    // config.layout(hconcat(vconcat(spatialThreeView,spatialVolumeView), vconcat(lcView,obsSetsView, barPlot)));
    config.layout(hconcat(spatialThreeView, vconcat(lcView,vconcat(obsSetsView, barPlot))));

    const configJSON = config.toJSON();
    return configJSON;
}

export const jainkidneyDecimated = generateJainKidneyDecimatedConfig();
