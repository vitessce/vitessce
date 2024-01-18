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
        url: "https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/LS_20x_5_Stitched.pyramid.ome.tiff?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEC8aCXVzLWVhc3QtMSJIMEYCIQD5rXLQ%2BHiUpgwAgfYJhY96P2E0gjPSHJtbSRMzjU76yAIhAM2VJzTqCDCZNN0BlOt5uTY2AEHgixZnm1c1D5h6enGMKvQDCNf%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQARoMMTM2NTc2NTIyMDQ4IgwpNoXCB10ciDhCbdcqyAN9SpZG62aeBxb%2BTEIC%2FZzMIdHhl66mZhFKv75%2BcMkT3TM5yF7bMRXFNoN0aGdtMxl8tXt8ytXdIuPVyK%2FS3ipF8L1T465OmCMxHDyA7hqw6goEjSZoGhSr%2FpXHRlNbq2%2BDf2%2FihS6Y6wd46nxhJdGtsmeuI6IwC6Z7a3kpVuAK3ReNBsLk4NugOhk5FWb%2BBnwZmkJvslWPKOxZWYjXffFbhg4Ai1njGW4mmHWfIQUJkOVG%2FEFoP%2F5eeuW2sdBBJQ2y3Bh2Cewc59tte%2FHwtCXsIvcfzAQQjQm4Gq7rUjyg0oGUBdVeO51aLUiCRj0vaYoVSHV3p%2FI2Shtwkk9aFdLlEOZp1FvLQu3JClqQQtbDwtRqiS0mZhfv2S2Sbj0HkhZy7oWn6srnRhcJXJWKthnVJW9tpVmipmpyCGAF8x0%2FFpc407sJlHfWtoNNDhrhSZ8EdM25%2BhKzdXU91GJRU%2F%2BGJaWIsvTXbMnbuVz6tM4f3NZDfv7jhZ1wY6L7gxIpYKRfEwtt4cng8ypUDyT%2FRp%2BBicLpej2CthEVmQ17NIH%2BBBq5V412puUs9711%2F%2Bm4lawKRvHdaRCxiA%2BC0GXgY6GvwxBniN6rjAYw%2B%2BWkrQY6kwIMN2kii7z%2F%2B2sGuN9jnHdUqSwMjnNAX1GkI2PcmaZzJzLzGnzDgy%2B0i3gkTBaifC3r7H0TGEajNpHr3k4aq%2F3aLchYMhHZ4kTKZhtaW3tJs1%2FWhHKUnesGzyvFQFTeXl9t8hLka07QOevEtNy38eB8eusIIKLIwvQd4xuntaGtttm18tbFh6oP7Sbyw02gIkYcbjPQVNhKJ9BHhj%2BdgfK72xMeolK5IlmYNUXWwrOsQk5Lh7AL0h77cf14gLcVP1spMJvXuzs4qymf1Miy%2F7j3JNR5pCpkabR%2BChTDKX%2Blg7iuLpvv4rhcuZUwDBGOlhM7ANOYTQqG%2BpEis4sgQbq%2B1EMocaNOtnP72mqBZI3aQ%2BSejg%3D%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240118T141823Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5AJ6KPN6O5%2F20240118%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=075b3fc3c26c65ab228511aaab43f07a3a5f0de38bf59c14b450dfcc5758c18d",
        options: {
            offsetsUrl: "https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/LS_20x_5_Stitched.pyramid.offsets.json?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEC8aCXVzLWVhc3QtMSJIMEYCIQD5rXLQ%2BHiUpgwAgfYJhY96P2E0gjPSHJtbSRMzjU76yAIhAM2VJzTqCDCZNN0BlOt5uTY2AEHgixZnm1c1D5h6enGMKvQDCNf%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQARoMMTM2NTc2NTIyMDQ4IgwpNoXCB10ciDhCbdcqyAN9SpZG62aeBxb%2BTEIC%2FZzMIdHhl66mZhFKv75%2BcMkT3TM5yF7bMRXFNoN0aGdtMxl8tXt8ytXdIuPVyK%2FS3ipF8L1T465OmCMxHDyA7hqw6goEjSZoGhSr%2FpXHRlNbq2%2BDf2%2FihS6Y6wd46nxhJdGtsmeuI6IwC6Z7a3kpVuAK3ReNBsLk4NugOhk5FWb%2BBnwZmkJvslWPKOxZWYjXffFbhg4Ai1njGW4mmHWfIQUJkOVG%2FEFoP%2F5eeuW2sdBBJQ2y3Bh2Cewc59tte%2FHwtCXsIvcfzAQQjQm4Gq7rUjyg0oGUBdVeO51aLUiCRj0vaYoVSHV3p%2FI2Shtwkk9aFdLlEOZp1FvLQu3JClqQQtbDwtRqiS0mZhfv2S2Sbj0HkhZy7oWn6srnRhcJXJWKthnVJW9tpVmipmpyCGAF8x0%2FFpc407sJlHfWtoNNDhrhSZ8EdM25%2BhKzdXU91GJRU%2F%2BGJaWIsvTXbMnbuVz6tM4f3NZDfv7jhZ1wY6L7gxIpYKRfEwtt4cng8ypUDyT%2FRp%2BBicLpej2CthEVmQ17NIH%2BBBq5V412puUs9711%2F%2Bm4lawKRvHdaRCxiA%2BC0GXgY6GvwxBniN6rjAYw%2B%2BWkrQY6kwIMN2kii7z%2F%2B2sGuN9jnHdUqSwMjnNAX1GkI2PcmaZzJzLzGnzDgy%2B0i3gkTBaifC3r7H0TGEajNpHr3k4aq%2F3aLchYMhHZ4kTKZhtaW3tJs1%2FWhHKUnesGzyvFQFTeXl9t8hLka07QOevEtNy38eB8eusIIKLIwvQd4xuntaGtttm18tbFh6oP7Sbyw02gIkYcbjPQVNhKJ9BHhj%2BdgfK72xMeolK5IlmYNUXWwrOsQk5Lh7AL0h77cf14gLcVP1spMJvXuzs4qymf1Miy%2F7j3JNR5pCpkabR%2BChTDKX%2Blg7iuLpvv4rhcuZUwDBGOlhM7ANOYTQqG%2BpEis4sgQbq%2B1EMocaNOtnP72mqBZI3aQ%2BSejg%3D%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240118T141807Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5AJ6KPN6O5%2F20240118%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=90e25eb6de1035c07fa9926e67922e1f0af5323244dbe1e6000bee4caabd43a3"
        },
        coordinationValues: {
            fileUid: 'kidney',
        },
    }).addFile({
        fileType: 'segmentation.glb',
        url: 'https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/glom_surface_export_reduced_draco.glb?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEC8aCXVzLWVhc3QtMSJIMEYCIQD5rXLQ%2BHiUpgwAgfYJhY96P2E0gjPSHJtbSRMzjU76yAIhAM2VJzTqCDCZNN0BlOt5uTY2AEHgixZnm1c1D5h6enGMKvQDCNf%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQARoMMTM2NTc2NTIyMDQ4IgwpNoXCB10ciDhCbdcqyAN9SpZG62aeBxb%2BTEIC%2FZzMIdHhl66mZhFKv75%2BcMkT3TM5yF7bMRXFNoN0aGdtMxl8tXt8ytXdIuPVyK%2FS3ipF8L1T465OmCMxHDyA7hqw6goEjSZoGhSr%2FpXHRlNbq2%2BDf2%2FihS6Y6wd46nxhJdGtsmeuI6IwC6Z7a3kpVuAK3ReNBsLk4NugOhk5FWb%2BBnwZmkJvslWPKOxZWYjXffFbhg4Ai1njGW4mmHWfIQUJkOVG%2FEFoP%2F5eeuW2sdBBJQ2y3Bh2Cewc59tte%2FHwtCXsIvcfzAQQjQm4Gq7rUjyg0oGUBdVeO51aLUiCRj0vaYoVSHV3p%2FI2Shtwkk9aFdLlEOZp1FvLQu3JClqQQtbDwtRqiS0mZhfv2S2Sbj0HkhZy7oWn6srnRhcJXJWKthnVJW9tpVmipmpyCGAF8x0%2FFpc407sJlHfWtoNNDhrhSZ8EdM25%2BhKzdXU91GJRU%2F%2BGJaWIsvTXbMnbuVz6tM4f3NZDfv7jhZ1wY6L7gxIpYKRfEwtt4cng8ypUDyT%2FRp%2BBicLpej2CthEVmQ17NIH%2BBBq5V412puUs9711%2F%2Bm4lawKRvHdaRCxiA%2BC0GXgY6GvwxBniN6rjAYw%2B%2BWkrQY6kwIMN2kii7z%2F%2B2sGuN9jnHdUqSwMjnNAX1GkI2PcmaZzJzLzGnzDgy%2B0i3gkTBaifC3r7H0TGEajNpHr3k4aq%2F3aLchYMhHZ4kTKZhtaW3tJs1%2FWhHKUnesGzyvFQFTeXl9t8hLka07QOevEtNy38eB8eusIIKLIwvQd4xuntaGtttm18tbFh6oP7Sbyw02gIkYcbjPQVNhKJ9BHhj%2BdgfK72xMeolK5IlmYNUXWwrOsQk5Lh7AL0h77cf14gLcVP1spMJvXuzs4qymf1Miy%2F7j3JNR5pCpkabR%2BChTDKX%2Blg7iuLpvv4rhcuZUwDBGOlhM7ANOYTQqG%2BpEis4sgQbq%2B1EMocaNOtnP72mqBZI3aQ%2BSejg%3D%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240118T141851Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5AJ6KPN6O5%2F20240118%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=b4d8e3241061663e9bff516733456124f8a83e26ad4bd9359efdfb01e71fd7ae',
        coordinationValues: {
            fileUid: 'gloms',
        }
    }).addFile({
        fileType: 'obsFeatureMatrix.csv',
        url: 'https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/statistics.csv?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEC8aCXVzLWVhc3QtMSJIMEYCIQD5rXLQ%2BHiUpgwAgfYJhY96P2E0gjPSHJtbSRMzjU76yAIhAM2VJzTqCDCZNN0BlOt5uTY2AEHgixZnm1c1D5h6enGMKvQDCNf%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQARoMMTM2NTc2NTIyMDQ4IgwpNoXCB10ciDhCbdcqyAN9SpZG62aeBxb%2BTEIC%2FZzMIdHhl66mZhFKv75%2BcMkT3TM5yF7bMRXFNoN0aGdtMxl8tXt8ytXdIuPVyK%2FS3ipF8L1T465OmCMxHDyA7hqw6goEjSZoGhSr%2FpXHRlNbq2%2BDf2%2FihS6Y6wd46nxhJdGtsmeuI6IwC6Z7a3kpVuAK3ReNBsLk4NugOhk5FWb%2BBnwZmkJvslWPKOxZWYjXffFbhg4Ai1njGW4mmHWfIQUJkOVG%2FEFoP%2F5eeuW2sdBBJQ2y3Bh2Cewc59tte%2FHwtCXsIvcfzAQQjQm4Gq7rUjyg0oGUBdVeO51aLUiCRj0vaYoVSHV3p%2FI2Shtwkk9aFdLlEOZp1FvLQu3JClqQQtbDwtRqiS0mZhfv2S2Sbj0HkhZy7oWn6srnRhcJXJWKthnVJW9tpVmipmpyCGAF8x0%2FFpc407sJlHfWtoNNDhrhSZ8EdM25%2BhKzdXU91GJRU%2F%2BGJaWIsvTXbMnbuVz6tM4f3NZDfv7jhZ1wY6L7gxIpYKRfEwtt4cng8ypUDyT%2FRp%2BBicLpej2CthEVmQ17NIH%2BBBq5V412puUs9711%2F%2Bm4lawKRvHdaRCxiA%2BC0GXgY6GvwxBniN6rjAYw%2B%2BWkrQY6kwIMN2kii7z%2F%2B2sGuN9jnHdUqSwMjnNAX1GkI2PcmaZzJzLzGnzDgy%2B0i3gkTBaifC3r7H0TGEajNpHr3k4aq%2F3aLchYMhHZ4kTKZhtaW3tJs1%2FWhHKUnesGzyvFQFTeXl9t8hLka07QOevEtNy38eB8eusIIKLIwvQd4xuntaGtttm18tbFh6oP7Sbyw02gIkYcbjPQVNhKJ9BHhj%2BdgfK72xMeolK5IlmYNUXWwrOsQk5Lh7AL0h77cf14gLcVP1spMJvXuzs4qymf1Miy%2F7j3JNR5pCpkabR%2BChTDKX%2Blg7iuLpvv4rhcuZUwDBGOlhM7ANOYTQqG%2BpEis4sgQbq%2B1EMocaNOtnP72mqBZI3aQ%2BSejg%3D%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240118T141838Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5AJ6KPN6O5%2F20240118%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=816669f10081f33b05d1a881f8717cfd915da7eba814ce0a664f04d79757014a',
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
