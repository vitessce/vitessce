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
        url: 'https://s3.us-east-1.amazonaws.com/hdv-spatial-data/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/LS_20x_5_Stitched.pyramid.ome.tiff?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIAR7TEYK5AKMEEVDHP%2F20240313%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240313T014622Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEEoaCXVzLWVhc3QtMSJHMEUCIC8yxerWNAwb0ufVtshol%2FtdsWf1pt2veTIcvvhbuUPdAiEAq4FVk5pe%2Fp53VbdHMWKbtcdtwKk%2Fh710JKDjHXx37z0qkwMIUxABGgwxMzY1NzY1MjIwNDgiDPIJ1en%2FVdB3hW99VSrwAiw8zswC1xMLzXH7645z8fkSwpXZKI2E1g%2FFktk6DD21tfHFAzF472A%2FFPX24DgN08PtJcCaZrgT8Fxlz6K3wvzeC9qiFAidBG5XUvBCHGmh559TeavIqmlTlYMiSiQVwMG%2Fo8X%2BADgmSN2nWGRszKvXHnvJykHePl8mPIkAz6QAfboZ1DgoVkGlskQI4OuVWzrUPPeQCwYLqqRCJZNvp%2FQodH%2F2nQWPy610P1leZ0Ize91ZnzAkIsW20hLsCCO697rHNWcoO8f%2BmM44cLmKNabGqG9yqI%2F71Z2%2B4shT993sLrdivxQN5pBL%2BesnDCoFLjb6DMUF59nVqygs%2FHocW7%2FkE9Jn%2FvTZ1l4iciTs020lvjMQRoK9s1NggwkABu3gM7nASMCjD7inm14%2Bq7iQEZedZpd2vk2KCPQzKplEGfkJtXq%2FR823ie7yP5RNO5dzpFWO3lq0hdH6bmvzaW4emRfu0%2FJ4aHHRkh64s57si16fMOKKxK8GOqYByRFachExbLUzybK%2F%2BNohBE3eYgdbVTAoip9SLyAaq5Y6eQdnrYyBLVjcu0sfSuTMk1uWMFhVMDvc3OZ%2Bvvh14NytK9LCsbiXonRb5BLRSMAnQ8vmK6DWPxEA1cwtYuMz4BB02UUIpMmiiowabHeay%2FDs9SiGcHPIFddHf1iWedz5ZSW8OPFl%2FPkSgvqGVVubiEqveovR6lGVp5olBwszMVHEYhb%2BMg%3D%3D&X-Amz-Signature=ec44525599bb9496556dfd6d0ab6e6d63054dc3dccad71cca7952b0711d78067',
        options: {
            offsetsUrl: 'https://s3.us-east-1.amazonaws.com/hdv-spatial-data/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/LS_20x_5_Stitched.pyramid.offsets.json?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIAR7TEYK5AKMEEVDHP%2F20240313%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240313T014651Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEEoaCXVzLWVhc3QtMSJHMEUCIC8yxerWNAwb0ufVtshol%2FtdsWf1pt2veTIcvvhbuUPdAiEAq4FVk5pe%2Fp53VbdHMWKbtcdtwKk%2Fh710JKDjHXx37z0qkwMIUxABGgwxMzY1NzY1MjIwNDgiDPIJ1en%2FVdB3hW99VSrwAiw8zswC1xMLzXH7645z8fkSwpXZKI2E1g%2FFktk6DD21tfHFAzF472A%2FFPX24DgN08PtJcCaZrgT8Fxlz6K3wvzeC9qiFAidBG5XUvBCHGmh559TeavIqmlTlYMiSiQVwMG%2Fo8X%2BADgmSN2nWGRszKvXHnvJykHePl8mPIkAz6QAfboZ1DgoVkGlskQI4OuVWzrUPPeQCwYLqqRCJZNvp%2FQodH%2F2nQWPy610P1leZ0Ize91ZnzAkIsW20hLsCCO697rHNWcoO8f%2BmM44cLmKNabGqG9yqI%2F71Z2%2B4shT993sLrdivxQN5pBL%2BesnDCoFLjb6DMUF59nVqygs%2FHocW7%2FkE9Jn%2FvTZ1l4iciTs020lvjMQRoK9s1NggwkABu3gM7nASMCjD7inm14%2Bq7iQEZedZpd2vk2KCPQzKplEGfkJtXq%2FR823ie7yP5RNO5dzpFWO3lq0hdH6bmvzaW4emRfu0%2FJ4aHHRkh64s57si16fMOKKxK8GOqYByRFachExbLUzybK%2F%2BNohBE3eYgdbVTAoip9SLyAaq5Y6eQdnrYyBLVjcu0sfSuTMk1uWMFhVMDvc3OZ%2Bvvh14NytK9LCsbiXonRb5BLRSMAnQ8vmK6DWPxEA1cwtYuMz4BB02UUIpMmiiowabHeay%2FDs9SiGcHPIFddHf1iWedz5ZSW8OPFl%2FPkSgvqGVVubiEqveovR6lGVp5olBwszMVHEYhb%2BMg%3D%3D&X-Amz-Signature=4f509d7d0db84cd475b79037f9f9e8236fb9826618a5866818d3b3d24d21fdff',
        },
        coordinationValues: {
            fileUid: 'kidney',
        },
    }).addFile({
        fileType: 'segmentation.glb',
        url: 'https://s3.us-east-1.amazonaws.com/hdv-spatial-data/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/decimated.glb?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIAR7TEYK5AKMEEVDHP%2F20240313%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240313T014712Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEEoaCXVzLWVhc3QtMSJHMEUCIC8yxerWNAwb0ufVtshol%2FtdsWf1pt2veTIcvvhbuUPdAiEAq4FVk5pe%2Fp53VbdHMWKbtcdtwKk%2Fh710JKDjHXx37z0qkwMIUxABGgwxMzY1NzY1MjIwNDgiDPIJ1en%2FVdB3hW99VSrwAiw8zswC1xMLzXH7645z8fkSwpXZKI2E1g%2FFktk6DD21tfHFAzF472A%2FFPX24DgN08PtJcCaZrgT8Fxlz6K3wvzeC9qiFAidBG5XUvBCHGmh559TeavIqmlTlYMiSiQVwMG%2Fo8X%2BADgmSN2nWGRszKvXHnvJykHePl8mPIkAz6QAfboZ1DgoVkGlskQI4OuVWzrUPPeQCwYLqqRCJZNvp%2FQodH%2F2nQWPy610P1leZ0Ize91ZnzAkIsW20hLsCCO697rHNWcoO8f%2BmM44cLmKNabGqG9yqI%2F71Z2%2B4shT993sLrdivxQN5pBL%2BesnDCoFLjb6DMUF59nVqygs%2FHocW7%2FkE9Jn%2FvTZ1l4iciTs020lvjMQRoK9s1NggwkABu3gM7nASMCjD7inm14%2Bq7iQEZedZpd2vk2KCPQzKplEGfkJtXq%2FR823ie7yP5RNO5dzpFWO3lq0hdH6bmvzaW4emRfu0%2FJ4aHHRkh64s57si16fMOKKxK8GOqYByRFachExbLUzybK%2F%2BNohBE3eYgdbVTAoip9SLyAaq5Y6eQdnrYyBLVjcu0sfSuTMk1uWMFhVMDvc3OZ%2Bvvh14NytK9LCsbiXonRb5BLRSMAnQ8vmK6DWPxEA1cwtYuMz4BB02UUIpMmiiowabHeay%2FDs9SiGcHPIFddHf1iWedz5ZSW8OPFl%2FPkSgvqGVVubiEqveovR6lGVp5olBwszMVHEYhb%2BMg%3D%3D&X-Amz-Signature=d8b32a1c9cdeb9963a1dbc31c68e37d818370bdf6260339467ccaf32aad5216c',
        coordinationValues: {
            fileUid: 'gloms',
        }
    }).addFile({
        fileType: 'obsFeatureMatrix.csv',
        url: 'https://s3.us-east-1.amazonaws.com/hdv-spatial-data/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/statistics.csv?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIAR7TEYK5AKMEEVDHP%2F20240313%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240313T014634Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEEoaCXVzLWVhc3QtMSJHMEUCIC8yxerWNAwb0ufVtshol%2FtdsWf1pt2veTIcvvhbuUPdAiEAq4FVk5pe%2Fp53VbdHMWKbtcdtwKk%2Fh710JKDjHXx37z0qkwMIUxABGgwxMzY1NzY1MjIwNDgiDPIJ1en%2FVdB3hW99VSrwAiw8zswC1xMLzXH7645z8fkSwpXZKI2E1g%2FFktk6DD21tfHFAzF472A%2FFPX24DgN08PtJcCaZrgT8Fxlz6K3wvzeC9qiFAidBG5XUvBCHGmh559TeavIqmlTlYMiSiQVwMG%2Fo8X%2BADgmSN2nWGRszKvXHnvJykHePl8mPIkAz6QAfboZ1DgoVkGlskQI4OuVWzrUPPeQCwYLqqRCJZNvp%2FQodH%2F2nQWPy610P1leZ0Ize91ZnzAkIsW20hLsCCO697rHNWcoO8f%2BmM44cLmKNabGqG9yqI%2F71Z2%2B4shT993sLrdivxQN5pBL%2BesnDCoFLjb6DMUF59nVqygs%2FHocW7%2FkE9Jn%2FvTZ1l4iciTs020lvjMQRoK9s1NggwkABu3gM7nASMCjD7inm14%2Bq7iQEZedZpd2vk2KCPQzKplEGfkJtXq%2FR823ie7yP5RNO5dzpFWO3lq0hdH6bmvzaW4emRfu0%2FJ4aHHRkh64s57si16fMOKKxK8GOqYByRFachExbLUzybK%2F%2BNohBE3eYgdbVTAoip9SLyAaq5Y6eQdnrYyBLVjcu0sfSuTMk1uWMFhVMDvc3OZ%2Bvvh14NytK9LCsbiXonRb5BLRSMAnQ8vmK6DWPxEA1cwtYuMz4BB02UUIpMmiiowabHeay%2FDs9SiGcHPIFddHf1iWedz5ZSW8OPFl%2FPkSgvqGVVubiEqveovR6lGVp5olBwszMVHEYhb%2BMg%3D%3D&X-Amz-Signature=ff4e52c34a701992670d41b1ea5094cae3c6fa6dc80d34108da7e169b159f188',
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
