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
        url: "https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/LS_20x_5_Stitched.pyramid.ome.tiff?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEMr%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIECLKJefvVOofvzKBzEATtoANgb7jwk%2BRNeyccUHz0qHAiEAsFXVjiT0JRufSI%2F7TOPLwOEdpDni69M4kbGx4rYEKrQq9AMIsv%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARABGgwxMzY1NzY1MjIwNDgiDJB9FhFoPFoIM%2BlAUirIA6keSgNWqcSoV0jBZ2VcEFziDgOSj8ranfMO9U3CJnmDhQBIbhTJvP7XbNwjhCy8rq7K2B%2FBfts%2BwB6O1TJ%2BUDmfoBzejW%2BmuVxsbzbGfWDL0WWBoaP3S7ofWcIid7BV5PcHubNON0TDNsC9avxFOsXz5YaNblFsAY8Qqou5J19murZ5dI34ACHu3fNVwiosyIs2wy588fuUxaP8DtsFDRcSbl%2BHdwmEz8SFKZJiXBMqW5C9fFkv2yUpud%2F%2Bg2u5IAU5HXKEQcoFuBXG4RxqHJKN3MVd%2FdbHp%2Fiy3noGSUXlVxxBEV4Q1yJGIcnBy6FEM0pQUb%2Bk9nfix3dnAIpZJzaA9nw9Di5%2Bg4wzOEl79%2FVsddB7n1%2FKWcW%2Bg%2FOiANXrwbeHXwdAamTnMpyDMiMZ2gM0NYhkXX4PQmxpEEL5uQPuMYuRuafzhc7BQapPI96Fuh8hcCrWAKPG%2FZq%2Btnxpo%2BoJuaW8Bni%2BeVpEjxkpPWpUdM6RPUr2JVMZ1EgfiLnFzQOn5AkAAiVu%2FuDacPaxfWr41Ma7KkyTS4kTPAsyX%2Bvyd%2BKCkg%2B%2Fahtr%2Fg7wO061qBOFsuG576%2F0ZLd9Xui2AT%2FA%2F9mMRiK4aTDbzu%2BuBjqUAs62%2Bx56QjFGhoV0P4zVFo4R1kje%2F3vxp0DnR63xi4oNMbgffKA535ss0%2FQ5p895RWdiftaRilWJXC1DhqF4CaHFUwhGsuV6X8uXSVZ8cS8CgAiA7o1V05u0U5mVdyYjPAFsTSIEcmmkKii%2B4BAbsSpjefQZ7qJqpyQJOdWB7UAvu9yxBLc0nZoK5rv6N%2BhbK0expw%2BNkqkhwRiqEKHn%2FkvWB4I6QeiJg5mxpLkXDT%2B9rHgRvp5sqQR%2BEivv%2BGIxLJSt%2FozjuInHC%2B8P8mkXXqGJZbXKyEchr0mq1x%2BeROKeS6TagB5L5VSAoO2X6oqFjLidisgjbN%2FezCxg9mB%2Ftx0kt7oXVEAWifsEhaDwgXq5k6eYxg%3D%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240226T012120Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5APCXHTYHG%2F20240226%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=2f92b2a01461ce9b00a9086b3a7445008df4b2522aed03bf7f2040c032923bb2",
       // url: "https://vitessce-data-v2.s3.amazonaws.com/data/redBloodCell.ome.tiff",
        options: {
            offsetsUrl: "https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/LS_20x_5_Stitched.pyramid.offsets.json?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEMr%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIECLKJefvVOofvzKBzEATtoANgb7jwk%2BRNeyccUHz0qHAiEAsFXVjiT0JRufSI%2F7TOPLwOEdpDni69M4kbGx4rYEKrQq9AMIsv%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARABGgwxMzY1NzY1MjIwNDgiDJB9FhFoPFoIM%2BlAUirIA6keSgNWqcSoV0jBZ2VcEFziDgOSj8ranfMO9U3CJnmDhQBIbhTJvP7XbNwjhCy8rq7K2B%2FBfts%2BwB6O1TJ%2BUDmfoBzejW%2BmuVxsbzbGfWDL0WWBoaP3S7ofWcIid7BV5PcHubNON0TDNsC9avxFOsXz5YaNblFsAY8Qqou5J19murZ5dI34ACHu3fNVwiosyIs2wy588fuUxaP8DtsFDRcSbl%2BHdwmEz8SFKZJiXBMqW5C9fFkv2yUpud%2F%2Bg2u5IAU5HXKEQcoFuBXG4RxqHJKN3MVd%2FdbHp%2Fiy3noGSUXlVxxBEV4Q1yJGIcnBy6FEM0pQUb%2Bk9nfix3dnAIpZJzaA9nw9Di5%2Bg4wzOEl79%2FVsddB7n1%2FKWcW%2Bg%2FOiANXrwbeHXwdAamTnMpyDMiMZ2gM0NYhkXX4PQmxpEEL5uQPuMYuRuafzhc7BQapPI96Fuh8hcCrWAKPG%2FZq%2Btnxpo%2BoJuaW8Bni%2BeVpEjxkpPWpUdM6RPUr2JVMZ1EgfiLnFzQOn5AkAAiVu%2FuDacPaxfWr41Ma7KkyTS4kTPAsyX%2Bvyd%2BKCkg%2B%2Fahtr%2Fg7wO061qBOFsuG576%2F0ZLd9Xui2AT%2FA%2F9mMRiK4aTDbzu%2BuBjqUAs62%2Bx56QjFGhoV0P4zVFo4R1kje%2F3vxp0DnR63xi4oNMbgffKA535ss0%2FQ5p895RWdiftaRilWJXC1DhqF4CaHFUwhGsuV6X8uXSVZ8cS8CgAiA7o1V05u0U5mVdyYjPAFsTSIEcmmkKii%2B4BAbsSpjefQZ7qJqpyQJOdWB7UAvu9yxBLc0nZoK5rv6N%2BhbK0expw%2BNkqkhwRiqEKHn%2FkvWB4I6QeiJg5mxpLkXDT%2B9rHgRvp5sqQR%2BEivv%2BGIxLJSt%2FozjuInHC%2B8P8mkXXqGJZbXKyEchr0mq1x%2BeROKeS6TagB5L5VSAoO2X6oqFjLidisgjbN%2FezCxg9mB%2Ftx0kt7oXVEAWifsEhaDwgXq5k6eYxg%3D%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240226T012105Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5APCXHTYHG%2F20240226%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=964633d1ae12acf29a3fef287d8508ad0f980d6b013fe44589af71990a44b36b",
         //   offsetsUrl: "https://vitessce-data-v2.s3.amazonaws.com/data/redBloodCell.offsets.json",
        },
        coordinationValues: {
            fileUid: 'kidney',
        },
    }).addFile({
        fileType: 'segmentation.glb',
        //url: 'https://vitessce-data-v2.s3.amazonaws.com/data/bloodVessel.glb',
        url: 'https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/glom_surface_export_reduced_draco.glb?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEMr%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIECLKJefvVOofvzKBzEATtoANgb7jwk%2BRNeyccUHz0qHAiEAsFXVjiT0JRufSI%2F7TOPLwOEdpDni69M4kbGx4rYEKrQq9AMIsv%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARABGgwxMzY1NzY1MjIwNDgiDJB9FhFoPFoIM%2BlAUirIA6keSgNWqcSoV0jBZ2VcEFziDgOSj8ranfMO9U3CJnmDhQBIbhTJvP7XbNwjhCy8rq7K2B%2FBfts%2BwB6O1TJ%2BUDmfoBzejW%2BmuVxsbzbGfWDL0WWBoaP3S7ofWcIid7BV5PcHubNON0TDNsC9avxFOsXz5YaNblFsAY8Qqou5J19murZ5dI34ACHu3fNVwiosyIs2wy588fuUxaP8DtsFDRcSbl%2BHdwmEz8SFKZJiXBMqW5C9fFkv2yUpud%2F%2Bg2u5IAU5HXKEQcoFuBXG4RxqHJKN3MVd%2FdbHp%2Fiy3noGSUXlVxxBEV4Q1yJGIcnBy6FEM0pQUb%2Bk9nfix3dnAIpZJzaA9nw9Di5%2Bg4wzOEl79%2FVsddB7n1%2FKWcW%2Bg%2FOiANXrwbeHXwdAamTnMpyDMiMZ2gM0NYhkXX4PQmxpEEL5uQPuMYuRuafzhc7BQapPI96Fuh8hcCrWAKPG%2FZq%2Btnxpo%2BoJuaW8Bni%2BeVpEjxkpPWpUdM6RPUr2JVMZ1EgfiLnFzQOn5AkAAiVu%2FuDacPaxfWr41Ma7KkyTS4kTPAsyX%2Bvyd%2BKCkg%2B%2Fahtr%2Fg7wO061qBOFsuG576%2F0ZLd9Xui2AT%2FA%2F9mMRiK4aTDbzu%2BuBjqUAs62%2Bx56QjFGhoV0P4zVFo4R1kje%2F3vxp0DnR63xi4oNMbgffKA535ss0%2FQ5p895RWdiftaRilWJXC1DhqF4CaHFUwhGsuV6X8uXSVZ8cS8CgAiA7o1V05u0U5mVdyYjPAFsTSIEcmmkKii%2B4BAbsSpjefQZ7qJqpyQJOdWB7UAvu9yxBLc0nZoK5rv6N%2BhbK0expw%2BNkqkhwRiqEKHn%2FkvWB4I6QeiJg5mxpLkXDT%2B9rHgRvp5sqQR%2BEivv%2BGIxLJSt%2FozjuInHC%2B8P8mkXXqGJZbXKyEchr0mq1x%2BeROKeS6TagB5L5VSAoO2X6oqFjLidisgjbN%2FezCxg9mB%2Ftx0kt7oXVEAWifsEhaDwgXq5k6eYxg%3D%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240226T012050Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5APCXHTYHG%2F20240226%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=d6efea9397ba3ba5d42956c315a8e0f7867224b7754a5b083e47468cc543bc82',
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
