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
        url: 'https://s3.us-east-1.amazonaws.com/hdv-spatial-data/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/LS_20x_5_Stitched.pyramid.ome.tiff?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIAR7TEYK5ANQLDP6FF%2F20240310%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240310T214749Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEBYaCXVzLWVhc3QtMSJGMEQCIBmlHh9ZPxwnZSyZGK2b4Jp%2FZJ8oJ1D%2Fi0BVq99COY%2FIAiBam7%2FMfx6vXPpwMAeBMCpXuKNKZWNCL5m3eO26BqWv9CqTAwgfEAEaDDEzNjU3NjUyMjA0OCIMnm%2FvPKsFQi6gbOzBKvAClgOCas8%2BnAPx9H4Aui3grzZoC6ixBqUgCHjZygXsywtPYvIluvWGFkew%2Boz317VTkEnd1X%2FVAY1cCWbws8dlIygZ4sIhAcp8eh6rwg1%2FI74G0GTtEXSpJBP2YwpdNSvB8ryPkxdmb%2F%2F83vIfII6%2FVwwYLJBkZBI4%2BuiBJ5nEFv3lJ8SiUGvb%2BAsCOKwXmUPanZzDANr99cu59due85ror0RPcSvvJ83itYQbs7cxShCfM3x5RwlpClzBRATMNkFZsgF6hdKcVNImn4kmH8eRf4Bz3nUhvOmupLjLwxdmq7LPCuHEVN3oaGd4HBbm95mWjLJRMez0JPlUbz6TqoA%2BA18qRF%2B3UauUzePchCxrSohAtk9N7OMUZxb%2BJMRdIF8rNOho%2FCf1uKS72vqcya1FW0ZxV9SsNPZyjj5SuZ7W5VppWRODrZAeCAhYnEnAZFoOhUtR%2ByHNIh%2Bk3k6FL8w%2FT67oo10WXJjGF1%2FVGCNnOTgwsNS4rwY6pwHIO7XMzMMiQzpgNqDFZ8NgYuPKx8aO13gHA77tu7K8%2FIB7Bd27%2FSjdP42TVPosP4H2R5ePF6cL1X1baLVFQP6Wt%2F%2BKBCUJ9cLqSlEIt6t4zNi4A5PSBJLCn%2BSe2ohAKobtrAWDHlbPlcmjETT9SmjWJiK35dMZRpyQkh9A7QnoLITrjU5C%2BqVJKmgqVPm1dFA1bdLNo9w4%2BlM8eU31dfgRn7giuLahQQ%3D%3D&X-Amz-Signature=d64d6786aaabd8576ca8e8ae837add452fac7c20a49496e25c377e2d0129515b',
        options: {
            offsetsUrl: 'https://s3.us-east-1.amazonaws.com/hdv-spatial-data/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/LS_20x_5_Stitched.pyramid.offsets.json?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIAR7TEYK5ANQLDP6FF%2F20240310%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240310T214728Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEBYaCXVzLWVhc3QtMSJGMEQCIBmlHh9ZPxwnZSyZGK2b4Jp%2FZJ8oJ1D%2Fi0BVq99COY%2FIAiBam7%2FMfx6vXPpwMAeBMCpXuKNKZWNCL5m3eO26BqWv9CqTAwgfEAEaDDEzNjU3NjUyMjA0OCIMnm%2FvPKsFQi6gbOzBKvAClgOCas8%2BnAPx9H4Aui3grzZoC6ixBqUgCHjZygXsywtPYvIluvWGFkew%2Boz317VTkEnd1X%2FVAY1cCWbws8dlIygZ4sIhAcp8eh6rwg1%2FI74G0GTtEXSpJBP2YwpdNSvB8ryPkxdmb%2F%2F83vIfII6%2FVwwYLJBkZBI4%2BuiBJ5nEFv3lJ8SiUGvb%2BAsCOKwXmUPanZzDANr99cu59due85ror0RPcSvvJ83itYQbs7cxShCfM3x5RwlpClzBRATMNkFZsgF6hdKcVNImn4kmH8eRf4Bz3nUhvOmupLjLwxdmq7LPCuHEVN3oaGd4HBbm95mWjLJRMez0JPlUbz6TqoA%2BA18qRF%2B3UauUzePchCxrSohAtk9N7OMUZxb%2BJMRdIF8rNOho%2FCf1uKS72vqcya1FW0ZxV9SsNPZyjj5SuZ7W5VppWRODrZAeCAhYnEnAZFoOhUtR%2ByHNIh%2Bk3k6FL8w%2FT67oo10WXJjGF1%2FVGCNnOTgwsNS4rwY6pwHIO7XMzMMiQzpgNqDFZ8NgYuPKx8aO13gHA77tu7K8%2FIB7Bd27%2FSjdP42TVPosP4H2R5ePF6cL1X1baLVFQP6Wt%2F%2BKBCUJ9cLqSlEIt6t4zNi4A5PSBJLCn%2BSe2ohAKobtrAWDHlbPlcmjETT9SmjWJiK35dMZRpyQkh9A7QnoLITrjU5C%2BqVJKmgqVPm1dFA1bdLNo9w4%2BlM8eU31dfgRn7giuLahQQ%3D%3D&X-Amz-Signature=ec8d90bd324b9f84567cbb7fe9dd550ef41116e26c3ecc4d2bfc6ea35eb91e4b\n',
        },
        coordinationValues: {
            fileUid: 'kidney',
        },
    }).addFile({
        fileType: 'segmentation.glb',
        url: 'https://s3.us-east-1.amazonaws.com/hdv-spatial-data/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/decimated.glb?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIAR7TEYK5ANQLDP6FF%2F20240310%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240310T214645Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEBYaCXVzLWVhc3QtMSJGMEQCIBmlHh9ZPxwnZSyZGK2b4Jp%2FZJ8oJ1D%2Fi0BVq99COY%2FIAiBam7%2FMfx6vXPpwMAeBMCpXuKNKZWNCL5m3eO26BqWv9CqTAwgfEAEaDDEzNjU3NjUyMjA0OCIMnm%2FvPKsFQi6gbOzBKvAClgOCas8%2BnAPx9H4Aui3grzZoC6ixBqUgCHjZygXsywtPYvIluvWGFkew%2Boz317VTkEnd1X%2FVAY1cCWbws8dlIygZ4sIhAcp8eh6rwg1%2FI74G0GTtEXSpJBP2YwpdNSvB8ryPkxdmb%2F%2F83vIfII6%2FVwwYLJBkZBI4%2BuiBJ5nEFv3lJ8SiUGvb%2BAsCOKwXmUPanZzDANr99cu59due85ror0RPcSvvJ83itYQbs7cxShCfM3x5RwlpClzBRATMNkFZsgF6hdKcVNImn4kmH8eRf4Bz3nUhvOmupLjLwxdmq7LPCuHEVN3oaGd4HBbm95mWjLJRMez0JPlUbz6TqoA%2BA18qRF%2B3UauUzePchCxrSohAtk9N7OMUZxb%2BJMRdIF8rNOho%2FCf1uKS72vqcya1FW0ZxV9SsNPZyjj5SuZ7W5VppWRODrZAeCAhYnEnAZFoOhUtR%2ByHNIh%2Bk3k6FL8w%2FT67oo10WXJjGF1%2FVGCNnOTgwsNS4rwY6pwHIO7XMzMMiQzpgNqDFZ8NgYuPKx8aO13gHA77tu7K8%2FIB7Bd27%2FSjdP42TVPosP4H2R5ePF6cL1X1baLVFQP6Wt%2F%2BKBCUJ9cLqSlEIt6t4zNi4A5PSBJLCn%2BSe2ohAKobtrAWDHlbPlcmjETT9SmjWJiK35dMZRpyQkh9A7QnoLITrjU5C%2BqVJKmgqVPm1dFA1bdLNo9w4%2BlM8eU31dfgRn7giuLahQQ%3D%3D&X-Amz-Signature=f5dd92b63ef9e686ee4bc81f10ab4b73a81af0eeffc841964a264495d76f643d',
        coordinationValues: {
            fileUid: 'gloms',
        }
    }).addFile({
        fileType: 'obsFeatureMatrix.csv',
        url: 'https://s3.us-east-1.amazonaws.com/hdv-spatial-data/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/statistics.csv?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIAR7TEYK5ANQLDP6FF%2F20240310%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240310T214816Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEBYaCXVzLWVhc3QtMSJGMEQCIBmlHh9ZPxwnZSyZGK2b4Jp%2FZJ8oJ1D%2Fi0BVq99COY%2FIAiBam7%2FMfx6vXPpwMAeBMCpXuKNKZWNCL5m3eO26BqWv9CqTAwgfEAEaDDEzNjU3NjUyMjA0OCIMnm%2FvPKsFQi6gbOzBKvAClgOCas8%2BnAPx9H4Aui3grzZoC6ixBqUgCHjZygXsywtPYvIluvWGFkew%2Boz317VTkEnd1X%2FVAY1cCWbws8dlIygZ4sIhAcp8eh6rwg1%2FI74G0GTtEXSpJBP2YwpdNSvB8ryPkxdmb%2F%2F83vIfII6%2FVwwYLJBkZBI4%2BuiBJ5nEFv3lJ8SiUGvb%2BAsCOKwXmUPanZzDANr99cu59due85ror0RPcSvvJ83itYQbs7cxShCfM3x5RwlpClzBRATMNkFZsgF6hdKcVNImn4kmH8eRf4Bz3nUhvOmupLjLwxdmq7LPCuHEVN3oaGd4HBbm95mWjLJRMez0JPlUbz6TqoA%2BA18qRF%2B3UauUzePchCxrSohAtk9N7OMUZxb%2BJMRdIF8rNOho%2FCf1uKS72vqcya1FW0ZxV9SsNPZyjj5SuZ7W5VppWRODrZAeCAhYnEnAZFoOhUtR%2ByHNIh%2Bk3k6FL8w%2FT67oo10WXJjGF1%2FVGCNnOTgwsNS4rwY6pwHIO7XMzMMiQzpgNqDFZ8NgYuPKx8aO13gHA77tu7K8%2FIB7Bd27%2FSjdP42TVPosP4H2R5ePF6cL1X1baLVFQP6Wt%2F%2BKBCUJ9cLqSlEIt6t4zNi4A5PSBJLCn%2BSe2ohAKobtrAWDHlbPlcmjETT9SmjWJiK35dMZRpyQkh9A7QnoLITrjU5C%2BqVJKmgqVPm1dFA1bdLNo9w4%2BlM8eU31dfgRn7giuLahQQ%3D%3D&X-Amz-Signature=5026e915878265cda3602a88c2973f11ad689f8bfb79b0d35697a32fa9b5d391',
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
