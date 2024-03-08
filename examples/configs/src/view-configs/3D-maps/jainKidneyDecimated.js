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
        url: "https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/LS_20x_5_Stitched.pyramid.ome.tiff?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEM7%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQDERB76sHRLt%2FGin0wT%2FkXckDuKxb%2BNOTTLF67a2ccJKQIgbbjVWxaUdYn1VTJgMNN4r7QbSbaxYdJjn2Vm2739BIYq9QMIx%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARABGgwxMzY1NzY1MjIwNDgiDDX%2F0tC31IYzsnfDQSrJA2lLQHOhEmpLoClBTzeRs8Gqx%2BBB379%2BthVtcDHRyCAlSCdPbuWBpAdZlt3F1kRNMLqZhLabx9voQja9MJga2kRuZJsTItMHh%2BgGiF2Hvg8fRyBREQzo%2B6sJDGWw%2BEXufLBDmPx5pXAoF%2Bf5yWaH7yJinMh8g8nVFBWY6hTFcaK43uBYHQi9fprY6QimzMLkLUsJNypmdoVUZ%2BeWDIeHV2pL9OKmhOUPAhopiIGDpPe%2B6s8CHnTqRy%2FGNxeS7y0rUCiR%2BlO%2FhdMsVaEGqFJvdZR0rP31uHUOBGjN%2B9S4l7fqbsPfcxBeWJNcLFUOMQ1FlOWvaMpIqZPRajlvpxDNh8ifOOZqSb%2B6J8PbkxcUA1l407BB766fC%2BF9FDPdtBCN3DuzUgtiuiAnoByXsS%2FnNPzml%2F9buUIB9Q5aAekgjOoojv3QeCJfgbNQ8atjKZkALNek5I2tlYY%2BtdEQ%2Fxp0bM8F4h87I2qbywr%2F4QI%2BcKPOw9AZcN7rBTT06mPnX8MfA1TCyziHEuxpdKEl329RT314LjwpC%2FdGeZSIiFPHIQMWooiXb52lw6a7QQOejVvrVhdTbH1v%2FkT6Jd0YNhpCEwk%2BsrIR%2F1%2BGZfgwiPGorwY6lALaCv6tUc3OPD7SptNztJuumm%2BUBWwX2dfOOawoS3vu6MAg4KSSW1mKLNCxy9Qmv47FT%2FQf0KLusQ0zmRstcNd1pFtsulY4GOPtdm0w1Gk3%2FX%2FAF2lvU8doTzshG52Yf5x7JO3HDJg3GPaBMrslZDZIBFini2Cke2wD%2F74FsZxORxfDYi7iT9qnkt4VhydISMnlVIMXcNqhnVT5YaS%2BPEtLaJXRf6vRmetfFNmvnx%2Ba5KGIrWRUP2OY3WPKzgmdXghb1ke9875XSoBaqjqRDQOIfFXGfsG2g7jmxB8ZwheoFWYKnhpF9JhLauRqlVUzVrNvn6xgnzeK1Q5tFF5dxsExvT8K7eC79nSM6Dqu8NvIRLI7Y4U%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240307T215933Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5AP2UQ66N7%2F20240307%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=d66788ed2c20d3bbac87f50fc87e88d51cfebac681a162ba5be40b13c9c53b24",
        options: {
            offsetsUrl: "https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/LS_20x_5_Stitched.pyramid.offsets.json?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEM7%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQDERB76sHRLt%2FGin0wT%2FkXckDuKxb%2BNOTTLF67a2ccJKQIgbbjVWxaUdYn1VTJgMNN4r7QbSbaxYdJjn2Vm2739BIYq9QMIx%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARABGgwxMzY1NzY1MjIwNDgiDDX%2F0tC31IYzsnfDQSrJA2lLQHOhEmpLoClBTzeRs8Gqx%2BBB379%2BthVtcDHRyCAlSCdPbuWBpAdZlt3F1kRNMLqZhLabx9voQja9MJga2kRuZJsTItMHh%2BgGiF2Hvg8fRyBREQzo%2B6sJDGWw%2BEXufLBDmPx5pXAoF%2Bf5yWaH7yJinMh8g8nVFBWY6hTFcaK43uBYHQi9fprY6QimzMLkLUsJNypmdoVUZ%2BeWDIeHV2pL9OKmhOUPAhopiIGDpPe%2B6s8CHnTqRy%2FGNxeS7y0rUCiR%2BlO%2FhdMsVaEGqFJvdZR0rP31uHUOBGjN%2B9S4l7fqbsPfcxBeWJNcLFUOMQ1FlOWvaMpIqZPRajlvpxDNh8ifOOZqSb%2B6J8PbkxcUA1l407BB766fC%2BF9FDPdtBCN3DuzUgtiuiAnoByXsS%2FnNPzml%2F9buUIB9Q5aAekgjOoojv3QeCJfgbNQ8atjKZkALNek5I2tlYY%2BtdEQ%2Fxp0bM8F4h87I2qbywr%2F4QI%2BcKPOw9AZcN7rBTT06mPnX8MfA1TCyziHEuxpdKEl329RT314LjwpC%2FdGeZSIiFPHIQMWooiXb52lw6a7QQOejVvrVhdTbH1v%2FkT6Jd0YNhpCEwk%2BsrIR%2F1%2BGZfgwiPGorwY6lALaCv6tUc3OPD7SptNztJuumm%2BUBWwX2dfOOawoS3vu6MAg4KSSW1mKLNCxy9Qmv47FT%2FQf0KLusQ0zmRstcNd1pFtsulY4GOPtdm0w1Gk3%2FX%2FAF2lvU8doTzshG52Yf5x7JO3HDJg3GPaBMrslZDZIBFini2Cke2wD%2F74FsZxORxfDYi7iT9qnkt4VhydISMnlVIMXcNqhnVT5YaS%2BPEtLaJXRf6vRmetfFNmvnx%2Ba5KGIrWRUP2OY3WPKzgmdXghb1ke9875XSoBaqjqRDQOIfFXGfsG2g7jmxB8ZwheoFWYKnhpF9JhLauRqlVUzVrNvn6xgnzeK1Q5tFF5dxsExvT8K7eC79nSM6Dqu8NvIRLI7Y4U%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240307T215946Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5AP2UQ66N7%2F20240307%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=ebeaf4e476f84b76de33b691571c7bc43f2ff277701a800f5e21e8c97a477d1a",
        },
        coordinationValues: {
            fileUid: 'kidney',
        },
    }).addFile({
        fileType: 'segmentation.glb',
         // url: 'https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/glom_surface_export_reduced_draco.glb?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjELn%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIEv%2BFGww2RAiNfLU1u4K5NmgBQMFPTRv7I1IbrskVe2nAiEAypC2xp%2BAPScvTxXajDBFJ%2FDkOE4LN7y3KWAUa7X8B4Aq9QMIsv%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARABGgwxMzY1NzY1MjIwNDgiDMMRAd3asg9qheoysSrJA2ehSbS8xnRSCndYmgK67o8zRmY4BDEIM0bh6jYkm%2FxSAEiUvwnKXQNBD%2FQxq3GJMiFWZ37hwCIZEt8BaNFINdP9EyyPMIjCozWf%2FQ8MzsOMEjRolPNCc92JTQOO2tGM55whCOdGfP73%2BSE5ZbuSatcJRqV0kYNEDJR7jZP5nCvThN6HHGorLuNvcAANCEMVYtY9oUPdNCWSey6h50I%2BtISFHos0Hyjna0b8olVwIPUYj485qzXJziaXTLYlQy855MtlntSHRPZyvMXf65NStEvul%2BFhAwuuC11tLlDVIUY6iTy%2FcdG6NiArdwLih3%2F%2BQGQLZT8CF9iNcPzspzvNOc1bR4f%2BxlBE%2F24tw0hGk%2Bj20PcAkMAkt4SExagAAcgi3FkVZ8DajNVuu5Otwp2xGK0UsvLuYRi39%2FtaR3WacFNw9WicIs4tqRA5394oXm0zTP8xlSpim6a%2BhwQ%2B67CveNJr7Y0H11gzPQoL0dH4yBX2Ndt9OmpzaQlOcD5mfA9Pj6Y%2BDtImjhbfN3kBii5mG9VH9uEEHPgfkowIQOw4ZV5eFeVzcrFJGJh8XtoeX69xWZjRK8d8RAa8gNMLcUxWmdT9FBjAtGlN5ZMwnpykrwY6lAKmcbPD0%2BmGcbh0AD5oVVfZgK85%2Fdz631sVj%2Bdoipk0s7bdcwt30qFrbS3IGAR1CRNoEXaISe%2BZsSKIBKfkZK5h%2BDrrhFPORGzMlePQwbDXddsjRsUVLljLp4UXsVKjG2QglPE86UPoptUxxq8ZgtRIiu7Mi9SiQvF%2FTUAv5fzi7L%2BJNUSJzQMo1JOP57qPdHZHmrmMHx4%2B92S3uhStCAgmBa%2FiwZG5LaY9sVZsLenKXNkRlJ%2BR2tVMNC3NGnBsKFpnu%2Bv67onEMfAGfWWXPvlwr3j6BnH6pvjvFQNCrlWlS7g7YcjEN24OBAFBs0ci2OD%2F%2FOaMBgD6UrM6AHaZ1SeQlRTlGP04UEIv1CqLE0e0PWxOvo0%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240307T012106Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43199&X-Amz-Credential=ASIAR7TEYK5AE7IYMO4A%2F20240307%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=67f7d000b47b7adf4fda2095ae656a4fa057cc63f7d819c5ff5d18162b115645',
        // url: 'https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/decimated.glb?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEM7%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQDERB76sHRLt%2FGin0wT%2FkXckDuKxb%2BNOTTLF67a2ccJKQIgbbjVWxaUdYn1VTJgMNN4r7QbSbaxYdJjn2Vm2739BIYq9QMIx%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARABGgwxMzY1NzY1MjIwNDgiDDX%2F0tC31IYzsnfDQSrJA2lLQHOhEmpLoClBTzeRs8Gqx%2BBB379%2BthVtcDHRyCAlSCdPbuWBpAdZlt3F1kRNMLqZhLabx9voQja9MJga2kRuZJsTItMHh%2BgGiF2Hvg8fRyBREQzo%2B6sJDGWw%2BEXufLBDmPx5pXAoF%2Bf5yWaH7yJinMh8g8nVFBWY6hTFcaK43uBYHQi9fprY6QimzMLkLUsJNypmdoVUZ%2BeWDIeHV2pL9OKmhOUPAhopiIGDpPe%2B6s8CHnTqRy%2FGNxeS7y0rUCiR%2BlO%2FhdMsVaEGqFJvdZR0rP31uHUOBGjN%2B9S4l7fqbsPfcxBeWJNcLFUOMQ1FlOWvaMpIqZPRajlvpxDNh8ifOOZqSb%2B6J8PbkxcUA1l407BB766fC%2BF9FDPdtBCN3DuzUgtiuiAnoByXsS%2FnNPzml%2F9buUIB9Q5aAekgjOoojv3QeCJfgbNQ8atjKZkALNek5I2tlYY%2BtdEQ%2Fxp0bM8F4h87I2qbywr%2F4QI%2BcKPOw9AZcN7rBTT06mPnX8MfA1TCyziHEuxpdKEl329RT314LjwpC%2FdGeZSIiFPHIQMWooiXb52lw6a7QQOejVvrVhdTbH1v%2FkT6Jd0YNhpCEwk%2BsrIR%2F1%2BGZfgwiPGorwY6lALaCv6tUc3OPD7SptNztJuumm%2BUBWwX2dfOOawoS3vu6MAg4KSSW1mKLNCxy9Qmv47FT%2FQf0KLusQ0zmRstcNd1pFtsulY4GOPtdm0w1Gk3%2FX%2FAF2lvU8doTzshG52Yf5x7JO3HDJg3GPaBMrslZDZIBFini2Cke2wD%2F74FsZxORxfDYi7iT9qnkt4VhydISMnlVIMXcNqhnVT5YaS%2BPEtLaJXRf6vRmetfFNmvnx%2Ba5KGIrWRUP2OY3WPKzgmdXghb1ke9875XSoBaqjqRDQOIfFXGfsG2g7jmxB8ZwheoFWYKnhpF9JhLauRqlVUzVrNvn6xgnzeK1Q5tFF5dxsExvT8K7eC79nSM6Dqu8NvIRLI7Y4U%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240307T215906Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5AP2UQ66N7%2F20240307%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=a9d8524412d1f94e385ecfdd66978f4ccd18f1604e96e28f6aeb7097cd3e4c8d',
        url: 'http://127.0.0.1:8080/decimated.glb',
        coordinationValues: {
            fileUid: 'gloms',
        }
    }).addFile({
        fileType: 'obsFeatureMatrix.csv',
        url: 'https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/statistics.csv?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEM7%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQDERB76sHRLt%2FGin0wT%2FkXckDuKxb%2BNOTTLF67a2ccJKQIgbbjVWxaUdYn1VTJgMNN4r7QbSbaxYdJjn2Vm2739BIYq9QMIx%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARABGgwxMzY1NzY1MjIwNDgiDDX%2F0tC31IYzsnfDQSrJA2lLQHOhEmpLoClBTzeRs8Gqx%2BBB379%2BthVtcDHRyCAlSCdPbuWBpAdZlt3F1kRNMLqZhLabx9voQja9MJga2kRuZJsTItMHh%2BgGiF2Hvg8fRyBREQzo%2B6sJDGWw%2BEXufLBDmPx5pXAoF%2Bf5yWaH7yJinMh8g8nVFBWY6hTFcaK43uBYHQi9fprY6QimzMLkLUsJNypmdoVUZ%2BeWDIeHV2pL9OKmhOUPAhopiIGDpPe%2B6s8CHnTqRy%2FGNxeS7y0rUCiR%2BlO%2FhdMsVaEGqFJvdZR0rP31uHUOBGjN%2B9S4l7fqbsPfcxBeWJNcLFUOMQ1FlOWvaMpIqZPRajlvpxDNh8ifOOZqSb%2B6J8PbkxcUA1l407BB766fC%2BF9FDPdtBCN3DuzUgtiuiAnoByXsS%2FnNPzml%2F9buUIB9Q5aAekgjOoojv3QeCJfgbNQ8atjKZkALNek5I2tlYY%2BtdEQ%2Fxp0bM8F4h87I2qbywr%2F4QI%2BcKPOw9AZcN7rBTT06mPnX8MfA1TCyziHEuxpdKEl329RT314LjwpC%2FdGeZSIiFPHIQMWooiXb52lw6a7QQOejVvrVhdTbH1v%2FkT6Jd0YNhpCEwk%2BsrIR%2F1%2BGZfgwiPGorwY6lALaCv6tUc3OPD7SptNztJuumm%2BUBWwX2dfOOawoS3vu6MAg4KSSW1mKLNCxy9Qmv47FT%2FQf0KLusQ0zmRstcNd1pFtsulY4GOPtdm0w1Gk3%2FX%2FAF2lvU8doTzshG52Yf5x7JO3HDJg3GPaBMrslZDZIBFini2Cke2wD%2F74FsZxORxfDYi7iT9qnkt4VhydISMnlVIMXcNqhnVT5YaS%2BPEtLaJXRf6vRmetfFNmvnx%2Ba5KGIrWRUP2OY3WPKzgmdXghb1ke9875XSoBaqjqRDQOIfFXGfsG2g7jmxB8ZwheoFWYKnhpF9JhLauRqlVUzVrNvn6xgnzeK1Q5tFF5dxsExvT8K7eC79nSM6Dqu8NvIRLI7Y4U%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240307T215921Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5AP2UQ66N7%2F20240307%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=35bb083ad4bae956c90d9095ee4cebd118bfa8e4425343a2ca6348fdd898e24d',
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
        spatialRenderingMode:'3D',
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
                spatialScaleY: 0.275/8.0,
                spatialScaleZ: 0.275,
                spatialRotationX: Math.PI/2.0,
                spatialSceneScaleX: 1.0,
                spatialSceneScaleY: 1.0,
                spatialSceneScaleZ: 8.0,
                // spatialSceneRotationX: Math.PI/2.0,
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
