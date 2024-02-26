import {
    VitessceConfig,
    CoordinationLevel as CL,
    hconcat, vconcat,
} from '@vitessce/config';


function generateBloodVesselConfig() {
    const config = new VitessceConfig({
        schemaVersion: '1.0.16',
        name: 'Peter Sorger Blood Vessel',
    });
    const dataset = config.addDataset('My dataset').addFile({
        fileType: 'image.ome-tiff',
        url: "https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/LS_20x_5_Stitched.pyramid.ome.tiff?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEMX%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJIMEYCIQDwPmavmsQXfJ9YI2nXPoqHPUvD7MqoVi07TloiLtJcxwIhAPJogo4NBOVyut5u5ZsZJ%2By4AmACsmhL6DUXdfL4oBdAKvQDCK7%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQARoMMTM2NTc2NTIyMDQ4Igw01qgJd%2FkxqoFgbPMqyAMncxg8e%2B5gxDRioOMnO5JoXbUPeK64Ut45xH0x1FsH%2BW9mJPzgCLUwcwWO2ZYP2Njf80tiQYqcvgdP8JljJgNlcx7FqdFDElf%2FNtb%2FOX9bQec0mFQIqoxU3iVCZtDdrbvIZECJlDlNnWjkJdo821mI6%2FXxevOpvdGINXUo%2FuvqCCRcyR36DU0POOANukWONWhb0C4WCyGRlqmnDEU6AifUsEQ7hGjHzQNZL3yl%2FsvX3QZV4i4e5IzFB1el%2B7ATYSxqqKHE9ohF2sJnuVCbGg%2FB4Nw3A5KSrjq%2BWD5HICE8mFYQ9bpmGrYrPTjzvInJmoZ6tVwnR%2FCNhAOkpr8u3zpLaBFrzVza%2Fcf9vY2WvJKOAcHCtdwHaCWf4umLANNbvrfbkA9beh896Ed9BnfHliMnqBCrM9zw3DYu6UjQVuNp6thnoBWsOrWNWMQTzdaUFgHECBGRvvS9G9bPD1XZXNWUI8i9KxyfNlgqrI8wKNZkqMDym8QgFNWjsUi1O0Wgynl48DmHz2RGQB2FYqXl91kRpPlURsX%2Fgev%2Bqz8rACnrIW7RYL5plE0Kt9xSNE841wZku9WWE8soWAC51r7O3Hekf6bpGfpRut0w9MzurgY6kwK3sHsMYDUtQGobdSORuCsL1XBe7Z5ACS9rk3YZb%2FhAy6QShD1v1zPISacPF%2Bmo6nilSlGuq19ZHma8nnGva4FdT8jymPbknjRMXXOv2LdNNVFOLmUUaUFmZK811TqCyfsPXz%2Fy3u1j0OZc92p6OyYH9yuDthjzUJEKQNnpaKacoJQ4dStADnv5r2eQRP2HBu7Ymqia9o7QZR5%2FW8ici%2BztKdgx87yHxYvnDFgpA41XGrQFpdXVq3BicCPjpLhlzZcgY%2FrPPRpyD%2FI%2BY%2BCwT3gdVVeR8yl%2BHMqdI7JvwzHEPIwThjfrFF8Hg1X74ZWZd07jV%2BcgAOF9%2BOVmTBcqVmY9QxAAE40FmmQjJ7xVHix%2FWDbV5Q%3D%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240225T204654Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5ACZU4IHEN%2F20240225%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=367f959e0ccd394bd1095f932b87b08195826eb7a77ddf21a033076a6b968a94",
       // url: "https://vitessce-data-v2.s3.amazonaws.com/data/redBloodCell.ome.tiff",
        options: {
            offsetsUrl: "https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/LS_20x_5_Stitched.pyramid.offsets.json?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEMX%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJIMEYCIQDwPmavmsQXfJ9YI2nXPoqHPUvD7MqoVi07TloiLtJcxwIhAPJogo4NBOVyut5u5ZsZJ%2By4AmACsmhL6DUXdfL4oBdAKvQDCK7%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQARoMMTM2NTc2NTIyMDQ4Igw01qgJd%2FkxqoFgbPMqyAMncxg8e%2B5gxDRioOMnO5JoXbUPeK64Ut45xH0x1FsH%2BW9mJPzgCLUwcwWO2ZYP2Njf80tiQYqcvgdP8JljJgNlcx7FqdFDElf%2FNtb%2FOX9bQec0mFQIqoxU3iVCZtDdrbvIZECJlDlNnWjkJdo821mI6%2FXxevOpvdGINXUo%2FuvqCCRcyR36DU0POOANukWONWhb0C4WCyGRlqmnDEU6AifUsEQ7hGjHzQNZL3yl%2FsvX3QZV4i4e5IzFB1el%2B7ATYSxqqKHE9ohF2sJnuVCbGg%2FB4Nw3A5KSrjq%2BWD5HICE8mFYQ9bpmGrYrPTjzvInJmoZ6tVwnR%2FCNhAOkpr8u3zpLaBFrzVza%2Fcf9vY2WvJKOAcHCtdwHaCWf4umLANNbvrfbkA9beh896Ed9BnfHliMnqBCrM9zw3DYu6UjQVuNp6thnoBWsOrWNWMQTzdaUFgHECBGRvvS9G9bPD1XZXNWUI8i9KxyfNlgqrI8wKNZkqMDym8QgFNWjsUi1O0Wgynl48DmHz2RGQB2FYqXl91kRpPlURsX%2Fgev%2Bqz8rACnrIW7RYL5plE0Kt9xSNE841wZku9WWE8soWAC51r7O3Hekf6bpGfpRut0w9MzurgY6kwK3sHsMYDUtQGobdSORuCsL1XBe7Z5ACS9rk3YZb%2FhAy6QShD1v1zPISacPF%2Bmo6nilSlGuq19ZHma8nnGva4FdT8jymPbknjRMXXOv2LdNNVFOLmUUaUFmZK811TqCyfsPXz%2Fy3u1j0OZc92p6OyYH9yuDthjzUJEKQNnpaKacoJQ4dStADnv5r2eQRP2HBu7Ymqia9o7QZR5%2FW8ici%2BztKdgx87yHxYvnDFgpA41XGrQFpdXVq3BicCPjpLhlzZcgY%2FrPPRpyD%2FI%2BY%2BCwT3gdVVeR8yl%2BHMqdI7JvwzHEPIwThjfrFF8Hg1X74ZWZd07jV%2BcgAOF9%2BOVmTBcqVmY9QxAAE40FmmQjJ7xVHix%2FWDbV5Q%3D%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240225T204633Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5ACZU4IHEN%2F20240225%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=79ab1ee654b48b3924b15462341618913a2f577271a377c201dff883793aa944",
         //   offsetsUrl: "https://vitessce-data-v2.s3.amazonaws.com/data/redBloodCell.offsets.json",
        },
        coordinationValues: {
            fileUid: 'kidney',
        },
    }).addFile({
        fileType: 'segmentation.glb',
        //url: 'https://vitessce-data-v2.s3.amazonaws.com/data/bloodVessel.glb',
        url: 'https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/glom_surface_export_reduced_draco.glb?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEMX%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJIMEYCIQDwPmavmsQXfJ9YI2nXPoqHPUvD7MqoVi07TloiLtJcxwIhAPJogo4NBOVyut5u5ZsZJ%2By4AmACsmhL6DUXdfL4oBdAKvQDCK7%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQARoMMTM2NTc2NTIyMDQ4Igw01qgJd%2FkxqoFgbPMqyAMncxg8e%2B5gxDRioOMnO5JoXbUPeK64Ut45xH0x1FsH%2BW9mJPzgCLUwcwWO2ZYP2Njf80tiQYqcvgdP8JljJgNlcx7FqdFDElf%2FNtb%2FOX9bQec0mFQIqoxU3iVCZtDdrbvIZECJlDlNnWjkJdo821mI6%2FXxevOpvdGINXUo%2FuvqCCRcyR36DU0POOANukWONWhb0C4WCyGRlqmnDEU6AifUsEQ7hGjHzQNZL3yl%2FsvX3QZV4i4e5IzFB1el%2B7ATYSxqqKHE9ohF2sJnuVCbGg%2FB4Nw3A5KSrjq%2BWD5HICE8mFYQ9bpmGrYrPTjzvInJmoZ6tVwnR%2FCNhAOkpr8u3zpLaBFrzVza%2Fcf9vY2WvJKOAcHCtdwHaCWf4umLANNbvrfbkA9beh896Ed9BnfHliMnqBCrM9zw3DYu6UjQVuNp6thnoBWsOrWNWMQTzdaUFgHECBGRvvS9G9bPD1XZXNWUI8i9KxyfNlgqrI8wKNZkqMDym8QgFNWjsUi1O0Wgynl48DmHz2RGQB2FYqXl91kRpPlURsX%2Fgev%2Bqz8rACnrIW7RYL5plE0Kt9xSNE841wZku9WWE8soWAC51r7O3Hekf6bpGfpRut0w9MzurgY6kwK3sHsMYDUtQGobdSORuCsL1XBe7Z5ACS9rk3YZb%2FhAy6QShD1v1zPISacPF%2Bmo6nilSlGuq19ZHma8nnGva4FdT8jymPbknjRMXXOv2LdNNVFOLmUUaUFmZK811TqCyfsPXz%2Fy3u1j0OZc92p6OyYH9yuDthjzUJEKQNnpaKacoJQ4dStADnv5r2eQRP2HBu7Ymqia9o7QZR5%2FW8ici%2BztKdgx87yHxYvnDFgpA41XGrQFpdXVq3BicCPjpLhlzZcgY%2FrPPRpyD%2FI%2BY%2BCwT3gdVVeR8yl%2BHMqdI7JvwzHEPIwThjfrFF8Hg1X74ZWZd07jV%2BcgAOF9%2BOVmTBcqVmY9QxAAE40FmmQjJ7xVHix%2FWDbV5Q%3D%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240225T204711Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5ACZU4IHEN%2F20240225%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=441e21009f072d531fcf19da3b8b89af5bdbe12eddf32dcfc255ec2d9b34752e',
        coordinationValues: {
            fileUid: 'Cells',
        }
    })

    const spatialThreeView = config.addView(dataset, 'spatialThree');
   // const spatialVolumeView = config.addView(dataset, 'spatialBeta').setProps({ title: 'MIP' });
    const lcView = config.addView(dataset, 'layerControllerBeta');

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

    glomsObsTypeScope.setValue('Cells');
    glomsFeatureTypeScope.setValue('feature');
    glomsFeatureValueTypeScope.setValue('value');
    glomsFeatureSelectionScope.setValue(['Volume']);

    //const [selectionScope, colorScope] = config.addCoordination('obsSetSelection', 'obsSetColor');

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
                        spatialChannelColor: [0, 0, 255],
                        spatialChannelVisible: true,
                        spatialChannelOpacity: 1.0,
                        spatialChannelWindow: [1048,5060],
                    },
                    // {
                    //     spatialTargetC: 1,
                    //     spatialChannelColor: [0, 255, 0],
                    //     spatialChannelVisible: true,
                    //     spatialChannelOpacity: 1.0,
                    //     spatialChannelWindow: [325,721],
                    // },
                    // {
                    //     spatialTargetC: 2,
                    //     spatialChannelColor: [255, 0, 255],
                    //     spatialChannelVisible: true,
                    //     spatialChannelOpacity: 1.0,
                    //     spatialChannelWindow: [463,680],
                    // },
                    // {
                    //     spatialTargetC: 9,
                    //     spatialChannelColor: [255, 0, 0],
                    //     spatialChannelVisible: true,
                    //     spatialChannelOpacity: 1.0,
                    //     spatialChannelWindow: [643,810],
                    // },
                    // {
                    //     spatialTargetC: 4,
                    //     spatialChannelColor: [255, 255, 255],
                    //     spatialChannelVisible: true,
                    //     spatialChannelOpacity: 1.0,
                    //     spatialChannelWindow: [419,2175],
                    // },
                ]),
            },
        ]),
        segmentationLayer: CL([
            {
                fileUid: 'Cells',
                spatialLayerVisible: true,
                spatialLayerOpacity: 1,
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
                    }
                ])
            }
        ])
    });

   // config.layout(hconcat(vconcat(spatialThreeView,spatialVolumeView), vconcat(lcView,obsSetsView, barPlot)));
    config.layout(hconcat(spatialThreeView, vconcat(lcView)));

    const configJSON = config.toJSON();
    return configJSON;
}

export const bloodVessel = generateBloodVesselConfig();
