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
        url: 'https://s3.us-east-1.amazonaws.com/hdv-spatial-data/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/LS_20x_5_Stitched.pyramid.ome.tiff?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIAR7TEYK5APDXAUCKF%2F20240314%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240314T015227Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEGIaCXVzLWVhc3QtMSJGMEQCIBr2bgZP306NQYmTQlOzuS9HHLHlUw%2BCX0G0%2BNAZiMg2AiA%2BdOtiQvMEiOyf5UsCFbjwbDYNUk13Whjo5h%2BfvzbywCqTAwhrEAEaDDEzNjU3NjUyMjA0OCIM4UIPZp1boNylV3jzKvACuBypqmlzxPjEmDtFP4YCZ00U5w%2FEe1%2FaoS1hsWfdvp%2Fw4M6bNmyzUU9%2B77myGhDAEILXvobR9rsrfFLrriKrp%2BE2IsKC%2Fh2tm62yJd0WWLuESwiIe67%2Bgktb4nzrI%2FSkYNC78U7DJMfIrywHvicC2jLKQSHYdTNm3HqjBvd6ISTsc8kn84FKC3WzFQmcVs%2FHDFR1QuuRsU%2FfM9clWb1UF9iAxw%2B65PiyIncxZC7wsVH6Po%2Fi%2FWMkjbFQdvCRYWXWMyMjh%2FlxYXS%2Fr0BMQ8Bu%2FUKw0nxCBgIAFT9m%2By6029t52%2BQ9QyY4Q99gzXkFIRQNhrFNXFM%2FMrst4yLHF58eAjSRI5KdtzhGkYZK6etgIdhzPSERgRccIsW4kXedx7stGERNbfcp6Lxn9sUGYZCrxaPNz9ro0nLoLlFEsduEQOWQjNwP93BG9WG2XaA2BheNUYBh9XFBQ3AvoYO1QIjcCrNLxCzYJ8Ic11k3KEZBCc8wrbDJrwY6pwEoxct1eLrOz3kwuPWD%2BctesIlmPMpfMtqI%2FFjC0Mp5MKfwuggVlJY0ildYWPDryLBkXuIkj4M%2Bg8UHcRXroDYkHQ7PPprStil4w5FdBz3aYiu16ERSjgxZ1DwSzvEv%2FU5ti8rL0BgF5AeHrjDeVGz0BIgh7oZWTn4LQrX4azkffQBsc0%2FYtU2Hw%2Flf1LL9MKp3%2B64HEumd5y0nIOaK4TAS8%2FSHmIncxA%3D%3D&X-Amz-Signature=a441a9e3205a69e293904482f30fd0923d585eb63f2c92834b56daec5a310bfb',
        options: {
            offsetsUrl: 'https://s3.us-east-1.amazonaws.com/hdv-spatial-data/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/LS_20x_5_Stitched.pyramid.offsets.json?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIAR7TEYK5APDXAUCKF%2F20240314%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240314T015305Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEGIaCXVzLWVhc3QtMSJGMEQCIBr2bgZP306NQYmTQlOzuS9HHLHlUw%2BCX0G0%2BNAZiMg2AiA%2BdOtiQvMEiOyf5UsCFbjwbDYNUk13Whjo5h%2BfvzbywCqTAwhrEAEaDDEzNjU3NjUyMjA0OCIM4UIPZp1boNylV3jzKvACuBypqmlzxPjEmDtFP4YCZ00U5w%2FEe1%2FaoS1hsWfdvp%2Fw4M6bNmyzUU9%2B77myGhDAEILXvobR9rsrfFLrriKrp%2BE2IsKC%2Fh2tm62yJd0WWLuESwiIe67%2Bgktb4nzrI%2FSkYNC78U7DJMfIrywHvicC2jLKQSHYdTNm3HqjBvd6ISTsc8kn84FKC3WzFQmcVs%2FHDFR1QuuRsU%2FfM9clWb1UF9iAxw%2B65PiyIncxZC7wsVH6Po%2Fi%2FWMkjbFQdvCRYWXWMyMjh%2FlxYXS%2Fr0BMQ8Bu%2FUKw0nxCBgIAFT9m%2By6029t52%2BQ9QyY4Q99gzXkFIRQNhrFNXFM%2FMrst4yLHF58eAjSRI5KdtzhGkYZK6etgIdhzPSERgRccIsW4kXedx7stGERNbfcp6Lxn9sUGYZCrxaPNz9ro0nLoLlFEsduEQOWQjNwP93BG9WG2XaA2BheNUYBh9XFBQ3AvoYO1QIjcCrNLxCzYJ8Ic11k3KEZBCc8wrbDJrwY6pwEoxct1eLrOz3kwuPWD%2BctesIlmPMpfMtqI%2FFjC0Mp5MKfwuggVlJY0ildYWPDryLBkXuIkj4M%2Bg8UHcRXroDYkHQ7PPprStil4w5FdBz3aYiu16ERSjgxZ1DwSzvEv%2FU5ti8rL0BgF5AeHrjDeVGz0BIgh7oZWTn4LQrX4azkffQBsc0%2FYtU2Hw%2Flf1LL9MKp3%2B64HEumd5y0nIOaK4TAS8%2FSHmIncxA%3D%3D&X-Amz-Signature=e6a74512be0f59d75f2bb7b8c1aa4852f722503d102be4163605a9e88ef7727b',
        },
        coordinationValues: {
            fileUid: 'kidney',
        },
    }).addFile({
        fileType: 'segmentation.glb',
        url: 'https://s3.us-east-1.amazonaws.com/hdv-spatial-data/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/decimated.glb?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIAR7TEYK5APDXAUCKF%2F20240314%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240314T015156Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEGIaCXVzLWVhc3QtMSJGMEQCIBr2bgZP306NQYmTQlOzuS9HHLHlUw%2BCX0G0%2BNAZiMg2AiA%2BdOtiQvMEiOyf5UsCFbjwbDYNUk13Whjo5h%2BfvzbywCqTAwhrEAEaDDEzNjU3NjUyMjA0OCIM4UIPZp1boNylV3jzKvACuBypqmlzxPjEmDtFP4YCZ00U5w%2FEe1%2FaoS1hsWfdvp%2Fw4M6bNmyzUU9%2B77myGhDAEILXvobR9rsrfFLrriKrp%2BE2IsKC%2Fh2tm62yJd0WWLuESwiIe67%2Bgktb4nzrI%2FSkYNC78U7DJMfIrywHvicC2jLKQSHYdTNm3HqjBvd6ISTsc8kn84FKC3WzFQmcVs%2FHDFR1QuuRsU%2FfM9clWb1UF9iAxw%2B65PiyIncxZC7wsVH6Po%2Fi%2FWMkjbFQdvCRYWXWMyMjh%2FlxYXS%2Fr0BMQ8Bu%2FUKw0nxCBgIAFT9m%2By6029t52%2BQ9QyY4Q99gzXkFIRQNhrFNXFM%2FMrst4yLHF58eAjSRI5KdtzhGkYZK6etgIdhzPSERgRccIsW4kXedx7stGERNbfcp6Lxn9sUGYZCrxaPNz9ro0nLoLlFEsduEQOWQjNwP93BG9WG2XaA2BheNUYBh9XFBQ3AvoYO1QIjcCrNLxCzYJ8Ic11k3KEZBCc8wrbDJrwY6pwEoxct1eLrOz3kwuPWD%2BctesIlmPMpfMtqI%2FFjC0Mp5MKfwuggVlJY0ildYWPDryLBkXuIkj4M%2Bg8UHcRXroDYkHQ7PPprStil4w5FdBz3aYiu16ERSjgxZ1DwSzvEv%2FU5ti8rL0BgF5AeHrjDeVGz0BIgh7oZWTn4LQrX4azkffQBsc0%2FYtU2Hw%2Flf1LL9MKp3%2B64HEumd5y0nIOaK4TAS8%2FSHmIncxA%3D%3D&X-Amz-Signature=dea6404d2461a4e8b3191827e8876a485707348d478b3608f83baf989e3fdfff',
        coordinationValues: {
            fileUid: 'gloms',
        }
    }).addFile({
        fileType: 'obsFeatureMatrix.csv',
        url: 'https://s3.us-east-1.amazonaws.com/hdv-spatial-data/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/statistics.csv?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIAR7TEYK5APDXAUCKF%2F20240314%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240314T015247Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEGIaCXVzLWVhc3QtMSJGMEQCIBr2bgZP306NQYmTQlOzuS9HHLHlUw%2BCX0G0%2BNAZiMg2AiA%2BdOtiQvMEiOyf5UsCFbjwbDYNUk13Whjo5h%2BfvzbywCqTAwhrEAEaDDEzNjU3NjUyMjA0OCIM4UIPZp1boNylV3jzKvACuBypqmlzxPjEmDtFP4YCZ00U5w%2FEe1%2FaoS1hsWfdvp%2Fw4M6bNmyzUU9%2B77myGhDAEILXvobR9rsrfFLrriKrp%2BE2IsKC%2Fh2tm62yJd0WWLuESwiIe67%2Bgktb4nzrI%2FSkYNC78U7DJMfIrywHvicC2jLKQSHYdTNm3HqjBvd6ISTsc8kn84FKC3WzFQmcVs%2FHDFR1QuuRsU%2FfM9clWb1UF9iAxw%2B65PiyIncxZC7wsVH6Po%2Fi%2FWMkjbFQdvCRYWXWMyMjh%2FlxYXS%2Fr0BMQ8Bu%2FUKw0nxCBgIAFT9m%2By6029t52%2BQ9QyY4Q99gzXkFIRQNhrFNXFM%2FMrst4yLHF58eAjSRI5KdtzhGkYZK6etgIdhzPSERgRccIsW4kXedx7stGERNbfcp6Lxn9sUGYZCrxaPNz9ro0nLoLlFEsduEQOWQjNwP93BG9WG2XaA2BheNUYBh9XFBQ3AvoYO1QIjcCrNLxCzYJ8Ic11k3KEZBCc8wrbDJrwY6pwEoxct1eLrOz3kwuPWD%2BctesIlmPMpfMtqI%2FFjC0Mp5MKfwuggVlJY0ildYWPDryLBkXuIkj4M%2Bg8UHcRXroDYkHQ7PPprStil4w5FdBz3aYiu16ERSjgxZ1DwSzvEv%2FU5ti8rL0BgF5AeHrjDeVGz0BIgh7oZWTn4LQrX4azkffQBsc0%2FYtU2Hw%2Flf1LL9MKp3%2B64HEumd5y0nIOaK4TAS8%2FSHmIncxA%3D%3D&X-Amz-Signature=8f99f7975b6cf9e8b78ef91999ca2619c08541a875f46229d8802bec00c0b856',
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
