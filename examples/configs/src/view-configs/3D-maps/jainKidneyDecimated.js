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
        url: 'https://s3.us-east-1.amazonaws.com/hdv-spatial-data/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/LS_20x_5_Stitched.pyramid.ome.tiff?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIAR7TEYK5AHF7WIEGP%2F20240313%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240313T135014Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEFYaCXVzLWVhc3QtMSJGMEQCIHIU1Hv8e%2Fq9WjXZfcCIjj8MbisIj0ebDUzPYPdgP%2BvtAiBu6w4fbwnH4vPX0ZaNkCllKqUl9lU1ihPfz10ydoVWICqTAwhfEAEaDDEzNjU3NjUyMjA0OCIML2oAFoTKhzSOCYa6KvACto08CDdRBsri5%2FAhThXQb%2BLkpOenWWh%2Fkdcq1kNqgA%2BXXOnu0LA5LXQ%2F9jxQQjU3M1%2F%2BnL5hHSElNS7PipxhLxuD8AEGS696AV%2FDQhs0ZaAzTCmQnX2jVzTn2nTIlNoV0xpzufsHac4YAZL%2FUfjkT9Y7goXr%2FySfwVVA%2FlRgN9iscgS1ZDc68TVltLn%2BjxtJ4WaMSdXeY6B8VjGAY0nBlZF%2FK36qi%2BBSyXq7FHEWxQX7pd3CotpHCAZ0yrraSZK8%2F7MQaITdzYC1Yzg9%2BxN6XrcIbS8SqKQcdO8n03P9yIpzGsN%2F6juBc3zWd2ych32Bk9boMgYbPeZbif6gRpjYz2VT%2BFSERgus14SgZACMQAS4Ga44T9XBy2YO3aPMEeX1H5fqR8fYLzrhGJV5SO5WfbLZhh1UbIZdhILvCWUNLBf0nZPFj699wKAs3RzFw8DYxyLcqqTqxBNfj85A6McZNpib2gtPZajZ90%2BYu%2FP5VeMwt93GrwY6pwHxLb1ZW%2BIeNBesN%2BCsz8hZI60VvHYWRGJMWLYw87PK%2Fv2r9XSuRGNWzR6zBbBfSCsBTcvG3T3htgEqFUn53rmbHo0tvjZdv4BnPLeiKfSpnc0613UQjqjj%2FkLi%2FJqCjGJ6oJct1N81DklAu%2BlgW%2FhQEkn79g%2FyaxopH%2FCgfo0IIWxmdp9FavreSOt89Y9oxFe4yVKrCw%2BS1ikQN2LAqA8jOptezT7dgg%3D%3D&X-Amz-Signature=6b33533bb243396fb4b5dad24d75a2cce3bfef1c6185273ccb25a48adf6048c6',
        options: {
            offsetsUrl: 'https://s3.us-east-1.amazonaws.com/hdv-spatial-data/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/LS_20x_5_Stitched.pyramid.offsets.json?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIAR7TEYK5AHF7WIEGP%2F20240313%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240313T134923Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEFYaCXVzLWVhc3QtMSJGMEQCIHIU1Hv8e%2Fq9WjXZfcCIjj8MbisIj0ebDUzPYPdgP%2BvtAiBu6w4fbwnH4vPX0ZaNkCllKqUl9lU1ihPfz10ydoVWICqTAwhfEAEaDDEzNjU3NjUyMjA0OCIML2oAFoTKhzSOCYa6KvACto08CDdRBsri5%2FAhThXQb%2BLkpOenWWh%2Fkdcq1kNqgA%2BXXOnu0LA5LXQ%2F9jxQQjU3M1%2F%2BnL5hHSElNS7PipxhLxuD8AEGS696AV%2FDQhs0ZaAzTCmQnX2jVzTn2nTIlNoV0xpzufsHac4YAZL%2FUfjkT9Y7goXr%2FySfwVVA%2FlRgN9iscgS1ZDc68TVltLn%2BjxtJ4WaMSdXeY6B8VjGAY0nBlZF%2FK36qi%2BBSyXq7FHEWxQX7pd3CotpHCAZ0yrraSZK8%2F7MQaITdzYC1Yzg9%2BxN6XrcIbS8SqKQcdO8n03P9yIpzGsN%2F6juBc3zWd2ych32Bk9boMgYbPeZbif6gRpjYz2VT%2BFSERgus14SgZACMQAS4Ga44T9XBy2YO3aPMEeX1H5fqR8fYLzrhGJV5SO5WfbLZhh1UbIZdhILvCWUNLBf0nZPFj699wKAs3RzFw8DYxyLcqqTqxBNfj85A6McZNpib2gtPZajZ90%2BYu%2FP5VeMwt93GrwY6pwHxLb1ZW%2BIeNBesN%2BCsz8hZI60VvHYWRGJMWLYw87PK%2Fv2r9XSuRGNWzR6zBbBfSCsBTcvG3T3htgEqFUn53rmbHo0tvjZdv4BnPLeiKfSpnc0613UQjqjj%2FkLi%2FJqCjGJ6oJct1N81DklAu%2BlgW%2FhQEkn79g%2FyaxopH%2FCgfo0IIWxmdp9FavreSOt89Y9oxFe4yVKrCw%2BS1ikQN2LAqA8jOptezT7dgg%3D%3D&X-Amz-Signature=f63476f8fbe2eaadb69213e9c18a48175af22e31c987730ce1c8c89bfe6e524d',
        },
        coordinationValues: {
            fileUid: 'kidney',
        },
    }).addFile({
        fileType: 'segmentation.glb',
        url: 'https://s3.us-east-1.amazonaws.com/hdv-spatial-data/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/decimated.glb?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIAR7TEYK5AHF7WIEGP%2F20240313%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240313T134858Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEFYaCXVzLWVhc3QtMSJGMEQCIHIU1Hv8e%2Fq9WjXZfcCIjj8MbisIj0ebDUzPYPdgP%2BvtAiBu6w4fbwnH4vPX0ZaNkCllKqUl9lU1ihPfz10ydoVWICqTAwhfEAEaDDEzNjU3NjUyMjA0OCIML2oAFoTKhzSOCYa6KvACto08CDdRBsri5%2FAhThXQb%2BLkpOenWWh%2Fkdcq1kNqgA%2BXXOnu0LA5LXQ%2F9jxQQjU3M1%2F%2BnL5hHSElNS7PipxhLxuD8AEGS696AV%2FDQhs0ZaAzTCmQnX2jVzTn2nTIlNoV0xpzufsHac4YAZL%2FUfjkT9Y7goXr%2FySfwVVA%2FlRgN9iscgS1ZDc68TVltLn%2BjxtJ4WaMSdXeY6B8VjGAY0nBlZF%2FK36qi%2BBSyXq7FHEWxQX7pd3CotpHCAZ0yrraSZK8%2F7MQaITdzYC1Yzg9%2BxN6XrcIbS8SqKQcdO8n03P9yIpzGsN%2F6juBc3zWd2ych32Bk9boMgYbPeZbif6gRpjYz2VT%2BFSERgus14SgZACMQAS4Ga44T9XBy2YO3aPMEeX1H5fqR8fYLzrhGJV5SO5WfbLZhh1UbIZdhILvCWUNLBf0nZPFj699wKAs3RzFw8DYxyLcqqTqxBNfj85A6McZNpib2gtPZajZ90%2BYu%2FP5VeMwt93GrwY6pwHxLb1ZW%2BIeNBesN%2BCsz8hZI60VvHYWRGJMWLYw87PK%2Fv2r9XSuRGNWzR6zBbBfSCsBTcvG3T3htgEqFUn53rmbHo0tvjZdv4BnPLeiKfSpnc0613UQjqjj%2FkLi%2FJqCjGJ6oJct1N81DklAu%2BlgW%2FhQEkn79g%2FyaxopH%2FCgfo0IIWxmdp9FavreSOt89Y9oxFe4yVKrCw%2BS1ikQN2LAqA8jOptezT7dgg%3D%3D&X-Amz-Signature=18328774cd2e8ef454edb5467591d6c63a8127720f54e4de9a4af83b44001f43',
        coordinationValues: {
            fileUid: 'gloms',
        }
    }).addFile({
        fileType: 'obsFeatureMatrix.csv',
        url: 'https://s3.us-east-1.amazonaws.com/hdv-spatial-data/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/statistics.csv?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIAR7TEYK5AHF7WIEGP%2F20240313%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240313T134950Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEFYaCXVzLWVhc3QtMSJGMEQCIHIU1Hv8e%2Fq9WjXZfcCIjj8MbisIj0ebDUzPYPdgP%2BvtAiBu6w4fbwnH4vPX0ZaNkCllKqUl9lU1ihPfz10ydoVWICqTAwhfEAEaDDEzNjU3NjUyMjA0OCIML2oAFoTKhzSOCYa6KvACto08CDdRBsri5%2FAhThXQb%2BLkpOenWWh%2Fkdcq1kNqgA%2BXXOnu0LA5LXQ%2F9jxQQjU3M1%2F%2BnL5hHSElNS7PipxhLxuD8AEGS696AV%2FDQhs0ZaAzTCmQnX2jVzTn2nTIlNoV0xpzufsHac4YAZL%2FUfjkT9Y7goXr%2FySfwVVA%2FlRgN9iscgS1ZDc68TVltLn%2BjxtJ4WaMSdXeY6B8VjGAY0nBlZF%2FK36qi%2BBSyXq7FHEWxQX7pd3CotpHCAZ0yrraSZK8%2F7MQaITdzYC1Yzg9%2BxN6XrcIbS8SqKQcdO8n03P9yIpzGsN%2F6juBc3zWd2ych32Bk9boMgYbPeZbif6gRpjYz2VT%2BFSERgus14SgZACMQAS4Ga44T9XBy2YO3aPMEeX1H5fqR8fYLzrhGJV5SO5WfbLZhh1UbIZdhILvCWUNLBf0nZPFj699wKAs3RzFw8DYxyLcqqTqxBNfj85A6McZNpib2gtPZajZ90%2BYu%2FP5VeMwt93GrwY6pwHxLb1ZW%2BIeNBesN%2BCsz8hZI60VvHYWRGJMWLYw87PK%2Fv2r9XSuRGNWzR6zBbBfSCsBTcvG3T3htgEqFUn53rmbHo0tvjZdv4BnPLeiKfSpnc0613UQjqjj%2FkLi%2FJqCjGJ6oJct1N81DklAu%2BlgW%2FhQEkn79g%2FyaxopH%2FCgfo0IIWxmdp9FavreSOt89Y9oxFe4yVKrCw%2BS1ikQN2LAqA8jOptezT7dgg%3D%3D&X-Amz-Signature=42f4b01f0877381966c9ec57a9362abb0b2c5f4955c56c69f110f6fb7b11ebc0',
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
