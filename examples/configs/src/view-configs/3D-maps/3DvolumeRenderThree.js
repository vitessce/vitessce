import {
    VitessceConfig,
    CoordinationLevel as CL,
    hconcat, vconcat,
} from '@vitessce/config';


function generateBlinConfig() {
    const config = new VitessceConfig({
        schemaVersion: '1.0.16',
        name: 'Blin et al., PLoS Biol 2019',
    });
    const dataset = config.addDataset('My dataset').addFile({
        fileType: 'image.ome-tiff',
        url: "https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/LS_20x_5_Stitched.pyramid.ome.tiff?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEKD%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJGMEQCIGKkvlHLTQbZBmPuRav%2FTBOTJ9nvwXs0afzPF5xhf1IgAiAzbucSIsjP8VwjB51iucY23I2%2B4PVirPZpJq3w4OB%2FFyrrAwh5EAEaDDEzNjU3NjUyMjA0OCIMU9UaHieoPWo5L%2BOmKsgD9POzfW5npqWxk9bte9yMrM4VQfuluhrpFy7O%2F7FdqUQZL9OKbTduZWJs16rxT3H%2FHYggExKwCuKXwzOleLrEN6Hh%2Fd2ehDEkMj4wxZUZ97WJn1FNb%2BJCn%2FE%2BKh6RVqNHfezmDUwEcXs2kiyFtS2hCDsT4SON0jYf8o20O1oAYcX5N0Z03jgVkZmlom%2B7rbjqzFZBZo5PTGFSgyjDHoTtGHdvi9QHf4yfG1pJ2aRBAZ%2BBBdTub5o3FnZHQNZ1exxq%2BpFmUHluQ1LEeIqsij5N2OTWPX3MmaM6YLhmX3bd1WoUi8CStircWwo%2BGIa%2F45u7EGNgh5YytVFaBmR0zqQL1pbOshooSVENTADxCBJ2Pz762ikONRL%2BZTkG6r85unLxqal30o2AgVaU7nfYzwKyG2yKl4Nq1fixh1KFTLUeFf2XmL5DiRWc%2BiPwWKLb5eCFWeawPbSVztrdt838lsNbMhUGULnFvi7zfSbt%2F%2F2E0XGynxWnwa1CBVf1W%2FP2UlnUmSbVvmbzZpvBpVHuALhI2Kx9sxl9KrvAwpI7U8U5vG3KW5b5bo4vaC6Nm0KnCrEkdSwexF9OBUP6i6Mk%2FYgsT0JBxucBw0G0MLWgrq4GOpUChTpZToDUGxMdpADJW4ooA1Yc7MQN3DgZjHFSlw6s9XCxw6SEWnQeFYF0Lkd91XgJkJ7P85fZuOSg1CeDz0us4ycxO9sx%2B3eH5jmL8oAvu3TtjqJ56stqqrkwUL9EK3rO4ryGOjbttJk5shsukenW0eZ5WR7arr3EJV58ehL5kJAG0lNsevR8DA9D6%2F1mxyPANkzt%2Bd%2FMIej99vBBgh9w8D4MOXnjnRrTTk4TlksNV2NrrGOHIARkkxRuR%2FMii0OBcHZ48lr%2FJYHw6mGKVoHHQe3xAG2Ed814wQrv2LHd5KgLkVCnIG0IdkSMAd2XEDgJN4Lwt2%2BersqoZSUzL0IgV0OdhhoNxSmwXJKLIksRNy1xXVs9vw%3D%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240213T155308Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5AHWARV4GG%2F20240213%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=0e0632f523c9a8ab5efb679bf95b99b16088e29ec0f5f3592d6e98bab49e5850",
        options: {
            offsetsUrl: "https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/LS_20x_5_Stitched.pyramid.offsets.json?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEKD%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJGMEQCIGKkvlHLTQbZBmPuRav%2FTBOTJ9nvwXs0afzPF5xhf1IgAiAzbucSIsjP8VwjB51iucY23I2%2B4PVirPZpJq3w4OB%2FFyrrAwh5EAEaDDEzNjU3NjUyMjA0OCIMU9UaHieoPWo5L%2BOmKsgD9POzfW5npqWxk9bte9yMrM4VQfuluhrpFy7O%2F7FdqUQZL9OKbTduZWJs16rxT3H%2FHYggExKwCuKXwzOleLrEN6Hh%2Fd2ehDEkMj4wxZUZ97WJn1FNb%2BJCn%2FE%2BKh6RVqNHfezmDUwEcXs2kiyFtS2hCDsT4SON0jYf8o20O1oAYcX5N0Z03jgVkZmlom%2B7rbjqzFZBZo5PTGFSgyjDHoTtGHdvi9QHf4yfG1pJ2aRBAZ%2BBBdTub5o3FnZHQNZ1exxq%2BpFmUHluQ1LEeIqsij5N2OTWPX3MmaM6YLhmX3bd1WoUi8CStircWwo%2BGIa%2F45u7EGNgh5YytVFaBmR0zqQL1pbOshooSVENTADxCBJ2Pz762ikONRL%2BZTkG6r85unLxqal30o2AgVaU7nfYzwKyG2yKl4Nq1fixh1KFTLUeFf2XmL5DiRWc%2BiPwWKLb5eCFWeawPbSVztrdt838lsNbMhUGULnFvi7zfSbt%2F%2F2E0XGynxWnwa1CBVf1W%2FP2UlnUmSbVvmbzZpvBpVHuALhI2Kx9sxl9KrvAwpI7U8U5vG3KW5b5bo4vaC6Nm0KnCrEkdSwexF9OBUP6i6Mk%2FYgsT0JBxucBw0G0MLWgrq4GOpUChTpZToDUGxMdpADJW4ooA1Yc7MQN3DgZjHFSlw6s9XCxw6SEWnQeFYF0Lkd91XgJkJ7P85fZuOSg1CeDz0us4ycxO9sx%2B3eH5jmL8oAvu3TtjqJ56stqqrkwUL9EK3rO4ryGOjbttJk5shsukenW0eZ5WR7arr3EJV58ehL5kJAG0lNsevR8DA9D6%2F1mxyPANkzt%2Bd%2FMIej99vBBgh9w8D4MOXnjnRrTTk4TlksNV2NrrGOHIARkkxRuR%2FMii0OBcHZ48lr%2FJYHw6mGKVoHHQe3xAG2Ed814wQrv2LHd5KgLkVCnIG0IdkSMAd2XEDgJN4Lwt2%2BersqoZSUzL0IgV0OdhhoNxSmwXJKLIksRNy1xXVs9vw%3D%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240213T155257Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5AHWARV4GG%2F20240213%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=62d38c554dac42eef20689552c5b0687450850dedcc481802fb00a5e757c267a",
        },
        coordinationValues: {
            fileUid: 'kidney',
        },
    }).addFile({
        fileType: 'segmentation.glb',
        url: 'https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/glom_surface_export_reduced_draco.glb?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEKD%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJGMEQCIGKkvlHLTQbZBmPuRav%2FTBOTJ9nvwXs0afzPF5xhf1IgAiAzbucSIsjP8VwjB51iucY23I2%2B4PVirPZpJq3w4OB%2FFyrrAwh5EAEaDDEzNjU3NjUyMjA0OCIMU9UaHieoPWo5L%2BOmKsgD9POzfW5npqWxk9bte9yMrM4VQfuluhrpFy7O%2F7FdqUQZL9OKbTduZWJs16rxT3H%2FHYggExKwCuKXwzOleLrEN6Hh%2Fd2ehDEkMj4wxZUZ97WJn1FNb%2BJCn%2FE%2BKh6RVqNHfezmDUwEcXs2kiyFtS2hCDsT4SON0jYf8o20O1oAYcX5N0Z03jgVkZmlom%2B7rbjqzFZBZo5PTGFSgyjDHoTtGHdvi9QHf4yfG1pJ2aRBAZ%2BBBdTub5o3FnZHQNZ1exxq%2BpFmUHluQ1LEeIqsij5N2OTWPX3MmaM6YLhmX3bd1WoUi8CStircWwo%2BGIa%2F45u7EGNgh5YytVFaBmR0zqQL1pbOshooSVENTADxCBJ2Pz762ikONRL%2BZTkG6r85unLxqal30o2AgVaU7nfYzwKyG2yKl4Nq1fixh1KFTLUeFf2XmL5DiRWc%2BiPwWKLb5eCFWeawPbSVztrdt838lsNbMhUGULnFvi7zfSbt%2F%2F2E0XGynxWnwa1CBVf1W%2FP2UlnUmSbVvmbzZpvBpVHuALhI2Kx9sxl9KrvAwpI7U8U5vG3KW5b5bo4vaC6Nm0KnCrEkdSwexF9OBUP6i6Mk%2FYgsT0JBxucBw0G0MLWgrq4GOpUChTpZToDUGxMdpADJW4ooA1Yc7MQN3DgZjHFSlw6s9XCxw6SEWnQeFYF0Lkd91XgJkJ7P85fZuOSg1CeDz0us4ycxO9sx%2B3eH5jmL8oAvu3TtjqJ56stqqrkwUL9EK3rO4ryGOjbttJk5shsukenW0eZ5WR7arr3EJV58ehL5kJAG0lNsevR8DA9D6%2F1mxyPANkzt%2Bd%2FMIej99vBBgh9w8D4MOXnjnRrTTk4TlksNV2NrrGOHIARkkxRuR%2FMii0OBcHZ48lr%2FJYHw6mGKVoHHQe3xAG2Ed814wQrv2LHd5KgLkVCnIG0IdkSMAd2XEDgJN4Lwt2%2BersqoZSUzL0IgV0OdhhoNxSmwXJKLIksRNy1xXVs9vw%3D%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240213T155241Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5AHWARV4GG%2F20240213%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=756c7ad5369fa0577c3c833685218f5a88b15f82e3a790ab2b3a0db4e69c1c75',
        //url: 'https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/decimated_gloms_compressed.glb?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEG8aCXVzLWVhc3QtMSJHMEUCIA2Q%2Fp9LxB9UTweIRo3872hd6H61tdxin3i%2FZcog1EzzAiEA7stLCc7SlEFB176gd%2FylwciIsA%2BZwULlx9iqlXuzXR0q6wMISBABGgwxMzY1NzY1MjIwNDgiDOzEorsai8EMG94NyyrIA2%2BcUSRI%2BMjhYdO7hWgBVu8d8J2RlBJXA7a2Ow06yew92mupimlmofKWm04pgjAAncK%2FSz2h2c5Rd93Hj7u1Hjc%2ByXgwGmRG9l7ipmcMuz2HqLZN6AMSnuCgEUFqgKVc8JaerkTyzxwlubXNimDYxzL%2FqzN7JNC0NiKz4nKU6Xhv6tLLg4s24S2V4AisZ8%2F3T6u6%2BSsWtMUf8nb%2FeXMvhjhyVYJcTeuaZgxOcq%2BBiyu0uzMRDst2haSTieiwaTt%2F7e%2BkpoGIMhGvrABD%2BHku4Vs89fWP%2BT0XwOVCytWy1eNGOysQAaiJOszpFvi09yT73vPTgpkn8H%2BD1MtWL3ey1D8%2FNislK4RMQSZ8k9Tj341iqVTGw%2FSu0iuEcy4O9m07k9YYhojaCdcpngb59n2xBFYDyg4rcCiGd3CPbzMCWeWijrFc9yI1qMRZbScZm5igpIs0cvlY%2B3sKl2jbjQ7I5H4jXNVrdeRpf7SZGbGPrg5JGiDQBeRhmncCNd885fSXvc9cW3bwDAJfVZv2rlAXYztQoB66aQXUCvGymXsDgxG5tfuD4CZSZe9opRxHhO3x47snAhk6yPNcLb9Atzx7M4JKOoqUSTED%2BjDTs6OuBjqUAkg5FsqMY5bznmtJUlMlpG9JTpZygZEUty90xm0O6eggNggG%2FMfTxxtiIY47%2FsZ%2FMvojyjOkjjZvR7r4LMAsDo8SuhiXj55JwpRA11IPHbNqcqmVZrkHfqtvrgHmb%2FQ17VUgFPZrDzNKfVhigzJAFn5C7rXEcAXSENUSMdCHmtcbQC5Yt6KLxYhcCTLJThsabqX6KFS0wKpLs8k3XR1OhE9mIf70HuNNh9EH5IHrxSX26HZjpV%2BeQDyGtUOH3m5IBAZfp2VHEiTrl3D%2BHZ8u36Nqj6LZbncHf4GszPccKcGp5h59wJ4vnitFeOZ3EMvAYM%2BspTDkNS0W4bs0iJtbusb1kWKAwiQMidub%2FXQmXgrcrXFKEA%3D%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240211T144242Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43199&X-Amz-Credential=ASIAR7TEYK5AIMGLC6UY%2F20240211%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=093c2eac3f14fbc1068d14fd062985408a8b7b1c5cddb0c5f6581c654a5bb161',
        coordinationValues: {
            fileUid: 'gloms',
        }
    }).addFile({
        fileType: 'obsFeatureMatrix.csv',
        url: 'https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/statistics.csv?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEKD%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJGMEQCIGKkvlHLTQbZBmPuRav%2FTBOTJ9nvwXs0afzPF5xhf1IgAiAzbucSIsjP8VwjB51iucY23I2%2B4PVirPZpJq3w4OB%2FFyrrAwh5EAEaDDEzNjU3NjUyMjA0OCIMU9UaHieoPWo5L%2BOmKsgD9POzfW5npqWxk9bte9yMrM4VQfuluhrpFy7O%2F7FdqUQZL9OKbTduZWJs16rxT3H%2FHYggExKwCuKXwzOleLrEN6Hh%2Fd2ehDEkMj4wxZUZ97WJn1FNb%2BJCn%2FE%2BKh6RVqNHfezmDUwEcXs2kiyFtS2hCDsT4SON0jYf8o20O1oAYcX5N0Z03jgVkZmlom%2B7rbjqzFZBZo5PTGFSgyjDHoTtGHdvi9QHf4yfG1pJ2aRBAZ%2BBBdTub5o3FnZHQNZ1exxq%2BpFmUHluQ1LEeIqsij5N2OTWPX3MmaM6YLhmX3bd1WoUi8CStircWwo%2BGIa%2F45u7EGNgh5YytVFaBmR0zqQL1pbOshooSVENTADxCBJ2Pz762ikONRL%2BZTkG6r85unLxqal30o2AgVaU7nfYzwKyG2yKl4Nq1fixh1KFTLUeFf2XmL5DiRWc%2BiPwWKLb5eCFWeawPbSVztrdt838lsNbMhUGULnFvi7zfSbt%2F%2F2E0XGynxWnwa1CBVf1W%2FP2UlnUmSbVvmbzZpvBpVHuALhI2Kx9sxl9KrvAwpI7U8U5vG3KW5b5bo4vaC6Nm0KnCrEkdSwexF9OBUP6i6Mk%2FYgsT0JBxucBw0G0MLWgrq4GOpUChTpZToDUGxMdpADJW4ooA1Yc7MQN3DgZjHFSlw6s9XCxw6SEWnQeFYF0Lkd91XgJkJ7P85fZuOSg1CeDz0us4ycxO9sx%2B3eH5jmL8oAvu3TtjqJ56stqqrkwUL9EK3rO4ryGOjbttJk5shsukenW0eZ5WR7arr3EJV58ehL5kJAG0lNsevR8DA9D6%2F1mxyPANkzt%2Bd%2FMIej99vBBgh9w8D4MOXnjnRrTTk4TlksNV2NrrGOHIARkkxRuR%2FMii0OBcHZ48lr%2FJYHw6mGKVoHHQe3xAG2Ed814wQrv2LHd5KgLkVCnIG0IdkSMAd2XEDgJN4Lwt2%2BersqoZSUzL0IgV0OdhhoNxSmwXJKLIksRNy1xXVs9vw%3D%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240213T155324Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5AHWARV4GG%2F20240213%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=4bc2dcc8eedd0ff513a6cecfa6bc579df6565098fc2cb056127bfd02f7141f88',
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

export const blinOop2019Three = generateBlinConfig();
