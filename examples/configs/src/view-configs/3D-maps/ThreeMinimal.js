import {
    VitessceConfig,
    CoordinationLevel as CL,
    hconcat, vconcat,
} from '@vitessce/config';


function generateThreeMinimalConfiguration() {
    const config = new VitessceConfig({
        schemaVersion: '1.0.16',
        name: 'Minimal Three',
    });
    const dataset = config.addDataset('My dataset').addFile({
        fileType: 'image.ome-tiff',
        // url:'https://vitessce-data-v2.s3.amazonaws.com/data/sorger/img_0002.ome.tiff',
        // url:'https://vitessce-data-v2.s3.amazonaws.com/data/sorger/im001.ome.tiff',
        // url:'https://hdv-spatial-data.s3.us-east-1.amazonaws.com/spraggings/pyramid.ome.tif?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEBgaCXVzLWVhc3QtMSJHMEUCIEo8jFefVVt0XT2i8mhEQUljNtqGnKUaRfTigUgbrXywAiEAi1hSnGABFvnhtAlh1KQgCZvtdLV0So0WIh%2FGhhLofP0q7AMIMBABGgwxMzY1NzY1MjIwNDgiDN0i4pxPav96vq8GoSrJA%2BXt2OvWVonQwJR8Gf4oKFWipg5Eu9M6EU4I4NXfzlYJiNTWZRJLC6mZjIWEev2bBZ8%2FNdqazK%2BwdzMJKqgqITBZSEgKx6nQ78%2BJXReZ4b7UuEDR%2FTauBnuGHO5I8MrnXvZYSyP8P%2FB4qmdm6jRPw2baQPDVV0Gd%2FkZaiQ%2FecVccw1c%2FWdmBqqA6iNveumgei5yA9Lm4Ll0zc8ZjkqEIVXageVXw1FRxGeEvQejcBCgbB01Qha3rQFA1t0czzTNqTJrqOaLA597gy6Oy%2FIsRq8vA3ZTnKOt%2BJ2elSxPaDHuY1Mt8FAvd%2BcGWWCd8M1SmwaQGRBzDHEBwHewxWzMGMTbaSLOpdOo4fDiYqS4pz0P%2FlhfJBO8yinrVr98gFF8MBlgyoJ5QdB%2BqxErdYozOEBZ3n8iwoPx2cQbvTw9pytMMlDb%2F0UmTMmaJIKso%2F69pAfUXIugRwON%2BJMuL3ZI4%2BNMV%2BWK%2BbcsEWPQMVw%2BUISYnlcn3CtrKJsw0O21N4MD53Qunr9JTa4l7sOPLXLzFaxy%2FlT3nNxNvqRYm%2BY01crrlZFvu3eDpk1Vk3DQgxyP3NesGW6OtvhQsnYa7zanCZiziCCsCV6bkweYwn6DxrwY6lAImCx8EC%2BEPfUaTkPur4XPEPMM85Tw%2BA4Q%2BdaCkjARzPj5qO2lP3y%2B3O51%2FPQMx6xEFxXkuvT7IwBgJREhLWDjq0i%2By5KtFDhF1Pi4aDJsW1WFa1DciVKA5puGM1umzIZQiFHyUDFvZIF%2BhOaXFAV9pCjEsXg0eOM3tm35PACnWUUp8mRz7CBTFbheVXE8UiEARx%2BtsisykFkY%2FDnUmMFH1f%2F0rv2OvJSvwKAgURA%2BRPBIGxJzNN146E1xTZO2gBJ%2B8krKMpn1t7PgP237aKi3a2fxPjmNjkG4VYp4%2FDe%2BQo8X%2F7TEKQLBod54UP2%2BvQt%2FEydnbNK9DGq1uIZgHc%2BbEyEvVT8%2BNE%2BBBG8Iy1n6zAscj%2F00%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240321T153200Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43199&X-Amz-Credential=ASIAR7TEYK5AEO2WZPUH%2F20240321%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=730bc41956023dea02cba32f58a9c4345e3d258da0480c12d09e1105eeaa7ee4',
        url:'https://hdv-spatial-data.s3.us-east-1.amazonaws.com/spraggings/kidney_out.ome.tiff?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEBgaCXVzLWVhc3QtMSJHMEUCIEo8jFefVVt0XT2i8mhEQUljNtqGnKUaRfTigUgbrXywAiEAi1hSnGABFvnhtAlh1KQgCZvtdLV0So0WIh%2FGhhLofP0q7AMIMBABGgwxMzY1NzY1MjIwNDgiDN0i4pxPav96vq8GoSrJA%2BXt2OvWVonQwJR8Gf4oKFWipg5Eu9M6EU4I4NXfzlYJiNTWZRJLC6mZjIWEev2bBZ8%2FNdqazK%2BwdzMJKqgqITBZSEgKx6nQ78%2BJXReZ4b7UuEDR%2FTauBnuGHO5I8MrnXvZYSyP8P%2FB4qmdm6jRPw2baQPDVV0Gd%2FkZaiQ%2FecVccw1c%2FWdmBqqA6iNveumgei5yA9Lm4Ll0zc8ZjkqEIVXageVXw1FRxGeEvQejcBCgbB01Qha3rQFA1t0czzTNqTJrqOaLA597gy6Oy%2FIsRq8vA3ZTnKOt%2BJ2elSxPaDHuY1Mt8FAvd%2BcGWWCd8M1SmwaQGRBzDHEBwHewxWzMGMTbaSLOpdOo4fDiYqS4pz0P%2FlhfJBO8yinrVr98gFF8MBlgyoJ5QdB%2BqxErdYozOEBZ3n8iwoPx2cQbvTw9pytMMlDb%2F0UmTMmaJIKso%2F69pAfUXIugRwON%2BJMuL3ZI4%2BNMV%2BWK%2BbcsEWPQMVw%2BUISYnlcn3CtrKJsw0O21N4MD53Qunr9JTa4l7sOPLXLzFaxy%2FlT3nNxNvqRYm%2BY01crrlZFvu3eDpk1Vk3DQgxyP3NesGW6OtvhQsnYa7zanCZiziCCsCV6bkweYwn6DxrwY6lAImCx8EC%2BEPfUaTkPur4XPEPMM85Tw%2BA4Q%2BdaCkjARzPj5qO2lP3y%2B3O51%2FPQMx6xEFxXkuvT7IwBgJREhLWDjq0i%2By5KtFDhF1Pi4aDJsW1WFa1DciVKA5puGM1umzIZQiFHyUDFvZIF%2BhOaXFAV9pCjEsXg0eOM3tm35PACnWUUp8mRz7CBTFbheVXE8UiEARx%2BtsisykFkY%2FDnUmMFH1f%2F0rv2OvJSvwKAgURA%2BRPBIGxJzNN146E1xTZO2gBJ%2B8krKMpn1t7PgP237aKi3a2fxPjmNjkG4VYp4%2FDe%2BQo8X%2F7TEKQLBod54UP2%2BvQt%2FEydnbNK9DGq1uIZgHc%2BbEyEvVT8%2BNE%2BBBG8Iy1n6zAscj%2F00%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240321T154253Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5AEO2WZPUH%2F20240321%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=8b78841fa3fc6f25b7a85d3d4d2dd878dd4e4f0bc5434e6b77feae13d1b93930',
        options: {
            // offsetsUrl: "https://vitessce-data-v2.s3.amazonaws.com/data/sorger/img_0002.offsets.json",
            // offsetsUrl: "https://vitessce-data-v2.s3.amazonaws.com/data/sorger/im001.offsets.json",
            // offsetsUrl: "https://hdv-spatial-data.s3.us-east-1.amazonaws.com/spraggings/pyramid.offsets.json?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEBgaCXVzLWVhc3QtMSJHMEUCIEo8jFefVVt0XT2i8mhEQUljNtqGnKUaRfTigUgbrXywAiEAi1hSnGABFvnhtAlh1KQgCZvtdLV0So0WIh%2FGhhLofP0q7AMIMBABGgwxMzY1NzY1MjIwNDgiDN0i4pxPav96vq8GoSrJA%2BXt2OvWVonQwJR8Gf4oKFWipg5Eu9M6EU4I4NXfzlYJiNTWZRJLC6mZjIWEev2bBZ8%2FNdqazK%2BwdzMJKqgqITBZSEgKx6nQ78%2BJXReZ4b7UuEDR%2FTauBnuGHO5I8MrnXvZYSyP8P%2FB4qmdm6jRPw2baQPDVV0Gd%2FkZaiQ%2FecVccw1c%2FWdmBqqA6iNveumgei5yA9Lm4Ll0zc8ZjkqEIVXageVXw1FRxGeEvQejcBCgbB01Qha3rQFA1t0czzTNqTJrqOaLA597gy6Oy%2FIsRq8vA3ZTnKOt%2BJ2elSxPaDHuY1Mt8FAvd%2BcGWWCd8M1SmwaQGRBzDHEBwHewxWzMGMTbaSLOpdOo4fDiYqS4pz0P%2FlhfJBO8yinrVr98gFF8MBlgyoJ5QdB%2BqxErdYozOEBZ3n8iwoPx2cQbvTw9pytMMlDb%2F0UmTMmaJIKso%2F69pAfUXIugRwON%2BJMuL3ZI4%2BNMV%2BWK%2BbcsEWPQMVw%2BUISYnlcn3CtrKJsw0O21N4MD53Qunr9JTa4l7sOPLXLzFaxy%2FlT3nNxNvqRYm%2BY01crrlZFvu3eDpk1Vk3DQgxyP3NesGW6OtvhQsnYa7zanCZiziCCsCV6bkweYwn6DxrwY6lAImCx8EC%2BEPfUaTkPur4XPEPMM85Tw%2BA4Q%2BdaCkjARzPj5qO2lP3y%2B3O51%2FPQMx6xEFxXkuvT7IwBgJREhLWDjq0i%2By5KtFDhF1Pi4aDJsW1WFa1DciVKA5puGM1umzIZQiFHyUDFvZIF%2BhOaXFAV9pCjEsXg0eOM3tm35PACnWUUp8mRz7CBTFbheVXE8UiEARx%2BtsisykFkY%2FDnUmMFH1f%2F0rv2OvJSvwKAgURA%2BRPBIGxJzNN146E1xTZO2gBJ%2B8krKMpn1t7PgP237aKi3a2fxPjmNjkG4VYp4%2FDe%2BQo8X%2F7TEKQLBod54UP2%2BvQt%2FEydnbNK9DGq1uIZgHc%2BbEyEvVT8%2BNE%2BBBG8Iy1n6zAscj%2F00%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240321T153237Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5AEO2WZPUH%2F20240321%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=520d3101f716499c740739f7815db3d33f0ddd018a2fbca3bba9e5de46c2b1ae",
            offsetsUrl: "https://hdv-spatial-data.s3.us-east-1.amazonaws.com/spraggings/kidney_out.offsets.json?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEBgaCXVzLWVhc3QtMSJHMEUCIEo8jFefVVt0XT2i8mhEQUljNtqGnKUaRfTigUgbrXywAiEAi1hSnGABFvnhtAlh1KQgCZvtdLV0So0WIh%2FGhhLofP0q7AMIMBABGgwxMzY1NzY1MjIwNDgiDN0i4pxPav96vq8GoSrJA%2BXt2OvWVonQwJR8Gf4oKFWipg5Eu9M6EU4I4NXfzlYJiNTWZRJLC6mZjIWEev2bBZ8%2FNdqazK%2BwdzMJKqgqITBZSEgKx6nQ78%2BJXReZ4b7UuEDR%2FTauBnuGHO5I8MrnXvZYSyP8P%2FB4qmdm6jRPw2baQPDVV0Gd%2FkZaiQ%2FecVccw1c%2FWdmBqqA6iNveumgei5yA9Lm4Ll0zc8ZjkqEIVXageVXw1FRxGeEvQejcBCgbB01Qha3rQFA1t0czzTNqTJrqOaLA597gy6Oy%2FIsRq8vA3ZTnKOt%2BJ2elSxPaDHuY1Mt8FAvd%2BcGWWCd8M1SmwaQGRBzDHEBwHewxWzMGMTbaSLOpdOo4fDiYqS4pz0P%2FlhfJBO8yinrVr98gFF8MBlgyoJ5QdB%2BqxErdYozOEBZ3n8iwoPx2cQbvTw9pytMMlDb%2F0UmTMmaJIKso%2F69pAfUXIugRwON%2BJMuL3ZI4%2BNMV%2BWK%2BbcsEWPQMVw%2BUISYnlcn3CtrKJsw0O21N4MD53Qunr9JTa4l7sOPLXLzFaxy%2FlT3nNxNvqRYm%2BY01crrlZFvu3eDpk1Vk3DQgxyP3NesGW6OtvhQsnYa7zanCZiziCCsCV6bkweYwn6DxrwY6lAImCx8EC%2BEPfUaTkPur4XPEPMM85Tw%2BA4Q%2BdaCkjARzPj5qO2lP3y%2B3O51%2FPQMx6xEFxXkuvT7IwBgJREhLWDjq0i%2By5KtFDhF1Pi4aDJsW1WFa1DciVKA5puGM1umzIZQiFHyUDFvZIF%2BhOaXFAV9pCjEsXg0eOM3tm35PACnWUUp8mRz7CBTFbheVXE8UiEARx%2BtsisykFkY%2FDnUmMFH1f%2F0rv2OvJSvwKAgURA%2BRPBIGxJzNN146E1xTZO2gBJ%2B8krKMpn1t7PgP237aKi3a2fxPjmNjkG4VYp4%2FDe%2BQo8X%2F7TEKQLBod54UP2%2BvQt%2FEydnbNK9DGq1uIZgHc%2BbEyEvVT8%2BNE%2BBBG8Iy1n6zAscj%2F00%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240321T154226Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5AEO2WZPUH%2F20240321%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=11f7ecb2009ea72df8360a0e7d15429eabc7e5fb41da7b2f24699f8f2b52d5fc",
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
        //spatialRenderingMode:'3D',
        imageLayer: CL([
            {
                fileUid: 'kidney',
                spatialLayerOpacity: 1,
                spatialTargetResolution: null,
                imageChannel: CL([
                    {
                        spatialTargetC: 0,
                        spatialChannelColor: [0, 255, 0],
                        spatialChannelVisible: true,
                        spatialChannelOpacity: 1.0,
                        spatialChannelWindow: null,
                    },
                    // {
                    //     spatialTargetC: 2,
                    //     spatialChannelColor: [0, 0, 255],
                    //     spatialChannelVisible: true,
                    //     spatialChannelOpacity: 1.0,
                    //     spatialChannelWindow: null,
                    // },
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

export const threeMinimal = generateThreeMinimalConfiguration();
