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
        url: "https://vitessce-data-v2.s3.amazonaws.com/data/redBloodCell.ome.tiff",
        options: {
            offsetsUrl: "https://vitessce-data-v2.s3.amazonaws.com/data/redBloodCell.offsets.json",
        },
        coordinationValues: {
            fileUid: 'kidney',
        },
    }).addFile({
        fileType: 'segmentation.glb',
        url: 'https://vitessce-data-v2.s3.amazonaws.com/data/redBloodCell.offsets.json',
        //url: 'https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/decimated_gloms_compressed.glb?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEG8aCXVzLWVhc3QtMSJHMEUCIA2Q%2Fp9LxB9UTweIRo3872hd6H61tdxin3i%2FZcog1EzzAiEA7stLCc7SlEFB176gd%2FylwciIsA%2BZwULlx9iqlXuzXR0q6wMISBABGgwxMzY1NzY1MjIwNDgiDOzEorsai8EMG94NyyrIA2%2BcUSRI%2BMjhYdO7hWgBVu8d8J2RlBJXA7a2Ow06yew92mupimlmofKWm04pgjAAncK%2FSz2h2c5Rd93Hj7u1Hjc%2ByXgwGmRG9l7ipmcMuz2HqLZN6AMSnuCgEUFqgKVc8JaerkTyzxwlubXNimDYxzL%2FqzN7JNC0NiKz4nKU6Xhv6tLLg4s24S2V4AisZ8%2F3T6u6%2BSsWtMUf8nb%2FeXMvhjhyVYJcTeuaZgxOcq%2BBiyu0uzMRDst2haSTieiwaTt%2F7e%2BkpoGIMhGvrABD%2BHku4Vs89fWP%2BT0XwOVCytWy1eNGOysQAaiJOszpFvi09yT73vPTgpkn8H%2BD1MtWL3ey1D8%2FNislK4RMQSZ8k9Tj341iqVTGw%2FSu0iuEcy4O9m07k9YYhojaCdcpngb59n2xBFYDyg4rcCiGd3CPbzMCWeWijrFc9yI1qMRZbScZm5igpIs0cvlY%2B3sKl2jbjQ7I5H4jXNVrdeRpf7SZGbGPrg5JGiDQBeRhmncCNd885fSXvc9cW3bwDAJfVZv2rlAXYztQoB66aQXUCvGymXsDgxG5tfuD4CZSZe9opRxHhO3x47snAhk6yPNcLb9Atzx7M4JKOoqUSTED%2BjDTs6OuBjqUAkg5FsqMY5bznmtJUlMlpG9JTpZygZEUty90xm0O6eggNggG%2FMfTxxtiIY47%2FsZ%2FMvojyjOkjjZvR7r4LMAsDo8SuhiXj55JwpRA11IPHbNqcqmVZrkHfqtvrgHmb%2FQ17VUgFPZrDzNKfVhigzJAFn5C7rXEcAXSENUSMdCHmtcbQC5Yt6KLxYhcCTLJThsabqX6KFS0wKpLs8k3XR1OhE9mIf70HuNNh9EH5IHrxSX26HZjpV%2BeQDyGtUOH3m5IBAZfp2VHEiTrl3D%2BHZ8u36Nqj6LZbncHf4GszPccKcGp5h59wJ4vnitFeOZ3EMvAYM%2BspTDkNS0W4bs0iJtbusb1kWKAwiQMidub%2FXQmXgrcrXFKEA%3D%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240211T144242Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43199&X-Amz-Credential=ASIAR7TEYK5AIMGLC6UY%2F20240211%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=093c2eac3f14fbc1068d14fd062985408a8b7b1c5cddb0c5f6581c654a5bb161',
        coordinationValues: {
            fileUid: 'gloms',
        }
    }).addFile({
        fileType: 'obsFeatureMatrix.csv',
        url: 'https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/statistics.csv?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjELj%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJGMEQCIFi8wdRY%2ByZphHOn%2B%2FqsgdwSSILDCnJQ0ESK2gBNehf5AiASoLWaG4l8L%2Fa0DyLfnSxCQGDyfeeRpj5r4KG3p7A86ir0AwiR%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAEaDDEzNjU3NjUyMjA0OCIMWBk2EKs9cFK7O%2FUVKsgDI9lJ7dmMVsk4IBLERk%2BsznAcXC9hGBROl7hvBOFBXrNjEh6TPQr7QbXE3jouvuzPbq7Qf5FrweHx%2FgjKnhxaVOizqFPMISPYraRrJsSbRYnW88HLbxsGG4zXc4HEZrSFS7UXhKgeCq0AECFXNtLOIz0sMOCAzmjWovUUJmhFVQR1a9RJBlEt4syLQtT%2Fc1Wgcqkib%2Fp8psBpFj%2FbevUPdLZQq7Rqg%2F09T8ida%2Fn%2BTB%2BswidofIkDBmTGm2S%2BwLB8CxKrJa8j5SvRUSQEZ7g0tRQVuaw53wlTUow%2FkoTh3Aq2dkaryjFFwwYnHxW2D%2Fiv%2F%2F1DZRxY9d1R5OZsFt3DF%2FxobHHb6qm3PEGI1v1eh8qbf3NAxPAbdIuMXmQIbXKw1TcER%2BUIhyxApBQ9lhyC7gbXCRcmoGuYUU%2FZEGrpkl6AQHrIev8wXQZozZL6O7fMIyr0rNiqh7zH5lh7a1p0PLItbH%2FUK2yyVcCWNlgKnxi0CoMEQxpN36Ib%2FlpWgPDOAcAcAqPC6R%2FlPoAOLPLGxcmEop2BEu6vG29Q%2F%2FXbE8k6Qc%2BNqmc7KuSpJSZjoa2x76Rl0CTrJn4Nm915hZeLfbllc6U95%2FMqMPa%2Fs64GOpUC2gKtt9dtZXWLybGQcn8bmNLddiM%2Fv6dHYArUcz%2BemJTFD7%2BEwBULkndzN8L0zxJ%2Fx6ppLDD8EZhfZqvy%2FOrx%2FAog%2FT4YXGypiqKyFmvEfoc9lgWPCreSzZ3IQkBvUk7mh3vQXKnU9Mpja0LILhURPRpU6NMC52HmOivGSdiCxG%2Fmdgw%2Bbxe14mODmSv8Lzq0wWFnhukLnfC1JmNJiHFMkinEPIbrLesoglkUHeBLVpuReeYt0ZmaOGIKkRIMHIJiZ1C18%2Bfts89PzODNedldZHNZilY7JYv5LPxMEFZ9an3LswNSoPcs7AfpNFHTRxqREfYkW3zIBF01ttc7oq4OGjkbYTD2ayPYPkMrp%2Fjye2oOg76m9Q%3D%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240214T154554Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5AEYNFHA5A%2F20240214%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=b0b39d31ad7f1b248debe302d7c9b3115f1e8e82d2e47e52147da9ef14bfeb99',
        coordinationValues: {
            obsType: 'gloms',
            featureType: 'feature',
            featureValueType: 'value',
        },
    })

    const spatialThreeView = config.addView(dataset, 'spatialThree');
   // const spatialVolumeView = config.addView(dataset, 'spatialBeta').setProps({ title: 'MIP' });
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
    config.layout(hconcat(spatialThreeView, vconcat(lcView,obsSetsView, barPlot)));

    const configJSON = config.toJSON();
    return configJSON;
}

export const blinOop2019Three = generateBlinConfig();
