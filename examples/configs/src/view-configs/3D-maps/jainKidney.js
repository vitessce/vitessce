import {
    VitessceConfig,
    CoordinationLevel as CL,
    hconcat, vconcat,
} from '@vitessce/config';


function generateJainKidneyConfig() {
    const config = new VitessceConfig({
        schemaVersion: '1.0.16',
        name: 'Jain Kidney 2024',
    });
    const dataset = config.addDataset('My dataset').addFile({
        fileType: 'image.ome-tiff',
        url: "https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/LS_20x_5_Stitched.pyramid.ome.tiff?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjECIaCXVzLWVhc3QtMSJGMEQCICwJcc2WbjjjNAVwNQd94Hco1b0Nh9F7qtODkncg4U8qAiAGhPmjz5N69A2R4PGl336qxbuSR4AduYKrvz12wOQTwCrsAwgbEAEaDDEzNjU3NjUyMjA0OCIMu9aG7%2FNYHhwtUegLKskD1glP3T58G79gwJ%2F%2BqR3GoFEIKklbWYPTv3pECmArHQNG%2F7%2FfEz%2B7OcBsjV06LJMy4iybmI6kkruObhg0yG2nr%2FF6KF1wpX6adNzieSBbzvex6VA2aiQ3GrMZzK8%2BGez8ur8U6q4dOOid%2Fcf%2BO16ueL2qfHhw1Hr%2BwrthwAo1lEfoEQed%2BeY3SgmbsfgfONfS3%2FKz9UJyiF6KV%2BsmmSddwEvSsWstrjbxt9vrCBjE9PCNTFGA8wnpbCnpd%2BinRIVs4SLKnBxnjlY82tZ%2F2N6KqY4jUU1VJezHKqfxGbbgOd1TcD4%2FY2qv0Yd9rbC63uR4fVlFMfpCLl6yReM%2FYj2bgQEY6JPWtcWAX8fCJUYvAil89LB5FvfP7Hm1fazmX%2BElVPLFxo26jUii959b0gGXIrYqfUHlOaTdiJ61M%2FAkbjMEm5kX8Ac4Zlj7vXkvfv8qcqXg6VU%2FiRE3r%2F4MPDaz3v80TCXOw4BP1vM3EgxsHh7X7L3fl8uD89K%2BokfoAiuPLvwAha22virpWgEN5%2BI%2F65W%2FYOS68539HkHcr3mP%2FL6WmylDXVBb%2BZEqTp%2FKowttlOuGwOK2q4ks2IMQSggxi%2BUBt78%2FCAG72TC6%2BoKvBjqVApZ78E0Jz%2BSBZQQGQrPvqKQk2K4wiiT%2FHRG5hRYjQAJLfgnDWYtUgdlxoOyPCfNZtudmR%2FFnyNLPdosWTqANiWt2dQ2srRTpvpiTat7AfQkrPz2NCEghSRBBr7hlSElx96hz4Qd80e9hRKEL3FCbt3bZ21%2B2Gg%2FkSro7FYkQ88fs7gDuCkgdnrgJQp5YvCGHib6nN%2B0EWtMnpCqXB26JGgN5vLEQRyoLCOTt2hTISM%2BWXscHOny0qs3hd%2BOZGEZN5%2BHnR%2FJkIJUtPVWh8MlZuXneYySYVPaOf2s8HM2sWt5PaQp0TfLMaxk7sqaAXHGnKMwoOKM%2BfEbkT%2Fpyu5uQb5ILTGj4EdDCSBRSPr0ZMCQ66zEXEAI%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240229T172257Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5AFWX7XBX3%2F20240229%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=4750c06236f03b949297c380afe58e6ab07d3557008843a0948a56fe1f3053bd",
        options: {
            offsetsUrl: "https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/LS_20x_5_Stitched.pyramid.offsets.json?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjECIaCXVzLWVhc3QtMSJGMEQCICwJcc2WbjjjNAVwNQd94Hco1b0Nh9F7qtODkncg4U8qAiAGhPmjz5N69A2R4PGl336qxbuSR4AduYKrvz12wOQTwCrsAwgbEAEaDDEzNjU3NjUyMjA0OCIMu9aG7%2FNYHhwtUegLKskD1glP3T58G79gwJ%2F%2BqR3GoFEIKklbWYPTv3pECmArHQNG%2F7%2FfEz%2B7OcBsjV06LJMy4iybmI6kkruObhg0yG2nr%2FF6KF1wpX6adNzieSBbzvex6VA2aiQ3GrMZzK8%2BGez8ur8U6q4dOOid%2Fcf%2BO16ueL2qfHhw1Hr%2BwrthwAo1lEfoEQed%2BeY3SgmbsfgfONfS3%2FKz9UJyiF6KV%2BsmmSddwEvSsWstrjbxt9vrCBjE9PCNTFGA8wnpbCnpd%2BinRIVs4SLKnBxnjlY82tZ%2F2N6KqY4jUU1VJezHKqfxGbbgOd1TcD4%2FY2qv0Yd9rbC63uR4fVlFMfpCLl6yReM%2FYj2bgQEY6JPWtcWAX8fCJUYvAil89LB5FvfP7Hm1fazmX%2BElVPLFxo26jUii959b0gGXIrYqfUHlOaTdiJ61M%2FAkbjMEm5kX8Ac4Zlj7vXkvfv8qcqXg6VU%2FiRE3r%2F4MPDaz3v80TCXOw4BP1vM3EgxsHh7X7L3fl8uD89K%2BokfoAiuPLvwAha22virpWgEN5%2BI%2F65W%2FYOS68539HkHcr3mP%2FL6WmylDXVBb%2BZEqTp%2FKowttlOuGwOK2q4ks2IMQSggxi%2BUBt78%2FCAG72TC6%2BoKvBjqVApZ78E0Jz%2BSBZQQGQrPvqKQk2K4wiiT%2FHRG5hRYjQAJLfgnDWYtUgdlxoOyPCfNZtudmR%2FFnyNLPdosWTqANiWt2dQ2srRTpvpiTat7AfQkrPz2NCEghSRBBr7hlSElx96hz4Qd80e9hRKEL3FCbt3bZ21%2B2Gg%2FkSro7FYkQ88fs7gDuCkgdnrgJQp5YvCGHib6nN%2B0EWtMnpCqXB26JGgN5vLEQRyoLCOTt2hTISM%2BWXscHOny0qs3hd%2BOZGEZN5%2BHnR%2FJkIJUtPVWh8MlZuXneYySYVPaOf2s8HM2sWt5PaQp0TfLMaxk7sqaAXHGnKMwoOKM%2BfEbkT%2Fpyu5uQb5ILTGj4EdDCSBRSPr0ZMCQ66zEXEAI%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240229T172248Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5AFWX7XBX3%2F20240229%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=0ee11c527e3fc19f0c42b0bb5cd85f3e33fb6265a2b63868b3833a33d84c3e73",
        },
        coordinationValues: {
            fileUid: 'kidney',
        },
    }).addFile({
        fileType: 'segmentation.glb',
        // url: 'https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/glom_surface_export_reduced_draco.glb?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjECgaCXVzLWVhc3QtMSJIMEYCIQCQ16h%2Fea3m29fU%2B%2FM9zrvqtnv5It0bIEjYD%2FWrDrw1MAIhAPunFtmViD2VM511YCysxgv%2Fk5dvemg6BDa0bRHXttEmKuwDCCEQARoMMTM2NTc2NTIyMDQ4IgzQklp9wSmOPihFRswqyQNfW%2FzP8E1G%2BSdRqP9SuSJgpazmS7UJuxy4yS1ux9kMxWnFdO6tt72Z%2BvrLUL8TssLl48bfi2vGduwQiKBvWuvKJC0l2MIh1ehbZM4kIWhLwyZJI%2FUkLRB0qQt4i5OsSW4kaIBUFEsv8sWeh3u6HJfRTsu%2BqnGduRywCiZQfGDAEZkJGenJO3zhfkQFKodZQyp5Fla%2FQfDpk91SutRQ6t9vC2U%2Bzh4%2FieRLOjlCZtZOBghyViM4XE4yqATbzo8Y%2FLKypiuDpzttjPKJUDp%2FF8BM5XjA71pyJSRZiYlN98c3kWbipHUm39ULHspzt3Y7okPWKmomGBVzxLkuZ15e24UnSImBpBynYhtyxQegLrpgyHth9NkATpvdSzoin54Zmy8LUQL2EI0rGC0i2xpc%2FJMjurJIckKM90bZjCu0Ld0IqQ5nqH2sYOUgjtLEnZ1OW0LKR6x2h80rdbugrvOBqJ6jFbf5F8tG7kgb2tnDxW4fFHiGd3yyb3QyXQkdmmpToWX02EAGX%2B%2Fna8KPh65lwi0TQ%2B20f6lXNU9SnVYeJextefPI4xyxJ3CaqG4Ly83sHLvowSs2IZwfZZkBAtuA6le0iSag%2F%2BtxMfPvMO6lhK8GOpMCIZ0xqGXYAl%2Bn3xE7hL5tl71t%2BTT%2F5QmCAvf7rqK5mPaO1zax1EFWRfDZF0K%2FrG3PMEmxDJRJOFx5Sqww69kS45Qbazm8hJZOFUZ9cSk6BHxvkv1l%2B47J4h4Tybm9NbGtAUYQSUlACHN7g6YvpV3fE9F%2BSkirTfhT2yHQAy5oaLfFgN3kSZF72unhp%2B82JOglFr3%2FdO%2Bb8Rb%2FURMGiktyHx8T5liS%2B36Yo2FrbUYEGSEdcWPKeYV5D9RMDPwe44IYwZlVOjFdrQD%2BCteExPnExVx3ROg67NtE6PDKpCysJGXEc3EeXK0bHY27et4OE1jgj%2FfO84jQ08rJrbu7C3xic1rpdSj7J4kSDue%2Fe4EvyOrvCDQ%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240301T004822Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5ALDBARK5P%2F20240301%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=95ef0a54a1cac28a434cf8a1ae0ae307f1f97e01a9968e3d0dc037abca773861',
        url: 'http://127.0.0.1:8080/glom_surface_export_reduced_draco.glb',
        coordinationValues: {
            fileUid: 'gloms',
        }
    }).addFile({
        fileType: 'obsFeatureMatrix.csv',
        url: 'https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/statistics.csv?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjECIaCXVzLWVhc3QtMSJGMEQCICwJcc2WbjjjNAVwNQd94Hco1b0Nh9F7qtODkncg4U8qAiAGhPmjz5N69A2R4PGl336qxbuSR4AduYKrvz12wOQTwCrsAwgbEAEaDDEzNjU3NjUyMjA0OCIMu9aG7%2FNYHhwtUegLKskD1glP3T58G79gwJ%2F%2BqR3GoFEIKklbWYPTv3pECmArHQNG%2F7%2FfEz%2B7OcBsjV06LJMy4iybmI6kkruObhg0yG2nr%2FF6KF1wpX6adNzieSBbzvex6VA2aiQ3GrMZzK8%2BGez8ur8U6q4dOOid%2Fcf%2BO16ueL2qfHhw1Hr%2BwrthwAo1lEfoEQed%2BeY3SgmbsfgfONfS3%2FKz9UJyiF6KV%2BsmmSddwEvSsWstrjbxt9vrCBjE9PCNTFGA8wnpbCnpd%2BinRIVs4SLKnBxnjlY82tZ%2F2N6KqY4jUU1VJezHKqfxGbbgOd1TcD4%2FY2qv0Yd9rbC63uR4fVlFMfpCLl6yReM%2FYj2bgQEY6JPWtcWAX8fCJUYvAil89LB5FvfP7Hm1fazmX%2BElVPLFxo26jUii959b0gGXIrYqfUHlOaTdiJ61M%2FAkbjMEm5kX8Ac4Zlj7vXkvfv8qcqXg6VU%2FiRE3r%2F4MPDaz3v80TCXOw4BP1vM3EgxsHh7X7L3fl8uD89K%2BokfoAiuPLvwAha22virpWgEN5%2BI%2F65W%2FYOS68539HkHcr3mP%2FL6WmylDXVBb%2BZEqTp%2FKowttlOuGwOK2q4ks2IMQSggxi%2BUBt78%2FCAG72TC6%2BoKvBjqVApZ78E0Jz%2BSBZQQGQrPvqKQk2K4wiiT%2FHRG5hRYjQAJLfgnDWYtUgdlxoOyPCfNZtudmR%2FFnyNLPdosWTqANiWt2dQ2srRTpvpiTat7AfQkrPz2NCEghSRBBr7hlSElx96hz4Qd80e9hRKEL3FCbt3bZ21%2B2Gg%2FkSro7FYkQ88fs7gDuCkgdnrgJQp5YvCGHib6nN%2B0EWtMnpCqXB26JGgN5vLEQRyoLCOTt2hTISM%2BWXscHOny0qs3hd%2BOZGEZN5%2BHnR%2FJkIJUtPVWh8MlZuXneYySYVPaOf2s8HM2sWt5PaQp0TfLMaxk7sqaAXHGnKMwoOKM%2BfEbkT%2Fpyu5uQb5ILTGj4EdDCSBRSPr0ZMCQ66zEXEAI%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240229T172306Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43199&X-Amz-Credential=ASIAR7TEYK5AFWX7XBX3%2F20240229%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=264f8af60bb6cab6921deca6ee8bab70729dbd9fe4610919ed919c79a496884b',
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
                spatialTargetX: -420,
                spatialTargetY: -530,
                spatialTargetZ: 420,
                spatialScaleX: 0.275,
                spatialScaleY: 0.275/8.0,
                spatialScaleZ: -0.275,
                spatialRotationX: Math.PI/2.0,
                spatialSceneScaleX: -1.0,
                spatialSceneScaleY: -8.0,
                spatialSceneScaleZ: 1.0,
                spatialSceneRotationX: Math.PI/2.0,
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

export const jainkidney = generateJainKidneyConfig();
