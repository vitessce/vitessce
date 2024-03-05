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
        url: "https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/LS_20x_5_Stitched.pyramid.ome.tiff?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjECwaCXVzLWVhc3QtMSJHMEUCIFDt9nZx7wfMFyFO8mj64QNiilf%2BuK5v7md25%2BTYeMXeAiEA39QL6%2BZCg3Z4bLlKzKs7%2FCRw2UrIqTznYRvGh%2BAai8Mq7AMIJRABGgwxMzY1NzY1MjIwNDgiDNAlAudErl5gyd1QdSrJA3SWt9eMazCHTKwy%2BluZ7IoKskMh9WNFgy6iKSbImpwgGHrYN7G6lZHvLPo1y5gJgHgtcJ5j1JfDmMLLQCEabwvxgOcXv%2B1mxfsgOvceDp2qD%2B%2FxAA2Ubh1zgG3xKiWWo2GQL3rjLNYfkmQRVkmvPIAvkkeE%2B5kKaQSX2KrMWLCnabFdu6wpJZBSWljpgD5WUR4zeUreU5V%2F72mrsoqOlQnspf6IBDhZsDtDKbCqOo2lRIDuw4z%2B2RNQsHx7D%2FAJCk8Aow7WJnBaI8LhBfBpMtpg2tjfx88l7%2FPKhBos8bHY2fbb3CBVxku6XxziJ4nIvD7EwVpn6zyjbY7quuf2m7Er%2FtmH99kyJJ138jW2f9i3Vt%2Fhry0DccddDGXb5ELIQakHyxBctXpbT%2BX3tgjaUKkZe6JWkR0lUSBEiIU%2FYRrlGycex1spM60ju64%2FUWw4wFB5TpQEEkHJ4ZekHM6vA419J5pwQLk5xF9tw2vKas2ANYpHR1tU680Au0rBK3P3TH5mpnJ2HXyKUr8PHKQSDdjAqYyRx9lyIh7FWSD6LaDbu8NiFjRQXXBOKoeRdUc5%2BpnSbTZhwgpI2sH2Jdno8cV5Jr6gFiVcazgwjZSFrwY6lAK79rZXc7Rc4j%2BoNp4UKZkPxQ6aYYEZ5FwdiTehf0SoKCXiR4JodaNK7P9DNHM5zquZ8G9ZhOLSpRKkvXZq3ATRyjSNxbgdfwQWlu48gIiAHYtrrprZkgC8ek7p8ofygcxM7EaYs6KNVKr73JyIkFgKHSMbzefrq1%2F12CaUxeJQi0joDSfL6A83i%2BEFkfUNkyODlN8Iikho259XT%2FBs5xd5sKntXacs6cHGMQ6UcZDv5aqCi%2FhWixZtveJ0%2F8YmrQQiuFSFzcze05%2FHecjjxVlJJZmegm8fT5VD5tZLCoWii4e0rVcxbSaSuzqSus2v%2F34eccctqSP4luOIqqx3%2FCBu9xqrlhVxmP9zOE91SsJWNFQlls8%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240301T032351Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5AJMPCUHXZ%2F20240301%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=3b985c2406078b04a2d51945d15011256d2b6514dc09afd72a06f444e9973f5c",
        options: {
            offsetsUrl: "https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/LS_20x_5_Stitched.pyramid.offsets.json?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjECwaCXVzLWVhc3QtMSJHMEUCIFDt9nZx7wfMFyFO8mj64QNiilf%2BuK5v7md25%2BTYeMXeAiEA39QL6%2BZCg3Z4bLlKzKs7%2FCRw2UrIqTznYRvGh%2BAai8Mq7AMIJRABGgwxMzY1NzY1MjIwNDgiDNAlAudErl5gyd1QdSrJA3SWt9eMazCHTKwy%2BluZ7IoKskMh9WNFgy6iKSbImpwgGHrYN7G6lZHvLPo1y5gJgHgtcJ5j1JfDmMLLQCEabwvxgOcXv%2B1mxfsgOvceDp2qD%2B%2FxAA2Ubh1zgG3xKiWWo2GQL3rjLNYfkmQRVkmvPIAvkkeE%2B5kKaQSX2KrMWLCnabFdu6wpJZBSWljpgD5WUR4zeUreU5V%2F72mrsoqOlQnspf6IBDhZsDtDKbCqOo2lRIDuw4z%2B2RNQsHx7D%2FAJCk8Aow7WJnBaI8LhBfBpMtpg2tjfx88l7%2FPKhBos8bHY2fbb3CBVxku6XxziJ4nIvD7EwVpn6zyjbY7quuf2m7Er%2FtmH99kyJJ138jW2f9i3Vt%2Fhry0DccddDGXb5ELIQakHyxBctXpbT%2BX3tgjaUKkZe6JWkR0lUSBEiIU%2FYRrlGycex1spM60ju64%2FUWw4wFB5TpQEEkHJ4ZekHM6vA419J5pwQLk5xF9tw2vKas2ANYpHR1tU680Au0rBK3P3TH5mpnJ2HXyKUr8PHKQSDdjAqYyRx9lyIh7FWSD6LaDbu8NiFjRQXXBOKoeRdUc5%2BpnSbTZhwgpI2sH2Jdno8cV5Jr6gFiVcazgwjZSFrwY6lAK79rZXc7Rc4j%2BoNp4UKZkPxQ6aYYEZ5FwdiTehf0SoKCXiR4JodaNK7P9DNHM5zquZ8G9ZhOLSpRKkvXZq3ATRyjSNxbgdfwQWlu48gIiAHYtrrprZkgC8ek7p8ofygcxM7EaYs6KNVKr73JyIkFgKHSMbzefrq1%2F12CaUxeJQi0joDSfL6A83i%2BEFkfUNkyODlN8Iikho259XT%2FBs5xd5sKntXacs6cHGMQ6UcZDv5aqCi%2FhWixZtveJ0%2F8YmrQQiuFSFzcze05%2FHecjjxVlJJZmegm8fT5VD5tZLCoWii4e0rVcxbSaSuzqSus2v%2F34eccctqSP4luOIqqx3%2FCBu9xqrlhVxmP9zOE91SsJWNFQlls8%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240301T032339Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5AJMPCUHXZ%2F20240301%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=e00e694a6212c11522a563b6f5bfbd46952836be70b5d002e0268eb3bf927d6a",
        },
        coordinationValues: {
            fileUid: 'kidney',
        },
    }).addFile({
        fileType: 'segmentation.glb',
         url: 'https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/glom_surface_export_reduced_draco.glb?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjECwaCXVzLWVhc3QtMSJHMEUCIFDt9nZx7wfMFyFO8mj64QNiilf%2BuK5v7md25%2BTYeMXeAiEA39QL6%2BZCg3Z4bLlKzKs7%2FCRw2UrIqTznYRvGh%2BAai8Mq7AMIJRABGgwxMzY1NzY1MjIwNDgiDNAlAudErl5gyd1QdSrJA3SWt9eMazCHTKwy%2BluZ7IoKskMh9WNFgy6iKSbImpwgGHrYN7G6lZHvLPo1y5gJgHgtcJ5j1JfDmMLLQCEabwvxgOcXv%2B1mxfsgOvceDp2qD%2B%2FxAA2Ubh1zgG3xKiWWo2GQL3rjLNYfkmQRVkmvPIAvkkeE%2B5kKaQSX2KrMWLCnabFdu6wpJZBSWljpgD5WUR4zeUreU5V%2F72mrsoqOlQnspf6IBDhZsDtDKbCqOo2lRIDuw4z%2B2RNQsHx7D%2FAJCk8Aow7WJnBaI8LhBfBpMtpg2tjfx88l7%2FPKhBos8bHY2fbb3CBVxku6XxziJ4nIvD7EwVpn6zyjbY7quuf2m7Er%2FtmH99kyJJ138jW2f9i3Vt%2Fhry0DccddDGXb5ELIQakHyxBctXpbT%2BX3tgjaUKkZe6JWkR0lUSBEiIU%2FYRrlGycex1spM60ju64%2FUWw4wFB5TpQEEkHJ4ZekHM6vA419J5pwQLk5xF9tw2vKas2ANYpHR1tU680Au0rBK3P3TH5mpnJ2HXyKUr8PHKQSDdjAqYyRx9lyIh7FWSD6LaDbu8NiFjRQXXBOKoeRdUc5%2BpnSbTZhwgpI2sH2Jdno8cV5Jr6gFiVcazgwjZSFrwY6lAK79rZXc7Rc4j%2BoNp4UKZkPxQ6aYYEZ5FwdiTehf0SoKCXiR4JodaNK7P9DNHM5zquZ8G9ZhOLSpRKkvXZq3ATRyjSNxbgdfwQWlu48gIiAHYtrrprZkgC8ek7p8ofygcxM7EaYs6KNVKr73JyIkFgKHSMbzefrq1%2F12CaUxeJQi0joDSfL6A83i%2BEFkfUNkyODlN8Iikho259XT%2FBs5xd5sKntXacs6cHGMQ6UcZDv5aqCi%2FhWixZtveJ0%2F8YmrQQiuFSFzcze05%2FHecjjxVlJJZmegm8fT5VD5tZLCoWii4e0rVcxbSaSuzqSus2v%2F34eccctqSP4luOIqqx3%2FCBu9xqrlhVxmP9zOE91SsJWNFQlls8%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240301T032317Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5AJMPCUHXZ%2F20240301%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=024812eb5b379bde6e2b89da88684cf3f27fc06c3b8d464f8419c87e00ac7175',
        //url: 'http://127.0.0.1:8080/glom_surface_export_reduced_draco.glb',
        coordinationValues: {
            fileUid: 'gloms',
        }
    }).addFile({
        fileType: 'obsFeatureMatrix.csv',
        url: 'https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/statistics.csv?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjECwaCXVzLWVhc3QtMSJHMEUCIFDt9nZx7wfMFyFO8mj64QNiilf%2BuK5v7md25%2BTYeMXeAiEA39QL6%2BZCg3Z4bLlKzKs7%2FCRw2UrIqTznYRvGh%2BAai8Mq7AMIJRABGgwxMzY1NzY1MjIwNDgiDNAlAudErl5gyd1QdSrJA3SWt9eMazCHTKwy%2BluZ7IoKskMh9WNFgy6iKSbImpwgGHrYN7G6lZHvLPo1y5gJgHgtcJ5j1JfDmMLLQCEabwvxgOcXv%2B1mxfsgOvceDp2qD%2B%2FxAA2Ubh1zgG3xKiWWo2GQL3rjLNYfkmQRVkmvPIAvkkeE%2B5kKaQSX2KrMWLCnabFdu6wpJZBSWljpgD5WUR4zeUreU5V%2F72mrsoqOlQnspf6IBDhZsDtDKbCqOo2lRIDuw4z%2B2RNQsHx7D%2FAJCk8Aow7WJnBaI8LhBfBpMtpg2tjfx88l7%2FPKhBos8bHY2fbb3CBVxku6XxziJ4nIvD7EwVpn6zyjbY7quuf2m7Er%2FtmH99kyJJ138jW2f9i3Vt%2Fhry0DccddDGXb5ELIQakHyxBctXpbT%2BX3tgjaUKkZe6JWkR0lUSBEiIU%2FYRrlGycex1spM60ju64%2FUWw4wFB5TpQEEkHJ4ZekHM6vA419J5pwQLk5xF9tw2vKas2ANYpHR1tU680Au0rBK3P3TH5mpnJ2HXyKUr8PHKQSDdjAqYyRx9lyIh7FWSD6LaDbu8NiFjRQXXBOKoeRdUc5%2BpnSbTZhwgpI2sH2Jdno8cV5Jr6gFiVcazgwjZSFrwY6lAK79rZXc7Rc4j%2BoNp4UKZkPxQ6aYYEZ5FwdiTehf0SoKCXiR4JodaNK7P9DNHM5zquZ8G9ZhOLSpRKkvXZq3ATRyjSNxbgdfwQWlu48gIiAHYtrrprZkgC8ek7p8ofygcxM7EaYs6KNVKr73JyIkFgKHSMbzefrq1%2F12CaUxeJQi0joDSfL6A83i%2BEFkfUNkyODlN8Iikho259XT%2FBs5xd5sKntXacs6cHGMQ6UcZDv5aqCi%2FhWixZtveJ0%2F8YmrQQiuFSFzcze05%2FHecjjxVlJJZmegm8fT5VD5tZLCoWii4e0rVcxbSaSuzqSus2v%2F34eccctqSP4luOIqqx3%2FCBu9xqrlhVxmP9zOE91SsJWNFQlls8%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240301T032406Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5AJMPCUHXZ%2F20240301%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=76da7b9dcb1bc66645cb0d8c1521f33a868c447b6fc84cae60c14dd1a490c75e',
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
