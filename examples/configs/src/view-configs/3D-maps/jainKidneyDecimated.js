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
        url: 'https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/LS_20x_5_Stitched.pyramid.ome.tiff?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEBgaCXVzLWVhc3QtMSJHMEUCIEo8jFefVVt0XT2i8mhEQUljNtqGnKUaRfTigUgbrXywAiEAi1hSnGABFvnhtAlh1KQgCZvtdLV0So0WIh%2FGhhLofP0q7AMIMBABGgwxMzY1NzY1MjIwNDgiDN0i4pxPav96vq8GoSrJA%2BXt2OvWVonQwJR8Gf4oKFWipg5Eu9M6EU4I4NXfzlYJiNTWZRJLC6mZjIWEev2bBZ8%2FNdqazK%2BwdzMJKqgqITBZSEgKx6nQ78%2BJXReZ4b7UuEDR%2FTauBnuGHO5I8MrnXvZYSyP8P%2FB4qmdm6jRPw2baQPDVV0Gd%2FkZaiQ%2FecVccw1c%2FWdmBqqA6iNveumgei5yA9Lm4Ll0zc8ZjkqEIVXageVXw1FRxGeEvQejcBCgbB01Qha3rQFA1t0czzTNqTJrqOaLA597gy6Oy%2FIsRq8vA3ZTnKOt%2BJ2elSxPaDHuY1Mt8FAvd%2BcGWWCd8M1SmwaQGRBzDHEBwHewxWzMGMTbaSLOpdOo4fDiYqS4pz0P%2FlhfJBO8yinrVr98gFF8MBlgyoJ5QdB%2BqxErdYozOEBZ3n8iwoPx2cQbvTw9pytMMlDb%2F0UmTMmaJIKso%2F69pAfUXIugRwON%2BJMuL3ZI4%2BNMV%2BWK%2BbcsEWPQMVw%2BUISYnlcn3CtrKJsw0O21N4MD53Qunr9JTa4l7sOPLXLzFaxy%2FlT3nNxNvqRYm%2BY01crrlZFvu3eDpk1Vk3DQgxyP3NesGW6OtvhQsnYa7zanCZiziCCsCV6bkweYwn6DxrwY6lAImCx8EC%2BEPfUaTkPur4XPEPMM85Tw%2BA4Q%2BdaCkjARzPj5qO2lP3y%2B3O51%2FPQMx6xEFxXkuvT7IwBgJREhLWDjq0i%2By5KtFDhF1Pi4aDJsW1WFa1DciVKA5puGM1umzIZQiFHyUDFvZIF%2BhOaXFAV9pCjEsXg0eOM3tm35PACnWUUp8mRz7CBTFbheVXE8UiEARx%2BtsisykFkY%2FDnUmMFH1f%2F0rv2OvJSvwKAgURA%2BRPBIGxJzNN146E1xTZO2gBJ%2B8krKMpn1t7PgP237aKi3a2fxPjmNjkG4VYp4%2FDe%2BQo8X%2F7TEKQLBod54UP2%2BvQt%2FEydnbNK9DGq1uIZgHc%2BbEyEvVT8%2BNE%2BBBG8Iy1n6zAscj%2F00%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240321T155022Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5AEO2WZPUH%2F20240321%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=1426a5432a3475e8c8c8c2738f9bdd3a233e4af207a261adabfc6c64c547f576',
        options: {
            offsetsUrl: 'https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/LS_20x_5_Stitched.pyramid.offsets.json?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEBgaCXVzLWVhc3QtMSJHMEUCIEo8jFefVVt0XT2i8mhEQUljNtqGnKUaRfTigUgbrXywAiEAi1hSnGABFvnhtAlh1KQgCZvtdLV0So0WIh%2FGhhLofP0q7AMIMBABGgwxMzY1NzY1MjIwNDgiDN0i4pxPav96vq8GoSrJA%2BXt2OvWVonQwJR8Gf4oKFWipg5Eu9M6EU4I4NXfzlYJiNTWZRJLC6mZjIWEev2bBZ8%2FNdqazK%2BwdzMJKqgqITBZSEgKx6nQ78%2BJXReZ4b7UuEDR%2FTauBnuGHO5I8MrnXvZYSyP8P%2FB4qmdm6jRPw2baQPDVV0Gd%2FkZaiQ%2FecVccw1c%2FWdmBqqA6iNveumgei5yA9Lm4Ll0zc8ZjkqEIVXageVXw1FRxGeEvQejcBCgbB01Qha3rQFA1t0czzTNqTJrqOaLA597gy6Oy%2FIsRq8vA3ZTnKOt%2BJ2elSxPaDHuY1Mt8FAvd%2BcGWWCd8M1SmwaQGRBzDHEBwHewxWzMGMTbaSLOpdOo4fDiYqS4pz0P%2FlhfJBO8yinrVr98gFF8MBlgyoJ5QdB%2BqxErdYozOEBZ3n8iwoPx2cQbvTw9pytMMlDb%2F0UmTMmaJIKso%2F69pAfUXIugRwON%2BJMuL3ZI4%2BNMV%2BWK%2BbcsEWPQMVw%2BUISYnlcn3CtrKJsw0O21N4MD53Qunr9JTa4l7sOPLXLzFaxy%2FlT3nNxNvqRYm%2BY01crrlZFvu3eDpk1Vk3DQgxyP3NesGW6OtvhQsnYa7zanCZiziCCsCV6bkweYwn6DxrwY6lAImCx8EC%2BEPfUaTkPur4XPEPMM85Tw%2BA4Q%2BdaCkjARzPj5qO2lP3y%2B3O51%2FPQMx6xEFxXkuvT7IwBgJREhLWDjq0i%2By5KtFDhF1Pi4aDJsW1WFa1DciVKA5puGM1umzIZQiFHyUDFvZIF%2BhOaXFAV9pCjEsXg0eOM3tm35PACnWUUp8mRz7CBTFbheVXE8UiEARx%2BtsisykFkY%2FDnUmMFH1f%2F0rv2OvJSvwKAgURA%2BRPBIGxJzNN146E1xTZO2gBJ%2B8krKMpn1t7PgP237aKi3a2fxPjmNjkG4VYp4%2FDe%2BQo8X%2F7TEKQLBod54UP2%2BvQt%2FEydnbNK9DGq1uIZgHc%2BbEyEvVT8%2BNE%2BBBG8Iy1n6zAscj%2F00%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240321T155004Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43199&X-Amz-Credential=ASIAR7TEYK5AEO2WZPUH%2F20240321%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=5fecf6f1b0f2d9388198f7b9c1f08ae3bc5fef298d9afb5387dce04598e97f65',
        },
        coordinationValues: {
            fileUid: 'kidney',
        },
    }).addFile({
        fileType: 'segmentation.glb',
        url: 'https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/decimated.glb?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEBgaCXVzLWVhc3QtMSJHMEUCIEo8jFefVVt0XT2i8mhEQUljNtqGnKUaRfTigUgbrXywAiEAi1hSnGABFvnhtAlh1KQgCZvtdLV0So0WIh%2FGhhLofP0q7AMIMBABGgwxMzY1NzY1MjIwNDgiDN0i4pxPav96vq8GoSrJA%2BXt2OvWVonQwJR8Gf4oKFWipg5Eu9M6EU4I4NXfzlYJiNTWZRJLC6mZjIWEev2bBZ8%2FNdqazK%2BwdzMJKqgqITBZSEgKx6nQ78%2BJXReZ4b7UuEDR%2FTauBnuGHO5I8MrnXvZYSyP8P%2FB4qmdm6jRPw2baQPDVV0Gd%2FkZaiQ%2FecVccw1c%2FWdmBqqA6iNveumgei5yA9Lm4Ll0zc8ZjkqEIVXageVXw1FRxGeEvQejcBCgbB01Qha3rQFA1t0czzTNqTJrqOaLA597gy6Oy%2FIsRq8vA3ZTnKOt%2BJ2elSxPaDHuY1Mt8FAvd%2BcGWWCd8M1SmwaQGRBzDHEBwHewxWzMGMTbaSLOpdOo4fDiYqS4pz0P%2FlhfJBO8yinrVr98gFF8MBlgyoJ5QdB%2BqxErdYozOEBZ3n8iwoPx2cQbvTw9pytMMlDb%2F0UmTMmaJIKso%2F69pAfUXIugRwON%2BJMuL3ZI4%2BNMV%2BWK%2BbcsEWPQMVw%2BUISYnlcn3CtrKJsw0O21N4MD53Qunr9JTa4l7sOPLXLzFaxy%2FlT3nNxNvqRYm%2BY01crrlZFvu3eDpk1Vk3DQgxyP3NesGW6OtvhQsnYa7zanCZiziCCsCV6bkweYwn6DxrwY6lAImCx8EC%2BEPfUaTkPur4XPEPMM85Tw%2BA4Q%2BdaCkjARzPj5qO2lP3y%2B3O51%2FPQMx6xEFxXkuvT7IwBgJREhLWDjq0i%2By5KtFDhF1Pi4aDJsW1WFa1DciVKA5puGM1umzIZQiFHyUDFvZIF%2BhOaXFAV9pCjEsXg0eOM3tm35PACnWUUp8mRz7CBTFbheVXE8UiEARx%2BtsisykFkY%2FDnUmMFH1f%2F0rv2OvJSvwKAgURA%2BRPBIGxJzNN146E1xTZO2gBJ%2B8krKMpn1t7PgP237aKi3a2fxPjmNjkG4VYp4%2FDe%2BQo8X%2F7TEKQLBod54UP2%2BvQt%2FEydnbNK9DGq1uIZgHc%2BbEyEvVT8%2BNE%2BBBG8Iy1n6zAscj%2F00%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240321T154945Z&X-Amz-SignedHeaders=host&X-Amz-Expires=720&X-Amz-Credential=ASIAR7TEYK5AEO2WZPUH%2F20240321%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=69992223a58132358ea9f8df6aa178b5e9b085d1bda8f21448c996987d7d96c5',
        coordinationValues: {
            fileUid: 'gloms',
        }
    }).addFile({
        fileType: 'obsFeatureMatrix.csv',
        url: 'https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/statistics.csv?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEBgaCXVzLWVhc3QtMSJHMEUCIEo8jFefVVt0XT2i8mhEQUljNtqGnKUaRfTigUgbrXywAiEAi1hSnGABFvnhtAlh1KQgCZvtdLV0So0WIh%2FGhhLofP0q7AMIMBABGgwxMzY1NzY1MjIwNDgiDN0i4pxPav96vq8GoSrJA%2BXt2OvWVonQwJR8Gf4oKFWipg5Eu9M6EU4I4NXfzlYJiNTWZRJLC6mZjIWEev2bBZ8%2FNdqazK%2BwdzMJKqgqITBZSEgKx6nQ78%2BJXReZ4b7UuEDR%2FTauBnuGHO5I8MrnXvZYSyP8P%2FB4qmdm6jRPw2baQPDVV0Gd%2FkZaiQ%2FecVccw1c%2FWdmBqqA6iNveumgei5yA9Lm4Ll0zc8ZjkqEIVXageVXw1FRxGeEvQejcBCgbB01Qha3rQFA1t0czzTNqTJrqOaLA597gy6Oy%2FIsRq8vA3ZTnKOt%2BJ2elSxPaDHuY1Mt8FAvd%2BcGWWCd8M1SmwaQGRBzDHEBwHewxWzMGMTbaSLOpdOo4fDiYqS4pz0P%2FlhfJBO8yinrVr98gFF8MBlgyoJ5QdB%2BqxErdYozOEBZ3n8iwoPx2cQbvTw9pytMMlDb%2F0UmTMmaJIKso%2F69pAfUXIugRwON%2BJMuL3ZI4%2BNMV%2BWK%2BbcsEWPQMVw%2BUISYnlcn3CtrKJsw0O21N4MD53Qunr9JTa4l7sOPLXLzFaxy%2FlT3nNxNvqRYm%2BY01crrlZFvu3eDpk1Vk3DQgxyP3NesGW6OtvhQsnYa7zanCZiziCCsCV6bkweYwn6DxrwY6lAImCx8EC%2BEPfUaTkPur4XPEPMM85Tw%2BA4Q%2BdaCkjARzPj5qO2lP3y%2B3O51%2FPQMx6xEFxXkuvT7IwBgJREhLWDjq0i%2By5KtFDhF1Pi4aDJsW1WFa1DciVKA5puGM1umzIZQiFHyUDFvZIF%2BhOaXFAV9pCjEsXg0eOM3tm35PACnWUUp8mRz7CBTFbheVXE8UiEARx%2BtsisykFkY%2FDnUmMFH1f%2F0rv2OvJSvwKAgURA%2BRPBIGxJzNN146E1xTZO2gBJ%2B8krKMpn1t7PgP237aKi3a2fxPjmNjkG4VYp4%2FDe%2BQo8X%2F7TEKQLBod54UP2%2BvQt%2FEydnbNK9DGq1uIZgHc%2BbEyEvVT8%2BNE%2BBBG8Iy1n6zAscj%2F00%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240321T155040Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5AEO2WZPUH%2F20240321%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=e111a475fe887c36e5bb41b80c195a7ebf641d7fe9205301e20a618c94154159',
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
