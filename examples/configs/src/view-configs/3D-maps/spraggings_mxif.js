import {
    VitessceConfig,
    CoordinationLevel as CL,
    hconcat, vconcat,
} from '@vitessce/config';


function generateSpraggingsMxIF() {
    const config = new VitessceConfig({
        schemaVersion: '1.0.16',
        name: 'Spraggings Kidney MxIF',
    });
    const dataset = config.addDataset('My dataset').addFile({
        fileType: 'image.ome-tiff',
        url: 'https://hdv-spatial-data.s3.us-east-1.amazonaws.com/spraggings/pyramid.ome.tif?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjELL%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJIMEYCIQCiFH0HBEb6L%2ByR1TFJ1aw7XDnckyukwJydFDWdDedGGwIhAPIcAZzxIONvbxFBeDEiIzJ7qRNIWtiUepj2RpAYnBPRKvUDCMr%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQARoMMTM2NTc2NTIyMDQ4IgwgQnkUFHItP%2FQXAgMqyQMzeUSwR17udC%2BxCmYtOxnUCyQQuDORpN8fmuMQjgwY55CMQnV0IOD7Apy2Ega8PXoQYQJktePHPewCkBTkhs7htjZ6E85ZwUBRmw%2BcFfhdjvpmQflolrkJk%2Fr%2B61PaQtkUcj3MfFEZbt4DqG8cs%2FpPLfiHvf8L4bJy2qiBvbfbWR5mSIr%2BC4cD7oIQUqnnLdWmvWLJJ12L5kXodrsJLZmWM%2F29q92u7zeJ6NkTcw6LdedUCumL44MX%2Fl9xY%2Bvrz3IAsisdYAzXrEfPCJoW7Oyk3KyjD2eApVS9IzZ8768Ycm2NzJRrHEMg1GVBjFiIQA874y2%2FDM1l00I5xVhU8LuFaLEciNLkvfq8sT15liQrYLrO6UVfBCHtVcntWyX3AZdXVV%2F7TpS4l1dy5p07W0MPiRmF94gWoouehPS1P7v3S%2BkQt2GTxoIfqrTz%2BA3afM6bkHHPX90QLVaR3R39wrqysRRP0AasVXcxm4IOniUzp3x8zAGVFtoyA%2F7oN2WFma9e7SXumwSihod28P1Ws22795PBbRUlmMUkIN7RHm%2B%2BP0vRTkQ3OeJZIT1MlYdwpy6bEhjzCjakdhA4XgqmExDsifihosACt0JaMIuHk7AGOpMCQbrZnRAiKobcmEz%2BS7S2RzPKhwwOIESo7XwwWZ3faDf%2BpEmdxMrwYQo0D%2F4MlnSUxx%2FyIkozxUQzXXSGLxUmGjFAbskVBCSZFNt%2BCfU8SFnJ6YpLSjwPXXWPgCDeVRetG9J1W2DPQyCvm4WXnzxjZFYN4hmW2gVdyzEmdYysQcr5wj4FNk9YhmHTkUeHKvm6IRKbpNivwDOtRxg9sqqgHPSFDU4b8twvE9RK0r1y5QQw4hOGPR1xitJZi5fyjcH4wXWWQgwtGvyZLQnmYdgM96aSqkVJVX5MBZ5Osj9U1w2fYuDDBIsWuNYG25QLuFcpW2BwPBbsAf5nwe0qcDN28qt1flsI3Ni3aUSvtDwLSy29yvo%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240328T011203Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5AGFSMNBLF%2F20240328%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=c9f96391370993e584eeceebfc588bf37b2e238ab29fd6f02703cbfdaa2236c5',
        options: {
            offsetsUrl: "https://hdv-spatial-data.s3.us-east-1.amazonaws.com/spraggings/pyramid.offsets.json?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjELL%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJIMEYCIQCiFH0HBEb6L%2ByR1TFJ1aw7XDnckyukwJydFDWdDedGGwIhAPIcAZzxIONvbxFBeDEiIzJ7qRNIWtiUepj2RpAYnBPRKvUDCMr%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQARoMMTM2NTc2NTIyMDQ4IgwgQnkUFHItP%2FQXAgMqyQMzeUSwR17udC%2BxCmYtOxnUCyQQuDORpN8fmuMQjgwY55CMQnV0IOD7Apy2Ega8PXoQYQJktePHPewCkBTkhs7htjZ6E85ZwUBRmw%2BcFfhdjvpmQflolrkJk%2Fr%2B61PaQtkUcj3MfFEZbt4DqG8cs%2FpPLfiHvf8L4bJy2qiBvbfbWR5mSIr%2BC4cD7oIQUqnnLdWmvWLJJ12L5kXodrsJLZmWM%2F29q92u7zeJ6NkTcw6LdedUCumL44MX%2Fl9xY%2Bvrz3IAsisdYAzXrEfPCJoW7Oyk3KyjD2eApVS9IzZ8768Ycm2NzJRrHEMg1GVBjFiIQA874y2%2FDM1l00I5xVhU8LuFaLEciNLkvfq8sT15liQrYLrO6UVfBCHtVcntWyX3AZdXVV%2F7TpS4l1dy5p07W0MPiRmF94gWoouehPS1P7v3S%2BkQt2GTxoIfqrTz%2BA3afM6bkHHPX90QLVaR3R39wrqysRRP0AasVXcxm4IOniUzp3x8zAGVFtoyA%2F7oN2WFma9e7SXumwSihod28P1Ws22795PBbRUlmMUkIN7RHm%2B%2BP0vRTkQ3OeJZIT1MlYdwpy6bEhjzCjakdhA4XgqmExDsifihosACt0JaMIuHk7AGOpMCQbrZnRAiKobcmEz%2BS7S2RzPKhwwOIESo7XwwWZ3faDf%2BpEmdxMrwYQo0D%2F4MlnSUxx%2FyIkozxUQzXXSGLxUmGjFAbskVBCSZFNt%2BCfU8SFnJ6YpLSjwPXXWPgCDeVRetG9J1W2DPQyCvm4WXnzxjZFYN4hmW2gVdyzEmdYysQcr5wj4FNk9YhmHTkUeHKvm6IRKbpNivwDOtRxg9sqqgHPSFDU4b8twvE9RK0r1y5QQw4hOGPR1xitJZi5fyjcH4wXWWQgwtGvyZLQnmYdgM96aSqkVJVX5MBZ5Osj9U1w2fYuDDBIsWuNYG25QLuFcpW2BwPBbsAf5nwe0qcDN28qt1flsI3Ni3aUSvtDwLSy29yvo%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240328T011359Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5AGFSMNBLF%2F20240328%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=53f15e10110e124dd7a527e03b16bd94fbe91d9b7a6e3d9e858b74f44b8b4437",
        },
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
                        spatialTargetC: 8,
                        spatialChannelColor: [221, 52, 151],
                        spatialChannelVisible: true,
                        spatialChannelOpacity: 1.0,
                        spatialChannelWindow: [6,134],
                    },
                    {
                        spatialTargetC: 0,
                        spatialChannelColor: [255, 0, 0],
                        spatialChannelVisible: true,
                        spatialChannelOpacity: 1.0,
                        spatialChannelWindow: [4,95],
                    },
                    // {
                    //     spatialTargetC: 0,
                    //     spatialChannelColor: [255, 0, 0],
                    //     spatialChannelVisible: true,
                    //     spatialChannelOpacity: 1.0,
                    //     spatialChannelWindow: null,
                    // },
                ]),
            },
        ])
    });

    config.layout(hconcat(spatialThreeView, lcView));

    const configJSON = config.toJSON();
    return configJSON;
}

export const spraggingsMxIF = generateSpraggingsMxIF();
