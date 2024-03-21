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
        url: 'https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/LS_20x_5_Stitched.pyramid.ome.tiff?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEAUaCXVzLWVhc3QtMSJHMEUCIQDJ2OyUI%2BhajSeW5YhP0iOGY5HWAFOjNshstMkufe6Z7gIgFzhHl9gUzMj4jrX%2BJwVVvNeFc0o9pV3XL%2Fg5GyQriAMq7AMIHhABGgwxMzY1NzY1MjIwNDgiDOaqQBYgmcsZrbUVNCrJAwC1mAk9JPU%2FyIRORY%2Bf3witBWMbYQEzJXAbto7ACJLsu9UvcvIjNF86FoYqyA0MP7XMu0Ur4Jbpypiq4swOrUeG0gyjuWBpWpiHumtEk74C6%2B2Wwt3o8l7SPeHfNsHy5w8%2FFHD7xrjCtrjboKElZfoQ5LiT4S3q%2Bm8SsIHicKG3fKFKZKFIvR%2B6npkGFs8ou3X5%2F0%2B0MQgNvMt8nCU7o7W43O6LyYxDKqUw5MwMAHsO0M%2BNUsQkSpvCIAClfSf%2BlJFcE7f6Um%2Bc%2BX9GZKK%2FHjJpnmQWW3g4IFw03tQ89Ph1oZuzj3lQCRXg0L0IwJUB2VTtoFe1AKnQfNKZUViMjy7eqWEw%2FzgHQ98SJIXgKQMxcfWEqK7rG7zBcdhRbVPs9pGVsUXz4PwA2ZMiZ9Wv3fIoibJueqv3BO2CwNPnQ3sqFdbLz9a0WxGdin01gcB6PymiDCM8QTD9RcZ9AlHDVPP0xp74GBcNyPDhZucMFK7dE6fyMDOxJfD%2BrbzLItF%2BOaVlf%2BQnzq8eJBGLvfyx0BDrIGPGUoQa%2BgIYmKtg1rLNBYL1nA4XoSB6Sk37nYZEOcxwCOC7AjFm%2Bz61fAnzYkmItLQLk0%2Fdvu8w%2F5jtrwY6lAKSsG7BdyhIhIFvzTEQSi3lgnCz1XQ2b5c3oXCfTgWEuszdHi4juykYd%2FckIBNgt08i4MwpG3OxgNjkhZAyiiqiXVp4stO0YReMxRKK6eg0YyJI7XWF7apcxnUDNWxAIBb2yAA70QAJuxVIwbluxjRwT1rLZ7IdUP1b2DdYnaytKuH5BhE7b8T7gZg4hOOz1CmGdznPzOTOYvF7yfjkofSYm6xCcO59KS4UcMNPqg6lV8B34XSSsEqkMyBvdJm8586vfYz0hQURUOZI1kowURq1Q%2BN%2FkqrwgwHY5MChDBjho%2FO7xkWIY12X04QXLk2FHrWvqeutcViwqW1izz4V0cnjvk5B41EeLDRi1otXlQH3oTP9Xcg%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240320T205335Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5ACG3DSSX3%2F20240320%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=d7196179ac180220aec205331f3836c971a8dd113faace4257ee1bfa3684b8b3',
        options: {
            offsetsUrl: 'https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/LS_20x_5_Stitched.pyramid.offsets.json?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEAUaCXVzLWVhc3QtMSJHMEUCIQDJ2OyUI%2BhajSeW5YhP0iOGY5HWAFOjNshstMkufe6Z7gIgFzhHl9gUzMj4jrX%2BJwVVvNeFc0o9pV3XL%2Fg5GyQriAMq7AMIHhABGgwxMzY1NzY1MjIwNDgiDOaqQBYgmcsZrbUVNCrJAwC1mAk9JPU%2FyIRORY%2Bf3witBWMbYQEzJXAbto7ACJLsu9UvcvIjNF86FoYqyA0MP7XMu0Ur4Jbpypiq4swOrUeG0gyjuWBpWpiHumtEk74C6%2B2Wwt3o8l7SPeHfNsHy5w8%2FFHD7xrjCtrjboKElZfoQ5LiT4S3q%2Bm8SsIHicKG3fKFKZKFIvR%2B6npkGFs8ou3X5%2F0%2B0MQgNvMt8nCU7o7W43O6LyYxDKqUw5MwMAHsO0M%2BNUsQkSpvCIAClfSf%2BlJFcE7f6Um%2Bc%2BX9GZKK%2FHjJpnmQWW3g4IFw03tQ89Ph1oZuzj3lQCRXg0L0IwJUB2VTtoFe1AKnQfNKZUViMjy7eqWEw%2FzgHQ98SJIXgKQMxcfWEqK7rG7zBcdhRbVPs9pGVsUXz4PwA2ZMiZ9Wv3fIoibJueqv3BO2CwNPnQ3sqFdbLz9a0WxGdin01gcB6PymiDCM8QTD9RcZ9AlHDVPP0xp74GBcNyPDhZucMFK7dE6fyMDOxJfD%2BrbzLItF%2BOaVlf%2BQnzq8eJBGLvfyx0BDrIGPGUoQa%2BgIYmKtg1rLNBYL1nA4XoSB6Sk37nYZEOcxwCOC7AjFm%2Bz61fAnzYkmItLQLk0%2Fdvu8w%2F5jtrwY6lAKSsG7BdyhIhIFvzTEQSi3lgnCz1XQ2b5c3oXCfTgWEuszdHi4juykYd%2FckIBNgt08i4MwpG3OxgNjkhZAyiiqiXVp4stO0YReMxRKK6eg0YyJI7XWF7apcxnUDNWxAIBb2yAA70QAJuxVIwbluxjRwT1rLZ7IdUP1b2DdYnaytKuH5BhE7b8T7gZg4hOOz1CmGdznPzOTOYvF7yfjkofSYm6xCcO59KS4UcMNPqg6lV8B34XSSsEqkMyBvdJm8586vfYz0hQURUOZI1kowURq1Q%2BN%2FkqrwgwHY5MChDBjho%2FO7xkWIY12X04QXLk2FHrWvqeutcViwqW1izz4V0cnjvk5B41EeLDRi1otXlQH3oTP9Xcg%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240320T205357Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5ACG3DSSX3%2F20240320%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=73f793d0ce21f312a361bea3a9c86d8095d40d097522bc10f23bf8d0c3f881be',
        },
        coordinationValues: {
            fileUid: 'kidney',
        },
    }).addFile({
        fileType: 'segmentation.glb',
        url: 'https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/decimated.glb?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEAUaCXVzLWVhc3QtMSJHMEUCIQDJ2OyUI%2BhajSeW5YhP0iOGY5HWAFOjNshstMkufe6Z7gIgFzhHl9gUzMj4jrX%2BJwVVvNeFc0o9pV3XL%2Fg5GyQriAMq7AMIHhABGgwxMzY1NzY1MjIwNDgiDOaqQBYgmcsZrbUVNCrJAwC1mAk9JPU%2FyIRORY%2Bf3witBWMbYQEzJXAbto7ACJLsu9UvcvIjNF86FoYqyA0MP7XMu0Ur4Jbpypiq4swOrUeG0gyjuWBpWpiHumtEk74C6%2B2Wwt3o8l7SPeHfNsHy5w8%2FFHD7xrjCtrjboKElZfoQ5LiT4S3q%2Bm8SsIHicKG3fKFKZKFIvR%2B6npkGFs8ou3X5%2F0%2B0MQgNvMt8nCU7o7W43O6LyYxDKqUw5MwMAHsO0M%2BNUsQkSpvCIAClfSf%2BlJFcE7f6Um%2Bc%2BX9GZKK%2FHjJpnmQWW3g4IFw03tQ89Ph1oZuzj3lQCRXg0L0IwJUB2VTtoFe1AKnQfNKZUViMjy7eqWEw%2FzgHQ98SJIXgKQMxcfWEqK7rG7zBcdhRbVPs9pGVsUXz4PwA2ZMiZ9Wv3fIoibJueqv3BO2CwNPnQ3sqFdbLz9a0WxGdin01gcB6PymiDCM8QTD9RcZ9AlHDVPP0xp74GBcNyPDhZucMFK7dE6fyMDOxJfD%2BrbzLItF%2BOaVlf%2BQnzq8eJBGLvfyx0BDrIGPGUoQa%2BgIYmKtg1rLNBYL1nA4XoSB6Sk37nYZEOcxwCOC7AjFm%2Bz61fAnzYkmItLQLk0%2Fdvu8w%2F5jtrwY6lAKSsG7BdyhIhIFvzTEQSi3lgnCz1XQ2b5c3oXCfTgWEuszdHi4juykYd%2FckIBNgt08i4MwpG3OxgNjkhZAyiiqiXVp4stO0YReMxRKK6eg0YyJI7XWF7apcxnUDNWxAIBb2yAA70QAJuxVIwbluxjRwT1rLZ7IdUP1b2DdYnaytKuH5BhE7b8T7gZg4hOOz1CmGdznPzOTOYvF7yfjkofSYm6xCcO59KS4UcMNPqg6lV8B34XSSsEqkMyBvdJm8586vfYz0hQURUOZI1kowURq1Q%2BN%2FkqrwgwHY5MChDBjho%2FO7xkWIY12X04QXLk2FHrWvqeutcViwqW1izz4V0cnjvk5B41EeLDRi1otXlQH3oTP9Xcg%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240320T205414Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5ACG3DSSX3%2F20240320%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=188d2867254621ceaa96d8914bafcb16289af39449f6437628353b7d228e898d',
        coordinationValues: {
            fileUid: 'gloms',
        }
    }).addFile({
        fileType: 'obsFeatureMatrix.csv',
        url: 'https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/statistics.csv?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEAUaCXVzLWVhc3QtMSJHMEUCIQDJ2OyUI%2BhajSeW5YhP0iOGY5HWAFOjNshstMkufe6Z7gIgFzhHl9gUzMj4jrX%2BJwVVvNeFc0o9pV3XL%2Fg5GyQriAMq7AMIHhABGgwxMzY1NzY1MjIwNDgiDOaqQBYgmcsZrbUVNCrJAwC1mAk9JPU%2FyIRORY%2Bf3witBWMbYQEzJXAbto7ACJLsu9UvcvIjNF86FoYqyA0MP7XMu0Ur4Jbpypiq4swOrUeG0gyjuWBpWpiHumtEk74C6%2B2Wwt3o8l7SPeHfNsHy5w8%2FFHD7xrjCtrjboKElZfoQ5LiT4S3q%2Bm8SsIHicKG3fKFKZKFIvR%2B6npkGFs8ou3X5%2F0%2B0MQgNvMt8nCU7o7W43O6LyYxDKqUw5MwMAHsO0M%2BNUsQkSpvCIAClfSf%2BlJFcE7f6Um%2Bc%2BX9GZKK%2FHjJpnmQWW3g4IFw03tQ89Ph1oZuzj3lQCRXg0L0IwJUB2VTtoFe1AKnQfNKZUViMjy7eqWEw%2FzgHQ98SJIXgKQMxcfWEqK7rG7zBcdhRbVPs9pGVsUXz4PwA2ZMiZ9Wv3fIoibJueqv3BO2CwNPnQ3sqFdbLz9a0WxGdin01gcB6PymiDCM8QTD9RcZ9AlHDVPP0xp74GBcNyPDhZucMFK7dE6fyMDOxJfD%2BrbzLItF%2BOaVlf%2BQnzq8eJBGLvfyx0BDrIGPGUoQa%2BgIYmKtg1rLNBYL1nA4XoSB6Sk37nYZEOcxwCOC7AjFm%2Bz61fAnzYkmItLQLk0%2Fdvu8w%2F5jtrwY6lAKSsG7BdyhIhIFvzTEQSi3lgnCz1XQ2b5c3oXCfTgWEuszdHi4juykYd%2FckIBNgt08i4MwpG3OxgNjkhZAyiiqiXVp4stO0YReMxRKK6eg0YyJI7XWF7apcxnUDNWxAIBb2yAA70QAJuxVIwbluxjRwT1rLZ7IdUP1b2DdYnaytKuH5BhE7b8T7gZg4hOOz1CmGdznPzOTOYvF7yfjkofSYm6xCcO59KS4UcMNPqg6lV8B34XSSsEqkMyBvdJm8586vfYz0hQURUOZI1kowURq1Q%2BN%2FkqrwgwHY5MChDBjho%2FO7xkWIY12X04QXLk2FHrWvqeutcViwqW1izz4V0cnjvk5B41EeLDRi1otXlQH3oTP9Xcg%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240320T205429Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5ACG3DSSX3%2F20240320%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=a91831564000bedaad293d9c682089ef9dde6a505bc08b5be2f44f0014eafbad',
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
