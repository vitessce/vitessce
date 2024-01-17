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
        url: "https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/LS_20x_5_Stitched.pyramid.ome.tiff?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEBYaCXVzLWVhc3QtMSJIMEYCIQDVvXdhHP5yW3stI4K4eSs%2Bar7XfHHT9LIqz3jJYhDXrgIhAI8GQ2wBRQxD0ntFz8F5CeKO4HCWErMhwlf6ZNfVqJ4lKvQDCL7%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQARoMMTM2NTc2NTIyMDQ4IgwWuaGq1N3Y%2B5AVCuwqyAOXe%2FBk5ZN34c5Ijj785YXYTkSetYG741khHkGgYI13DpDLewzlH5EMXYOgn0PEaYjMachbGbR%2BotAMy%2F%2FwrEK%2FT9W1gHd7s7R4%2B9IvFhe%2FMz6d%2BTBXAsEwjtcvKxAicp%2FxzgvFRlDlZiXolaME2BN1dZktgZToBkL9G5GhoIAG2ZhRbC%2BCQY6f9RXlK9ZtnYUMtjXTp3n5FR56yfcNSkIp5EzHat9qUnT5dU5gFZLabU9hClop8AN%2BF50g5b3C0W%2FF6%2FpNFAnvY67UQJWGrnudxkLjYWa%2FGmFCstKAbd8bLBTlcU2giYJKZHhL5zmnkO1sD3PrFK8kqcrwGqUG%2FGQby6BFvwR58Hdl5hP7i6FYq1EMNT%2BdVVELmyx3DgnGKcUsoUhAjgfAylGcrq%2F4ifITAuxm6e0t9GzoM2vgBTcK%2BwSNlKZu8ngxp2n0Zd1OgmstIaa1Y3hUrEbyDoHCiykTHRjzKxd2mGInwD3hKZt5LpoqxNDLMB3eks7%2B294fXVNcQIQtx7SIoCk4RKpAP8tdUyIBoxGriE2%2FJdQqBHyJ3QVrEISYF6CgaKlyoMU1tgthnh%2BX27pNMP%2F8CFSfoA6b3mrxkpyLzkowrKifrQY6kwJsdoAqvPgjQZ95O%2BRdAlDSf9MYjaqKTMHIl%2FAk3hFQKCl%2Bb4ORrshYOBLO2CXHtFBLmZ6wz0iavDqwTm8Uts5O2ELuOvViXh1NUf4%2FcvCy%2BOBLcIOGCm6oFfUtjV3LOLLBYYlVxP9KebXS5sgKZNI3yavnZA%2FnpwaVxkZM3b4XNt9KwWgn85peLiWEpZFNLvi8hC7KCNfd2axMAmBPenvuFyzeWOTyptDA3Qh3mDlbXaDRHDRjnN9d8OV3YvzRdbg7zuTbqgJSIUSkUBxRK%2FQVM9%2Bx6bMK6%2F%2BO5DJAOGwjPU50tfSgeQa33Y3HA6Q8AQnf7i6V%2BezOAVy%2F1TUQ%2BGkdAp2jde1Y9xKPfDnh%2FRxzRcHzQg%3D%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240117T132118Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5ACQLPC6LU%2F20240117%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=d090537f661be7896174714579b6ba37dbeee2affc7685d6a83ce6989caa4723",
        options: {
            offsetsUrl: "https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/LS_20x_5_Stitched.pyramid.offsets.json?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEBYaCXVzLWVhc3QtMSJIMEYCIQDVvXdhHP5yW3stI4K4eSs%2Bar7XfHHT9LIqz3jJYhDXrgIhAI8GQ2wBRQxD0ntFz8F5CeKO4HCWErMhwlf6ZNfVqJ4lKvQDCL7%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQARoMMTM2NTc2NTIyMDQ4IgwWuaGq1N3Y%2B5AVCuwqyAOXe%2FBk5ZN34c5Ijj785YXYTkSetYG741khHkGgYI13DpDLewzlH5EMXYOgn0PEaYjMachbGbR%2BotAMy%2F%2FwrEK%2FT9W1gHd7s7R4%2B9IvFhe%2FMz6d%2BTBXAsEwjtcvKxAicp%2FxzgvFRlDlZiXolaME2BN1dZktgZToBkL9G5GhoIAG2ZhRbC%2BCQY6f9RXlK9ZtnYUMtjXTp3n5FR56yfcNSkIp5EzHat9qUnT5dU5gFZLabU9hClop8AN%2BF50g5b3C0W%2FF6%2FpNFAnvY67UQJWGrnudxkLjYWa%2FGmFCstKAbd8bLBTlcU2giYJKZHhL5zmnkO1sD3PrFK8kqcrwGqUG%2FGQby6BFvwR58Hdl5hP7i6FYq1EMNT%2BdVVELmyx3DgnGKcUsoUhAjgfAylGcrq%2F4ifITAuxm6e0t9GzoM2vgBTcK%2BwSNlKZu8ngxp2n0Zd1OgmstIaa1Y3hUrEbyDoHCiykTHRjzKxd2mGInwD3hKZt5LpoqxNDLMB3eks7%2B294fXVNcQIQtx7SIoCk4RKpAP8tdUyIBoxGriE2%2FJdQqBHyJ3QVrEISYF6CgaKlyoMU1tgthnh%2BX27pNMP%2F8CFSfoA6b3mrxkpyLzkowrKifrQY6kwJsdoAqvPgjQZ95O%2BRdAlDSf9MYjaqKTMHIl%2FAk3hFQKCl%2Bb4ORrshYOBLO2CXHtFBLmZ6wz0iavDqwTm8Uts5O2ELuOvViXh1NUf4%2FcvCy%2BOBLcIOGCm6oFfUtjV3LOLLBYYlVxP9KebXS5sgKZNI3yavnZA%2FnpwaVxkZM3b4XNt9KwWgn85peLiWEpZFNLvi8hC7KCNfd2axMAmBPenvuFyzeWOTyptDA3Qh3mDlbXaDRHDRjnN9d8OV3YvzRdbg7zuTbqgJSIUSkUBxRK%2FQVM9%2Bx6bMK6%2F%2BO5DJAOGwjPU50tfSgeQa33Y3HA6Q8AQnf7i6V%2BezOAVy%2F1TUQ%2BGkdAp2jde1Y9xKPfDnh%2FRxzRcHzQg%3D%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240117T132107Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5ACQLPC6LU%2F20240117%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=9c61e0833cd8914f3d6d884ca2eed5df2c91898e8fe0d4c977429db139c1d39f"
        },
        coordinationValues: {
            fileUid: 'kidney',
        },
    }).addFile({
        fileType: 'segmentation.glb',
        url: 'https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/glom_surface_export_reduced_draco.glb?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEBYaCXVzLWVhc3QtMSJIMEYCIQDVvXdhHP5yW3stI4K4eSs%2Bar7XfHHT9LIqz3jJYhDXrgIhAI8GQ2wBRQxD0ntFz8F5CeKO4HCWErMhwlf6ZNfVqJ4lKvQDCL7%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQARoMMTM2NTc2NTIyMDQ4IgwWuaGq1N3Y%2B5AVCuwqyAOXe%2FBk5ZN34c5Ijj785YXYTkSetYG741khHkGgYI13DpDLewzlH5EMXYOgn0PEaYjMachbGbR%2BotAMy%2F%2FwrEK%2FT9W1gHd7s7R4%2B9IvFhe%2FMz6d%2BTBXAsEwjtcvKxAicp%2FxzgvFRlDlZiXolaME2BN1dZktgZToBkL9G5GhoIAG2ZhRbC%2BCQY6f9RXlK9ZtnYUMtjXTp3n5FR56yfcNSkIp5EzHat9qUnT5dU5gFZLabU9hClop8AN%2BF50g5b3C0W%2FF6%2FpNFAnvY67UQJWGrnudxkLjYWa%2FGmFCstKAbd8bLBTlcU2giYJKZHhL5zmnkO1sD3PrFK8kqcrwGqUG%2FGQby6BFvwR58Hdl5hP7i6FYq1EMNT%2BdVVELmyx3DgnGKcUsoUhAjgfAylGcrq%2F4ifITAuxm6e0t9GzoM2vgBTcK%2BwSNlKZu8ngxp2n0Zd1OgmstIaa1Y3hUrEbyDoHCiykTHRjzKxd2mGInwD3hKZt5LpoqxNDLMB3eks7%2B294fXVNcQIQtx7SIoCk4RKpAP8tdUyIBoxGriE2%2FJdQqBHyJ3QVrEISYF6CgaKlyoMU1tgthnh%2BX27pNMP%2F8CFSfoA6b3mrxkpyLzkowrKifrQY6kwJsdoAqvPgjQZ95O%2BRdAlDSf9MYjaqKTMHIl%2FAk3hFQKCl%2Bb4ORrshYOBLO2CXHtFBLmZ6wz0iavDqwTm8Uts5O2ELuOvViXh1NUf4%2FcvCy%2BOBLcIOGCm6oFfUtjV3LOLLBYYlVxP9KebXS5sgKZNI3yavnZA%2FnpwaVxkZM3b4XNt9KwWgn85peLiWEpZFNLvi8hC7KCNfd2axMAmBPenvuFyzeWOTyptDA3Qh3mDlbXaDRHDRjnN9d8OV3YvzRdbg7zuTbqgJSIUSkUBxRK%2FQVM9%2Bx6bMK6%2F%2BO5DJAOGwjPU50tfSgeQa33Y3HA6Q8AQnf7i6V%2BezOAVy%2F1TUQ%2BGkdAp2jde1Y9xKPfDnh%2FRxzRcHzQg%3D%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240117T132131Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5ACQLPC6LU%2F20240117%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=c9969887ae835522702739c313cb6dd1f46114b392fa9bc967c8019e1c31c4e8',
        coordinationValues: {
            fileUid: 'gloms',
        }
    }).addFile({
        fileType: 'obsFeatureMatrix.csv',
        url: 'https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/statistics.csv?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEBYaCXVzLWVhc3QtMSJIMEYCIQDVvXdhHP5yW3stI4K4eSs%2Bar7XfHHT9LIqz3jJYhDXrgIhAI8GQ2wBRQxD0ntFz8F5CeKO4HCWErMhwlf6ZNfVqJ4lKvQDCL7%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQARoMMTM2NTc2NTIyMDQ4IgwWuaGq1N3Y%2B5AVCuwqyAOXe%2FBk5ZN34c5Ijj785YXYTkSetYG741khHkGgYI13DpDLewzlH5EMXYOgn0PEaYjMachbGbR%2BotAMy%2F%2FwrEK%2FT9W1gHd7s7R4%2B9IvFhe%2FMz6d%2BTBXAsEwjtcvKxAicp%2FxzgvFRlDlZiXolaME2BN1dZktgZToBkL9G5GhoIAG2ZhRbC%2BCQY6f9RXlK9ZtnYUMtjXTp3n5FR56yfcNSkIp5EzHat9qUnT5dU5gFZLabU9hClop8AN%2BF50g5b3C0W%2FF6%2FpNFAnvY67UQJWGrnudxkLjYWa%2FGmFCstKAbd8bLBTlcU2giYJKZHhL5zmnkO1sD3PrFK8kqcrwGqUG%2FGQby6BFvwR58Hdl5hP7i6FYq1EMNT%2BdVVELmyx3DgnGKcUsoUhAjgfAylGcrq%2F4ifITAuxm6e0t9GzoM2vgBTcK%2BwSNlKZu8ngxp2n0Zd1OgmstIaa1Y3hUrEbyDoHCiykTHRjzKxd2mGInwD3hKZt5LpoqxNDLMB3eks7%2B294fXVNcQIQtx7SIoCk4RKpAP8tdUyIBoxGriE2%2FJdQqBHyJ3QVrEISYF6CgaKlyoMU1tgthnh%2BX27pNMP%2F8CFSfoA6b3mrxkpyLzkowrKifrQY6kwJsdoAqvPgjQZ95O%2BRdAlDSf9MYjaqKTMHIl%2FAk3hFQKCl%2Bb4ORrshYOBLO2CXHtFBLmZ6wz0iavDqwTm8Uts5O2ELuOvViXh1NUf4%2FcvCy%2BOBLcIOGCm6oFfUtjV3LOLLBYYlVxP9KebXS5sgKZNI3yavnZA%2FnpwaVxkZM3b4XNt9KwWgn85peLiWEpZFNLvi8hC7KCNfd2axMAmBPenvuFyzeWOTyptDA3Qh3mDlbXaDRHDRjnN9d8OV3YvzRdbg7zuTbqgJSIUSkUBxRK%2FQVM9%2Bx6bMK6%2F%2BO5DJAOGwjPU50tfSgeQa33Y3HA6Q8AQnf7i6V%2BezOAVy%2F1TUQ%2BGkdAp2jde1Y9xKPfDnh%2FRxzRcHzQg%3D%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240117T132145Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5ACQLPC6LU%2F20240117%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=04e462271ad0e06b50106613423f766d9d07706dbea2292a85765103b5712d1e',
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
