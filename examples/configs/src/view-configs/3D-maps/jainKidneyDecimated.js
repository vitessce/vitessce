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
        url: 'https://s3.us-east-1.amazonaws.com/hdv-spatial-data/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/LS_20x_5_Stitched.pyramid.ome.tiff?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIAR7TEYK5AIPFJRSJZ%2F20240311%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240311T151619Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Security-Token=IQoJb3JpZ2luX2VjECgaCXVzLWVhc3QtMSJGMEQCICB6kKeTGXsf4rJ0m0I7g55lf3Y0BC%2FGsLHKvDjre0hJAiA2k7ZPnks5gjnqRWCw%2BlUYD5bcD82%2BOYDCJ09%2B1UaUKCqTAwgwEAEaDDEzNjU3NjUyMjA0OCIMPnNm%2B3sUKZAk6PCAKvAC2B5T93fGYk0z%2F8jFGOYmp6BQna3ZTfDimgasWzHII0HzGD7U5NczCRmfgj%2F1fi93nMAxtwCSh9EJ%2FLNtdlAbRki8o62%2FLDEyKMuTcBo6ugfTol9zglFrHcVC3y%2BBNRrI3fehnURytVvbhp3mer76XCCnzBEyCjKOgIDEEFh6DwkG81W7LXcspik9QE7vRu8LSx0CZaKhr2SuBSq8QvdrrdCsF1k0iv4D2PApawRol3OiM8H9IOW3BbKWp3A9ZIuPbfvwHu3zmvn72xo2guf%2BT%2BbBm0Qyw%2Btuv9fwRC0hIlvt%2BSbqhqGBdKSjRXCxKnLsb9ZCXhqZ%2FwR5MjmAXFA7QJ7%2FOHoxcvoHJ4HnzCoDrTGsIsrhEmZ5WJmtKURq1sxmU2QYUju6UEJke5dSNklobL2dwJ5Rn8G5CBtI0Gz1jEl9MlpCLsCkSnPXvI%2FwOI%2FGdBB9tAYTaBKsnIxhJ%2FhQ9fBb6Mee6Eiyp8v6LUDkwPcwkcC8rwY6pwFP4MWqhH5U8MUGIx%2Bh%2BXPbz3Lfx7zthlEw12t2LLABVc3BVWdP9mNbIiicAPlfwZUL0wdNsmjtAKztwlP8Ppxst49C26hoQW4HHJRgSnYMhP6if%2BSyLJw%2Fj0vzYejxUW3IKw2aoxRYNeiVOgxT8uIibXmz4gPj4DQqZUMVxNAUxr58L0F4umkp1sRiiGIf9sw7SA5ln1pdbWKe3jvZxH%2BEfCPOurbwkw%3D%3D&X-Amz-Signature=8d4a6d783b1e9eff63ec1c3321d9502b5d9228b97301afb0e321453b8405967e',
        options: {
            offsetsUrl: 'https://s3.us-east-1.amazonaws.com/hdv-spatial-data/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/LS_20x_5_Stitched.pyramid.offsets.json?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIAR7TEYK5AIPFJRSJZ%2F20240311%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240311T151601Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Security-Token=IQoJb3JpZ2luX2VjECgaCXVzLWVhc3QtMSJGMEQCICB6kKeTGXsf4rJ0m0I7g55lf3Y0BC%2FGsLHKvDjre0hJAiA2k7ZPnks5gjnqRWCw%2BlUYD5bcD82%2BOYDCJ09%2B1UaUKCqTAwgwEAEaDDEzNjU3NjUyMjA0OCIMPnNm%2B3sUKZAk6PCAKvAC2B5T93fGYk0z%2F8jFGOYmp6BQna3ZTfDimgasWzHII0HzGD7U5NczCRmfgj%2F1fi93nMAxtwCSh9EJ%2FLNtdlAbRki8o62%2FLDEyKMuTcBo6ugfTol9zglFrHcVC3y%2BBNRrI3fehnURytVvbhp3mer76XCCnzBEyCjKOgIDEEFh6DwkG81W7LXcspik9QE7vRu8LSx0CZaKhr2SuBSq8QvdrrdCsF1k0iv4D2PApawRol3OiM8H9IOW3BbKWp3A9ZIuPbfvwHu3zmvn72xo2guf%2BT%2BbBm0Qyw%2Btuv9fwRC0hIlvt%2BSbqhqGBdKSjRXCxKnLsb9ZCXhqZ%2FwR5MjmAXFA7QJ7%2FOHoxcvoHJ4HnzCoDrTGsIsrhEmZ5WJmtKURq1sxmU2QYUju6UEJke5dSNklobL2dwJ5Rn8G5CBtI0Gz1jEl9MlpCLsCkSnPXvI%2FwOI%2FGdBB9tAYTaBKsnIxhJ%2FhQ9fBb6Mee6Eiyp8v6LUDkwPcwkcC8rwY6pwFP4MWqhH5U8MUGIx%2Bh%2BXPbz3Lfx7zthlEw12t2LLABVc3BVWdP9mNbIiicAPlfwZUL0wdNsmjtAKztwlP8Ppxst49C26hoQW4HHJRgSnYMhP6if%2BSyLJw%2Fj0vzYejxUW3IKw2aoxRYNeiVOgxT8uIibXmz4gPj4DQqZUMVxNAUxr58L0F4umkp1sRiiGIf9sw7SA5ln1pdbWKe3jvZxH%2BEfCPOurbwkw%3D%3D&X-Amz-Signature=1fa6dd326d5979e61b39d34aa9f859e5d85dab0ee25f1d2aa697c9613af28a20',
        },
        coordinationValues: {
            fileUid: 'kidney',
        },
    }).addFile({
        fileType: 'segmentation.glb',
        url: 'https://s3.us-east-1.amazonaws.com/hdv-spatial-data/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/decimated.glb?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIAR7TEYK5AIPFJRSJZ%2F20240311%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240311T151538Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Security-Token=IQoJb3JpZ2luX2VjECgaCXVzLWVhc3QtMSJGMEQCICB6kKeTGXsf4rJ0m0I7g55lf3Y0BC%2FGsLHKvDjre0hJAiA2k7ZPnks5gjnqRWCw%2BlUYD5bcD82%2BOYDCJ09%2B1UaUKCqTAwgwEAEaDDEzNjU3NjUyMjA0OCIMPnNm%2B3sUKZAk6PCAKvAC2B5T93fGYk0z%2F8jFGOYmp6BQna3ZTfDimgasWzHII0HzGD7U5NczCRmfgj%2F1fi93nMAxtwCSh9EJ%2FLNtdlAbRki8o62%2FLDEyKMuTcBo6ugfTol9zglFrHcVC3y%2BBNRrI3fehnURytVvbhp3mer76XCCnzBEyCjKOgIDEEFh6DwkG81W7LXcspik9QE7vRu8LSx0CZaKhr2SuBSq8QvdrrdCsF1k0iv4D2PApawRol3OiM8H9IOW3BbKWp3A9ZIuPbfvwHu3zmvn72xo2guf%2BT%2BbBm0Qyw%2Btuv9fwRC0hIlvt%2BSbqhqGBdKSjRXCxKnLsb9ZCXhqZ%2FwR5MjmAXFA7QJ7%2FOHoxcvoHJ4HnzCoDrTGsIsrhEmZ5WJmtKURq1sxmU2QYUju6UEJke5dSNklobL2dwJ5Rn8G5CBtI0Gz1jEl9MlpCLsCkSnPXvI%2FwOI%2FGdBB9tAYTaBKsnIxhJ%2FhQ9fBb6Mee6Eiyp8v6LUDkwPcwkcC8rwY6pwFP4MWqhH5U8MUGIx%2Bh%2BXPbz3Lfx7zthlEw12t2LLABVc3BVWdP9mNbIiicAPlfwZUL0wdNsmjtAKztwlP8Ppxst49C26hoQW4HHJRgSnYMhP6if%2BSyLJw%2Fj0vzYejxUW3IKw2aoxRYNeiVOgxT8uIibXmz4gPj4DQqZUMVxNAUxr58L0F4umkp1sRiiGIf9sw7SA5ln1pdbWKe3jvZxH%2BEfCPOurbwkw%3D%3D&X-Amz-Signature=cf5b37637f2b85af3f4c459a4a16aec170e5eb2908490bde5cc7990604bc6c5a',
        coordinationValues: {
            fileUid: 'gloms',
        }
    }).addFile({
        fileType: 'obsFeatureMatrix.csv',
        url: 'https://s3.us-east-1.amazonaws.com/hdv-spatial-data/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/statistics.csv?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIAR7TEYK5AIPFJRSJZ%2F20240311%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240311T151634Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Security-Token=IQoJb3JpZ2luX2VjECgaCXVzLWVhc3QtMSJGMEQCICB6kKeTGXsf4rJ0m0I7g55lf3Y0BC%2FGsLHKvDjre0hJAiA2k7ZPnks5gjnqRWCw%2BlUYD5bcD82%2BOYDCJ09%2B1UaUKCqTAwgwEAEaDDEzNjU3NjUyMjA0OCIMPnNm%2B3sUKZAk6PCAKvAC2B5T93fGYk0z%2F8jFGOYmp6BQna3ZTfDimgasWzHII0HzGD7U5NczCRmfgj%2F1fi93nMAxtwCSh9EJ%2FLNtdlAbRki8o62%2FLDEyKMuTcBo6ugfTol9zglFrHcVC3y%2BBNRrI3fehnURytVvbhp3mer76XCCnzBEyCjKOgIDEEFh6DwkG81W7LXcspik9QE7vRu8LSx0CZaKhr2SuBSq8QvdrrdCsF1k0iv4D2PApawRol3OiM8H9IOW3BbKWp3A9ZIuPbfvwHu3zmvn72xo2guf%2BT%2BbBm0Qyw%2Btuv9fwRC0hIlvt%2BSbqhqGBdKSjRXCxKnLsb9ZCXhqZ%2FwR5MjmAXFA7QJ7%2FOHoxcvoHJ4HnzCoDrTGsIsrhEmZ5WJmtKURq1sxmU2QYUju6UEJke5dSNklobL2dwJ5Rn8G5CBtI0Gz1jEl9MlpCLsCkSnPXvI%2FwOI%2FGdBB9tAYTaBKsnIxhJ%2FhQ9fBb6Mee6Eiyp8v6LUDkwPcwkcC8rwY6pwFP4MWqhH5U8MUGIx%2Bh%2BXPbz3Lfx7zthlEw12t2LLABVc3BVWdP9mNbIiicAPlfwZUL0wdNsmjtAKztwlP8Ppxst49C26hoQW4HHJRgSnYMhP6if%2BSyLJw%2Fj0vzYejxUW3IKw2aoxRYNeiVOgxT8uIibXmz4gPj4DQqZUMVxNAUxr58L0F4umkp1sRiiGIf9sw7SA5ln1pdbWKe3jvZxH%2BEfCPOurbwkw%3D%3D&X-Amz-Signature=50470beb12cce4bb8a40bf7b3cd33acf095207ab1a8b415210fab6ac9c8c52ac',
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
    config.layout(hconcat(spatialThreeView, vconcat(lcView,obsSetsView, barPlot)));

    const configJSON = config.toJSON();
    return configJSON;
}

export const jainkidneyDecimated = generateJainKidneyDecimatedConfig();
