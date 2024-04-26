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
        url: 'https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/LS_20x_5_Stitched.pyramid.ome.tiff?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEPr%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQCikTLaf2BTJ1pF3VkTCRwwWIieHeYFgpUOqXRDGlsEOwIgYeMIDdohqE6zv38gHPvabZmI3Y12h2eu%2FYB3joSbTtcq7AMIMhABGgwxMzY1NzY1MjIwNDgiDHR0pkqKEQfGaw1N2CrJA3fF1PwrFD7ODkskkF5s5o3ZgXp89pxTKof3PXiKPC%2Fp0oAOkH2N5oMM3n3UIe8lIH%2BDPOAVn%2BRulQFB1D02wSlwYBoFtw7g1aewqgsW2kS%2FcfybfqlWZVjlEjiGFM7LWJSqyiiWUe2Xo3ypowDpdmvUhwlIKB7C3ml68MMmykfhxp7b3rf6TBdzWZRHdkv6oW%2F556NPiRElFwufC7%2FoMa1YAKeTdAqWrUa15KG3zrtULV4DrqoO1W3TAIxZDiFml31GowbsgefBUpHPz8ZzE7Z7BdjxJModidD5y8g9yno4flG%2Bi%2B2zE1q%2FSbbvz%2Flh3yZt%2B%2FzSujeZqdufTEyuVKSHi0DmrTEAezuYWrH%2BSRlAZkHGGi1sGpQfq7nG5nSXP8GRqfh3FrpnUH3peyx1URN2TDEOgaRX7NdHHobOULY6HpPaukkv0tzMisv51iKXOg8zgx9gGqftxdhWubMVrTFQVe3tYQfJXJtHbO1Qzhj79ICXBFpe5KOYUFRhwhAI71%2B7llCryVbDkgeTz6ERP9hrDgCt0Hykx%2BQpHFbyShcRUEZGg9uzKJSObs98mno0B5PZLV7LzXDHBGvJMwmAfaxgGX6X9e2rLkww5Y%2FbsAY6lAI4bfroU4yq5wRkDT%2B10XK8nd2AogFBkhFc%2Fz3bxb7y2tt%2FZugPxT3Or2faEjYuGfBBNbQvaMvpy4Hn0Jp7Iec18vywZ33hx%2FHz%2BCzoKlKxQ5Xu%2BadohpsPK6Pxd3lcT%2B4ygm3gldOcYbI9Dlkm%2BeZfjGxXAhPGfgSzD6XkU8ewumLqf5p%2BvM7vgA4f%2BZ5ddwSjTwLtAuXopTg8B%2BZS285QRZ9J0%2FAOp85oTgjhxShKGmaeTMS5r%2BN54%2F2HMRDqMCbnRLuF8E2aIZiTMpuUjGhy8dkJK8qlbIoz6z5d4q8MWSqOCn8rhl3Xt28zLHh4A0QA2CKo6ifWySXuzhAftVUhkC2icgry8h0fxp0ohpw2MXf25c0%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240410T171038Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5ANI4FRZ6V%2F20240410%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=a9c58e5bc7e9f6ab604b643c44746a67d925527fb94248912c4578869b3b9626',
        options: {
            offsetsUrl: 'https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/LS_20x_5_Stitched.pyramid.offsets.json?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEPr%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQCikTLaf2BTJ1pF3VkTCRwwWIieHeYFgpUOqXRDGlsEOwIgYeMIDdohqE6zv38gHPvabZmI3Y12h2eu%2FYB3joSbTtcq7AMIMhABGgwxMzY1NzY1MjIwNDgiDHR0pkqKEQfGaw1N2CrJA3fF1PwrFD7ODkskkF5s5o3ZgXp89pxTKof3PXiKPC%2Fp0oAOkH2N5oMM3n3UIe8lIH%2BDPOAVn%2BRulQFB1D02wSlwYBoFtw7g1aewqgsW2kS%2FcfybfqlWZVjlEjiGFM7LWJSqyiiWUe2Xo3ypowDpdmvUhwlIKB7C3ml68MMmykfhxp7b3rf6TBdzWZRHdkv6oW%2F556NPiRElFwufC7%2FoMa1YAKeTdAqWrUa15KG3zrtULV4DrqoO1W3TAIxZDiFml31GowbsgefBUpHPz8ZzE7Z7BdjxJModidD5y8g9yno4flG%2Bi%2B2zE1q%2FSbbvz%2Flh3yZt%2B%2FzSujeZqdufTEyuVKSHi0DmrTEAezuYWrH%2BSRlAZkHGGi1sGpQfq7nG5nSXP8GRqfh3FrpnUH3peyx1URN2TDEOgaRX7NdHHobOULY6HpPaukkv0tzMisv51iKXOg8zgx9gGqftxdhWubMVrTFQVe3tYQfJXJtHbO1Qzhj79ICXBFpe5KOYUFRhwhAI71%2B7llCryVbDkgeTz6ERP9hrDgCt0Hykx%2BQpHFbyShcRUEZGg9uzKJSObs98mno0B5PZLV7LzXDHBGvJMwmAfaxgGX6X9e2rLkww5Y%2FbsAY6lAI4bfroU4yq5wRkDT%2B10XK8nd2AogFBkhFc%2Fz3bxb7y2tt%2FZugPxT3Or2faEjYuGfBBNbQvaMvpy4Hn0Jp7Iec18vywZ33hx%2FHz%2BCzoKlKxQ5Xu%2BadohpsPK6Pxd3lcT%2B4ygm3gldOcYbI9Dlkm%2BeZfjGxXAhPGfgSzD6XkU8ewumLqf5p%2BvM7vgA4f%2BZ5ddwSjTwLtAuXopTg8B%2BZS285QRZ9J0%2FAOp85oTgjhxShKGmaeTMS5r%2BN54%2F2HMRDqMCbnRLuF8E2aIZiTMpuUjGhy8dkJK8qlbIoz6z5d4q8MWSqOCn8rhl3Xt28zLHh4A0QA2CKo6ifWySXuzhAftVUhkC2icgry8h0fxp0ohpw2MXf25c0%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240410T171050Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5ANI4FRZ6V%2F20240410%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=0c97b46dcb92180368a55b4dabc7be343005cb4661b907ee9006415e5c280297',
        },
        coordinationValues: {
            fileUid: 'kidney',
        },
    }).addFile({
        fileType: 'segmentation.glb',
        url: 'https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/decimated.glb?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEPr%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQCikTLaf2BTJ1pF3VkTCRwwWIieHeYFgpUOqXRDGlsEOwIgYeMIDdohqE6zv38gHPvabZmI3Y12h2eu%2FYB3joSbTtcq7AMIMhABGgwxMzY1NzY1MjIwNDgiDHR0pkqKEQfGaw1N2CrJA3fF1PwrFD7ODkskkF5s5o3ZgXp89pxTKof3PXiKPC%2Fp0oAOkH2N5oMM3n3UIe8lIH%2BDPOAVn%2BRulQFB1D02wSlwYBoFtw7g1aewqgsW2kS%2FcfybfqlWZVjlEjiGFM7LWJSqyiiWUe2Xo3ypowDpdmvUhwlIKB7C3ml68MMmykfhxp7b3rf6TBdzWZRHdkv6oW%2F556NPiRElFwufC7%2FoMa1YAKeTdAqWrUa15KG3zrtULV4DrqoO1W3TAIxZDiFml31GowbsgefBUpHPz8ZzE7Z7BdjxJModidD5y8g9yno4flG%2Bi%2B2zE1q%2FSbbvz%2Flh3yZt%2B%2FzSujeZqdufTEyuVKSHi0DmrTEAezuYWrH%2BSRlAZkHGGi1sGpQfq7nG5nSXP8GRqfh3FrpnUH3peyx1URN2TDEOgaRX7NdHHobOULY6HpPaukkv0tzMisv51iKXOg8zgx9gGqftxdhWubMVrTFQVe3tYQfJXJtHbO1Qzhj79ICXBFpe5KOYUFRhwhAI71%2B7llCryVbDkgeTz6ERP9hrDgCt0Hykx%2BQpHFbyShcRUEZGg9uzKJSObs98mno0B5PZLV7LzXDHBGvJMwmAfaxgGX6X9e2rLkww5Y%2FbsAY6lAI4bfroU4yq5wRkDT%2B10XK8nd2AogFBkhFc%2Fz3bxb7y2tt%2FZugPxT3Or2faEjYuGfBBNbQvaMvpy4Hn0Jp7Iec18vywZ33hx%2FHz%2BCzoKlKxQ5Xu%2BadohpsPK6Pxd3lcT%2B4ygm3gldOcYbI9Dlkm%2BeZfjGxXAhPGfgSzD6XkU8ewumLqf5p%2BvM7vgA4f%2BZ5ddwSjTwLtAuXopTg8B%2BZS285QRZ9J0%2FAOp85oTgjhxShKGmaeTMS5r%2BN54%2F2HMRDqMCbnRLuF8E2aIZiTMpuUjGhy8dkJK8qlbIoz6z5d4q8MWSqOCn8rhl3Xt28zLHh4A0QA2CKo6ifWySXuzhAftVUhkC2icgry8h0fxp0ohpw2MXf25c0%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240410T171102Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5ANI4FRZ6V%2F20240410%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=58f3a63f5108e2b8ca8b80ea397c693436805917aff2584ff61e2c7f1c5d5339',
        coordinationValues: {
            fileUid: 'gloms',
        }
    }).addFile({
        fileType: 'obsFeatureMatrix.csv',
        url: 'https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/statistics.csv?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEPr%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQCikTLaf2BTJ1pF3VkTCRwwWIieHeYFgpUOqXRDGlsEOwIgYeMIDdohqE6zv38gHPvabZmI3Y12h2eu%2FYB3joSbTtcq7AMIMhABGgwxMzY1NzY1MjIwNDgiDHR0pkqKEQfGaw1N2CrJA3fF1PwrFD7ODkskkF5s5o3ZgXp89pxTKof3PXiKPC%2Fp0oAOkH2N5oMM3n3UIe8lIH%2BDPOAVn%2BRulQFB1D02wSlwYBoFtw7g1aewqgsW2kS%2FcfybfqlWZVjlEjiGFM7LWJSqyiiWUe2Xo3ypowDpdmvUhwlIKB7C3ml68MMmykfhxp7b3rf6TBdzWZRHdkv6oW%2F556NPiRElFwufC7%2FoMa1YAKeTdAqWrUa15KG3zrtULV4DrqoO1W3TAIxZDiFml31GowbsgefBUpHPz8ZzE7Z7BdjxJModidD5y8g9yno4flG%2Bi%2B2zE1q%2FSbbvz%2Flh3yZt%2B%2FzSujeZqdufTEyuVKSHi0DmrTEAezuYWrH%2BSRlAZkHGGi1sGpQfq7nG5nSXP8GRqfh3FrpnUH3peyx1URN2TDEOgaRX7NdHHobOULY6HpPaukkv0tzMisv51iKXOg8zgx9gGqftxdhWubMVrTFQVe3tYQfJXJtHbO1Qzhj79ICXBFpe5KOYUFRhwhAI71%2B7llCryVbDkgeTz6ERP9hrDgCt0Hykx%2BQpHFbyShcRUEZGg9uzKJSObs98mno0B5PZLV7LzXDHBGvJMwmAfaxgGX6X9e2rLkww5Y%2FbsAY6lAI4bfroU4yq5wRkDT%2B10XK8nd2AogFBkhFc%2Fz3bxb7y2tt%2FZugPxT3Or2faEjYuGfBBNbQvaMvpy4Hn0Jp7Iec18vywZ33hx%2FHz%2BCzoKlKxQ5Xu%2BadohpsPK6Pxd3lcT%2B4ygm3gldOcYbI9Dlkm%2BeZfjGxXAhPGfgSzD6XkU8ewumLqf5p%2BvM7vgA4f%2BZ5ddwSjTwLtAuXopTg8B%2BZS285QRZ9J0%2FAOp85oTgjhxShKGmaeTMS5r%2BN54%2F2HMRDqMCbnRLuF8E2aIZiTMpuUjGhy8dkJK8qlbIoz6z5d4q8MWSqOCn8rhl3Xt28zLHh4A0QA2CKo6ifWySXuzhAftVUhkC2icgry8h0fxp0ohpw2MXf25c0%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240410T171020Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5ANI4FRZ6V%2F20240410%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=0ddb605426313cbad4badd96962a497139a4c61434afed909c3cfb1ab776eac4',
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
                        spatialChannelColor: [221, 52, 151],
                        spatialChannelVisible: true,
                        spatialChannelOpacity: 1.0,
                        spatialChannelWindow: [773,7733],
                    },
                    {
                        spatialTargetC: 1,
                        spatialChannelColor: [29, 145, 192],
                        spatialChannelVisible: true,
                        spatialChannelOpacity: 1.0,
                        spatialChannelWindow: [2290,6724],
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
                        spatialChannelColor: [253, 174, 107],
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
