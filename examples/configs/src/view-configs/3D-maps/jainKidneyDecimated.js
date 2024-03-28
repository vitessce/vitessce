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
        url: 'https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/LS_20x_5_Stitched.pyramid.ome.tiff?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjELL%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJIMEYCIQCiFH0HBEb6L%2ByR1TFJ1aw7XDnckyukwJydFDWdDedGGwIhAPIcAZzxIONvbxFBeDEiIzJ7qRNIWtiUepj2RpAYnBPRKvUDCMr%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQARoMMTM2NTc2NTIyMDQ4IgwgQnkUFHItP%2FQXAgMqyQMzeUSwR17udC%2BxCmYtOxnUCyQQuDORpN8fmuMQjgwY55CMQnV0IOD7Apy2Ega8PXoQYQJktePHPewCkBTkhs7htjZ6E85ZwUBRmw%2BcFfhdjvpmQflolrkJk%2Fr%2B61PaQtkUcj3MfFEZbt4DqG8cs%2FpPLfiHvf8L4bJy2qiBvbfbWR5mSIr%2BC4cD7oIQUqnnLdWmvWLJJ12L5kXodrsJLZmWM%2F29q92u7zeJ6NkTcw6LdedUCumL44MX%2Fl9xY%2Bvrz3IAsisdYAzXrEfPCJoW7Oyk3KyjD2eApVS9IzZ8768Ycm2NzJRrHEMg1GVBjFiIQA874y2%2FDM1l00I5xVhU8LuFaLEciNLkvfq8sT15liQrYLrO6UVfBCHtVcntWyX3AZdXVV%2F7TpS4l1dy5p07W0MPiRmF94gWoouehPS1P7v3S%2BkQt2GTxoIfqrTz%2BA3afM6bkHHPX90QLVaR3R39wrqysRRP0AasVXcxm4IOniUzp3x8zAGVFtoyA%2F7oN2WFma9e7SXumwSihod28P1Ws22795PBbRUlmMUkIN7RHm%2B%2BP0vRTkQ3OeJZIT1MlYdwpy6bEhjzCjakdhA4XgqmExDsifihosACt0JaMIuHk7AGOpMCQbrZnRAiKobcmEz%2BS7S2RzPKhwwOIESo7XwwWZ3faDf%2BpEmdxMrwYQo0D%2F4MlnSUxx%2FyIkozxUQzXXSGLxUmGjFAbskVBCSZFNt%2BCfU8SFnJ6YpLSjwPXXWPgCDeVRetG9J1W2DPQyCvm4WXnzxjZFYN4hmW2gVdyzEmdYysQcr5wj4FNk9YhmHTkUeHKvm6IRKbpNivwDOtRxg9sqqgHPSFDU4b8twvE9RK0r1y5QQw4hOGPR1xitJZi5fyjcH4wXWWQgwtGvyZLQnmYdgM96aSqkVJVX5MBZ5Osj9U1w2fYuDDBIsWuNYG25QLuFcpW2BwPBbsAf5nwe0qcDN28qt1flsI3Ni3aUSvtDwLSy29yvo%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240328T012941Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5AGFSMNBLF%2F20240328%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=8d89d50adbd85aa0c57293ebb7369a8c92f2226fd9b5829cb0766175a4e5f1f7',
        options: {
            offsetsUrl: 'https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/LS_20x_5_Stitched.pyramid.offsets.json?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjELL%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJIMEYCIQCiFH0HBEb6L%2ByR1TFJ1aw7XDnckyukwJydFDWdDedGGwIhAPIcAZzxIONvbxFBeDEiIzJ7qRNIWtiUepj2RpAYnBPRKvUDCMr%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQARoMMTM2NTc2NTIyMDQ4IgwgQnkUFHItP%2FQXAgMqyQMzeUSwR17udC%2BxCmYtOxnUCyQQuDORpN8fmuMQjgwY55CMQnV0IOD7Apy2Ega8PXoQYQJktePHPewCkBTkhs7htjZ6E85ZwUBRmw%2BcFfhdjvpmQflolrkJk%2Fr%2B61PaQtkUcj3MfFEZbt4DqG8cs%2FpPLfiHvf8L4bJy2qiBvbfbWR5mSIr%2BC4cD7oIQUqnnLdWmvWLJJ12L5kXodrsJLZmWM%2F29q92u7zeJ6NkTcw6LdedUCumL44MX%2Fl9xY%2Bvrz3IAsisdYAzXrEfPCJoW7Oyk3KyjD2eApVS9IzZ8768Ycm2NzJRrHEMg1GVBjFiIQA874y2%2FDM1l00I5xVhU8LuFaLEciNLkvfq8sT15liQrYLrO6UVfBCHtVcntWyX3AZdXVV%2F7TpS4l1dy5p07W0MPiRmF94gWoouehPS1P7v3S%2BkQt2GTxoIfqrTz%2BA3afM6bkHHPX90QLVaR3R39wrqysRRP0AasVXcxm4IOniUzp3x8zAGVFtoyA%2F7oN2WFma9e7SXumwSihod28P1Ws22795PBbRUlmMUkIN7RHm%2B%2BP0vRTkQ3OeJZIT1MlYdwpy6bEhjzCjakdhA4XgqmExDsifihosACt0JaMIuHk7AGOpMCQbrZnRAiKobcmEz%2BS7S2RzPKhwwOIESo7XwwWZ3faDf%2BpEmdxMrwYQo0D%2F4MlnSUxx%2FyIkozxUQzXXSGLxUmGjFAbskVBCSZFNt%2BCfU8SFnJ6YpLSjwPXXWPgCDeVRetG9J1W2DPQyCvm4WXnzxjZFYN4hmW2gVdyzEmdYysQcr5wj4FNk9YhmHTkUeHKvm6IRKbpNivwDOtRxg9sqqgHPSFDU4b8twvE9RK0r1y5QQw4hOGPR1xitJZi5fyjcH4wXWWQgwtGvyZLQnmYdgM96aSqkVJVX5MBZ5Osj9U1w2fYuDDBIsWuNYG25QLuFcpW2BwPBbsAf5nwe0qcDN28qt1flsI3Ni3aUSvtDwLSy29yvo%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240328T012927Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5AGFSMNBLF%2F20240328%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=967b62c697d3526d5accb4e04101e58652877ef2098a3f868f0be293eb0d62c9',
        },
        coordinationValues: {
            fileUid: 'kidney',
        },
    }).addFile({
        fileType: 'segmentation.glb',
        url: 'https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/decimated.glb?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjELL%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJIMEYCIQCiFH0HBEb6L%2ByR1TFJ1aw7XDnckyukwJydFDWdDedGGwIhAPIcAZzxIONvbxFBeDEiIzJ7qRNIWtiUepj2RpAYnBPRKvUDCMr%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQARoMMTM2NTc2NTIyMDQ4IgwgQnkUFHItP%2FQXAgMqyQMzeUSwR17udC%2BxCmYtOxnUCyQQuDORpN8fmuMQjgwY55CMQnV0IOD7Apy2Ega8PXoQYQJktePHPewCkBTkhs7htjZ6E85ZwUBRmw%2BcFfhdjvpmQflolrkJk%2Fr%2B61PaQtkUcj3MfFEZbt4DqG8cs%2FpPLfiHvf8L4bJy2qiBvbfbWR5mSIr%2BC4cD7oIQUqnnLdWmvWLJJ12L5kXodrsJLZmWM%2F29q92u7zeJ6NkTcw6LdedUCumL44MX%2Fl9xY%2Bvrz3IAsisdYAzXrEfPCJoW7Oyk3KyjD2eApVS9IzZ8768Ycm2NzJRrHEMg1GVBjFiIQA874y2%2FDM1l00I5xVhU8LuFaLEciNLkvfq8sT15liQrYLrO6UVfBCHtVcntWyX3AZdXVV%2F7TpS4l1dy5p07W0MPiRmF94gWoouehPS1P7v3S%2BkQt2GTxoIfqrTz%2BA3afM6bkHHPX90QLVaR3R39wrqysRRP0AasVXcxm4IOniUzp3x8zAGVFtoyA%2F7oN2WFma9e7SXumwSihod28P1Ws22795PBbRUlmMUkIN7RHm%2B%2BP0vRTkQ3OeJZIT1MlYdwpy6bEhjzCjakdhA4XgqmExDsifihosACt0JaMIuHk7AGOpMCQbrZnRAiKobcmEz%2BS7S2RzPKhwwOIESo7XwwWZ3faDf%2BpEmdxMrwYQo0D%2F4MlnSUxx%2FyIkozxUQzXXSGLxUmGjFAbskVBCSZFNt%2BCfU8SFnJ6YpLSjwPXXWPgCDeVRetG9J1W2DPQyCvm4WXnzxjZFYN4hmW2gVdyzEmdYysQcr5wj4FNk9YhmHTkUeHKvm6IRKbpNivwDOtRxg9sqqgHPSFDU4b8twvE9RK0r1y5QQw4hOGPR1xitJZi5fyjcH4wXWWQgwtGvyZLQnmYdgM96aSqkVJVX5MBZ5Osj9U1w2fYuDDBIsWuNYG25QLuFcpW2BwPBbsAf5nwe0qcDN28qt1flsI3Ni3aUSvtDwLSy29yvo%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240328T012912Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5AGFSMNBLF%2F20240328%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=e92e16108f734b1f7af5f6e8df073eb0c275780d7b5948babd135a1a2db2a551',
        coordinationValues: {
            fileUid: 'gloms',
        }
    }).addFile({
        fileType: 'obsFeatureMatrix.csv',
        url: 'https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/statistics.csv?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjELL%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJIMEYCIQCiFH0HBEb6L%2ByR1TFJ1aw7XDnckyukwJydFDWdDedGGwIhAPIcAZzxIONvbxFBeDEiIzJ7qRNIWtiUepj2RpAYnBPRKvUDCMr%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQARoMMTM2NTc2NTIyMDQ4IgwgQnkUFHItP%2FQXAgMqyQMzeUSwR17udC%2BxCmYtOxnUCyQQuDORpN8fmuMQjgwY55CMQnV0IOD7Apy2Ega8PXoQYQJktePHPewCkBTkhs7htjZ6E85ZwUBRmw%2BcFfhdjvpmQflolrkJk%2Fr%2B61PaQtkUcj3MfFEZbt4DqG8cs%2FpPLfiHvf8L4bJy2qiBvbfbWR5mSIr%2BC4cD7oIQUqnnLdWmvWLJJ12L5kXodrsJLZmWM%2F29q92u7zeJ6NkTcw6LdedUCumL44MX%2Fl9xY%2Bvrz3IAsisdYAzXrEfPCJoW7Oyk3KyjD2eApVS9IzZ8768Ycm2NzJRrHEMg1GVBjFiIQA874y2%2FDM1l00I5xVhU8LuFaLEciNLkvfq8sT15liQrYLrO6UVfBCHtVcntWyX3AZdXVV%2F7TpS4l1dy5p07W0MPiRmF94gWoouehPS1P7v3S%2BkQt2GTxoIfqrTz%2BA3afM6bkHHPX90QLVaR3R39wrqysRRP0AasVXcxm4IOniUzp3x8zAGVFtoyA%2F7oN2WFma9e7SXumwSihod28P1Ws22795PBbRUlmMUkIN7RHm%2B%2BP0vRTkQ3OeJZIT1MlYdwpy6bEhjzCjakdhA4XgqmExDsifihosACt0JaMIuHk7AGOpMCQbrZnRAiKobcmEz%2BS7S2RzPKhwwOIESo7XwwWZ3faDf%2BpEmdxMrwYQo0D%2F4MlnSUxx%2FyIkozxUQzXXSGLxUmGjFAbskVBCSZFNt%2BCfU8SFnJ6YpLSjwPXXWPgCDeVRetG9J1W2DPQyCvm4WXnzxjZFYN4hmW2gVdyzEmdYysQcr5wj4FNk9YhmHTkUeHKvm6IRKbpNivwDOtRxg9sqqgHPSFDU4b8twvE9RK0r1y5QQw4hOGPR1xitJZi5fyjcH4wXWWQgwtGvyZLQnmYdgM96aSqkVJVX5MBZ5Osj9U1w2fYuDDBIsWuNYG25QLuFcpW2BwPBbsAf5nwe0qcDN28qt1flsI3Ni3aUSvtDwLSy29yvo%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240328T012850Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5AGFSMNBLF%2F20240328%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=b3cffcc5407cbd7560700b36b7971007e1b42f0ee4afcfca0373c8eb22c2d2d3',
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
