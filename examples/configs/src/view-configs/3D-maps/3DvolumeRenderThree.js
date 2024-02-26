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
        url: "https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/LS_20x_5_Stitched.pyramid.ome.tiff?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEMz%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJIMEYCIQCv%2FhXtZHIyaAIlCSw5qlb3Wv8BfUyhZ3uZMZMbQo4mzgIhAJX5%2B6HIfR4oLTvLVy1R%2BtyVGXMvfzwce5jtmSjxqPkHKvQDCLX%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQARoMMTM2NTc2NTIyMDQ4IgwtV44zju2EPbaL534qyAMVzHDjA3hTLseT%2Blh7oxSIk2l712ueTmKRmif2HqNpQSymUn7Q9zPOet0n94WmTIlzcHIp5ylr%2FIlPoozweGevZbPHgHesgTHsa%2BgIbl2LeoxFp5SyJalrE%2FuTAGfNuppw27KLTMjLfyTu3Ijg37b0sBsfrXN4Iq9o619AIxqjC4PTzXvtqBETfY1qYU%2FNAVIovC%2FtfqTQr0RfjAPKmWJPwxJ6tDSXUQSK03QGaizGBB5N1AHkTwRuNPBBe0vCfkcyrQf4ytBzlYYXG091xLCNkVEJGOPomn0HqzItlDTTJwI7nNYecP0Mm3QPjs%2F884aImyb7NuAYEhlCsdcptxlSEByAM4CdC2xX43MEtoxMBFD3fxzohCStoSvdCK9oYbMrxngZ3Tqs%2FwR8nIErK8biqaFNu9BCUz96EkvQPFxkB77jRt8yUlWVNbC3aLH%2B9EpXsbP2Yvl1WiOl3zu8nwJbOXH%2BsBjE1f0lelMSUPiNxd3%2Bpv6Mb%2BCvqU8yL4Un8NRqsEmGBU8erWFnhO0WD5SofkNyGZINDGNSji4Y7alxvQId1JkLZSTNGddA4G0zC4k3RnSswVKpKs%2BjTkLqpP4w8XTVLhlWL9sw4ojwrgY6kwJ5qUeeuSl%2FjCUtRpt7GdW10CGZtAoHYVtR6kWlrTqriJFoesoznTBcUarK11zA4y3Pedet5y6JbyKGPoCbMo79NuYwPNvkQ7RlGNF6iYFv%2FBfJVa7FAK4irpSRdDMEV%2FNgwQrv2qvXieD9iaOE%2FQ9VIpvu%2FZlXZVGts77ilsuanr6TWyo6%2F8nMkDU3AiLKmhCKShokBc1nwcdFL4umZyJzFQAwI81P%2FTVeqDxM1WQAqKv8Zqri0gXc0sX%2BEm5whdaz2wsa7addxY2u5i2%2BZzlRpzA18MzWVTLxfL7stVsUjFTTxkN7WZ1tzV7KGKGtrtNsdhLrJVyLAXeyqncJXUKTRQh9mcYvyAdiuujUzXMjC%2BPAxw%3D%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240226T032524Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5AGEK64QEG%2F20240226%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=f8e434a126b5c11523ac8942228396ccb88a8869d3ce1faefc6996d6fbd4cae5",
        options: {
            offsetsUrl: "https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/LS_20x_5_Stitched.pyramid.offsets.json?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEMz%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJIMEYCIQCv%2FhXtZHIyaAIlCSw5qlb3Wv8BfUyhZ3uZMZMbQo4mzgIhAJX5%2B6HIfR4oLTvLVy1R%2BtyVGXMvfzwce5jtmSjxqPkHKvQDCLX%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQARoMMTM2NTc2NTIyMDQ4IgwtV44zju2EPbaL534qyAMVzHDjA3hTLseT%2Blh7oxSIk2l712ueTmKRmif2HqNpQSymUn7Q9zPOet0n94WmTIlzcHIp5ylr%2FIlPoozweGevZbPHgHesgTHsa%2BgIbl2LeoxFp5SyJalrE%2FuTAGfNuppw27KLTMjLfyTu3Ijg37b0sBsfrXN4Iq9o619AIxqjC4PTzXvtqBETfY1qYU%2FNAVIovC%2FtfqTQr0RfjAPKmWJPwxJ6tDSXUQSK03QGaizGBB5N1AHkTwRuNPBBe0vCfkcyrQf4ytBzlYYXG091xLCNkVEJGOPomn0HqzItlDTTJwI7nNYecP0Mm3QPjs%2F884aImyb7NuAYEhlCsdcptxlSEByAM4CdC2xX43MEtoxMBFD3fxzohCStoSvdCK9oYbMrxngZ3Tqs%2FwR8nIErK8biqaFNu9BCUz96EkvQPFxkB77jRt8yUlWVNbC3aLH%2B9EpXsbP2Yvl1WiOl3zu8nwJbOXH%2BsBjE1f0lelMSUPiNxd3%2Bpv6Mb%2BCvqU8yL4Un8NRqsEmGBU8erWFnhO0WD5SofkNyGZINDGNSji4Y7alxvQId1JkLZSTNGddA4G0zC4k3RnSswVKpKs%2BjTkLqpP4w8XTVLhlWL9sw4ojwrgY6kwJ5qUeeuSl%2FjCUtRpt7GdW10CGZtAoHYVtR6kWlrTqriJFoesoznTBcUarK11zA4y3Pedet5y6JbyKGPoCbMo79NuYwPNvkQ7RlGNF6iYFv%2FBfJVa7FAK4irpSRdDMEV%2FNgwQrv2qvXieD9iaOE%2FQ9VIpvu%2FZlXZVGts77ilsuanr6TWyo6%2F8nMkDU3AiLKmhCKShokBc1nwcdFL4umZyJzFQAwI81P%2FTVeqDxM1WQAqKv8Zqri0gXc0sX%2BEm5whdaz2wsa7addxY2u5i2%2BZzlRpzA18MzWVTLxfL7stVsUjFTTxkN7WZ1tzV7KGKGtrtNsdhLrJVyLAXeyqncJXUKTRQh9mcYvyAdiuujUzXMjC%2BPAxw%3D%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240226T032511Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5AGEK64QEG%2F20240226%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=cf28ee0b75e7b571cc83affe39669201b6c9ca55afad3febc9c647dc1c68a9a5",
        },
        coordinationValues: {
            fileUid: 'kidney',
        },
    }).addFile({
        fileType: 'segmentation.glb',
      //  url: 'https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/glom_surface_export_reduced_draco.glb?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEMz%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJIMEYCIQCv%2FhXtZHIyaAIlCSw5qlb3Wv8BfUyhZ3uZMZMbQo4mzgIhAJX5%2B6HIfR4oLTvLVy1R%2BtyVGXMvfzwce5jtmSjxqPkHKvQDCLX%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQARoMMTM2NTc2NTIyMDQ4IgwtV44zju2EPbaL534qyAMVzHDjA3hTLseT%2Blh7oxSIk2l712ueTmKRmif2HqNpQSymUn7Q9zPOet0n94WmTIlzcHIp5ylr%2FIlPoozweGevZbPHgHesgTHsa%2BgIbl2LeoxFp5SyJalrE%2FuTAGfNuppw27KLTMjLfyTu3Ijg37b0sBsfrXN4Iq9o619AIxqjC4PTzXvtqBETfY1qYU%2FNAVIovC%2FtfqTQr0RfjAPKmWJPwxJ6tDSXUQSK03QGaizGBB5N1AHkTwRuNPBBe0vCfkcyrQf4ytBzlYYXG091xLCNkVEJGOPomn0HqzItlDTTJwI7nNYecP0Mm3QPjs%2F884aImyb7NuAYEhlCsdcptxlSEByAM4CdC2xX43MEtoxMBFD3fxzohCStoSvdCK9oYbMrxngZ3Tqs%2FwR8nIErK8biqaFNu9BCUz96EkvQPFxkB77jRt8yUlWVNbC3aLH%2B9EpXsbP2Yvl1WiOl3zu8nwJbOXH%2BsBjE1f0lelMSUPiNxd3%2Bpv6Mb%2BCvqU8yL4Un8NRqsEmGBU8erWFnhO0WD5SofkNyGZINDGNSji4Y7alxvQId1JkLZSTNGddA4G0zC4k3RnSswVKpKs%2BjTkLqpP4w8XTVLhlWL9sw4ojwrgY6kwJ5qUeeuSl%2FjCUtRpt7GdW10CGZtAoHYVtR6kWlrTqriJFoesoznTBcUarK11zA4y3Pedet5y6JbyKGPoCbMo79NuYwPNvkQ7RlGNF6iYFv%2FBfJVa7FAK4irpSRdDMEV%2FNgwQrv2qvXieD9iaOE%2FQ9VIpvu%2FZlXZVGts77ilsuanr6TWyo6%2F8nMkDU3AiLKmhCKShokBc1nwcdFL4umZyJzFQAwI81P%2FTVeqDxM1WQAqKv8Zqri0gXc0sX%2BEm5whdaz2wsa7addxY2u5i2%2BZzlRpzA18MzWVTLxfL7stVsUjFTTxkN7WZ1tzV7KGKGtrtNsdhLrJVyLAXeyqncJXUKTRQh9mcYvyAdiuujUzXMjC%2BPAxw%3D%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240226T032456Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5AGEK64QEG%2F20240226%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=7f6db05ff6ee92e14ad0a2a856e5076cd296222d17c57b811a359dec1e153961',
        url: 'https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/decimated_gloms_compressed.glb?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEMz%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJIMEYCIQCv%2FhXtZHIyaAIlCSw5qlb3Wv8BfUyhZ3uZMZMbQo4mzgIhAJX5%2B6HIfR4oLTvLVy1R%2BtyVGXMvfzwce5jtmSjxqPkHKvQDCLX%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQARoMMTM2NTc2NTIyMDQ4IgwtV44zju2EPbaL534qyAMVzHDjA3hTLseT%2Blh7oxSIk2l712ueTmKRmif2HqNpQSymUn7Q9zPOet0n94WmTIlzcHIp5ylr%2FIlPoozweGevZbPHgHesgTHsa%2BgIbl2LeoxFp5SyJalrE%2FuTAGfNuppw27KLTMjLfyTu3Ijg37b0sBsfrXN4Iq9o619AIxqjC4PTzXvtqBETfY1qYU%2FNAVIovC%2FtfqTQr0RfjAPKmWJPwxJ6tDSXUQSK03QGaizGBB5N1AHkTwRuNPBBe0vCfkcyrQf4ytBzlYYXG091xLCNkVEJGOPomn0HqzItlDTTJwI7nNYecP0Mm3QPjs%2F884aImyb7NuAYEhlCsdcptxlSEByAM4CdC2xX43MEtoxMBFD3fxzohCStoSvdCK9oYbMrxngZ3Tqs%2FwR8nIErK8biqaFNu9BCUz96EkvQPFxkB77jRt8yUlWVNbC3aLH%2B9EpXsbP2Yvl1WiOl3zu8nwJbOXH%2BsBjE1f0lelMSUPiNxd3%2Bpv6Mb%2BCvqU8yL4Un8NRqsEmGBU8erWFnhO0WD5SofkNyGZINDGNSji4Y7alxvQId1JkLZSTNGddA4G0zC4k3RnSswVKpKs%2BjTkLqpP4w8XTVLhlWL9sw4ojwrgY6kwJ5qUeeuSl%2FjCUtRpt7GdW10CGZtAoHYVtR6kWlrTqriJFoesoznTBcUarK11zA4y3Pedet5y6JbyKGPoCbMo79NuYwPNvkQ7RlGNF6iYFv%2FBfJVa7FAK4irpSRdDMEV%2FNgwQrv2qvXieD9iaOE%2FQ9VIpvu%2FZlXZVGts77ilsuanr6TWyo6%2F8nMkDU3AiLKmhCKShokBc1nwcdFL4umZyJzFQAwI81P%2FTVeqDxM1WQAqKv8Zqri0gXc0sX%2BEm5whdaz2wsa7addxY2u5i2%2BZzlRpzA18MzWVTLxfL7stVsUjFTTxkN7WZ1tzV7KGKGtrtNsdhLrJVyLAXeyqncJXUKTRQh9mcYvyAdiuujUzXMjC%2BPAxw%3D%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240226T035402Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5AGEK64QEG%2F20240226%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=6924fc99d08fabb5c82838eaf3ae46df27b49ab5fa5fd1790d91f05ff02c9ffb',
        coordinationValues: {
            fileUid: 'gloms',
        }
    }).addFile({
        fileType: 'obsFeatureMatrix.csv',
        url: 'https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/Sample_SK2_FOV_5_Example_Surface_with_Stats_Masks_Images/statistics.csv?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEMz%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJIMEYCIQCv%2FhXtZHIyaAIlCSw5qlb3Wv8BfUyhZ3uZMZMbQo4mzgIhAJX5%2B6HIfR4oLTvLVy1R%2BtyVGXMvfzwce5jtmSjxqPkHKvQDCLX%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQARoMMTM2NTc2NTIyMDQ4IgwtV44zju2EPbaL534qyAMVzHDjA3hTLseT%2Blh7oxSIk2l712ueTmKRmif2HqNpQSymUn7Q9zPOet0n94WmTIlzcHIp5ylr%2FIlPoozweGevZbPHgHesgTHsa%2BgIbl2LeoxFp5SyJalrE%2FuTAGfNuppw27KLTMjLfyTu3Ijg37b0sBsfrXN4Iq9o619AIxqjC4PTzXvtqBETfY1qYU%2FNAVIovC%2FtfqTQr0RfjAPKmWJPwxJ6tDSXUQSK03QGaizGBB5N1AHkTwRuNPBBe0vCfkcyrQf4ytBzlYYXG091xLCNkVEJGOPomn0HqzItlDTTJwI7nNYecP0Mm3QPjs%2F884aImyb7NuAYEhlCsdcptxlSEByAM4CdC2xX43MEtoxMBFD3fxzohCStoSvdCK9oYbMrxngZ3Tqs%2FwR8nIErK8biqaFNu9BCUz96EkvQPFxkB77jRt8yUlWVNbC3aLH%2B9EpXsbP2Yvl1WiOl3zu8nwJbOXH%2BsBjE1f0lelMSUPiNxd3%2Bpv6Mb%2BCvqU8yL4Un8NRqsEmGBU8erWFnhO0WD5SofkNyGZINDGNSji4Y7alxvQId1JkLZSTNGddA4G0zC4k3RnSswVKpKs%2BjTkLqpP4w8XTVLhlWL9sw4ojwrgY6kwJ5qUeeuSl%2FjCUtRpt7GdW10CGZtAoHYVtR6kWlrTqriJFoesoznTBcUarK11zA4y3Pedet5y6JbyKGPoCbMo79NuYwPNvkQ7RlGNF6iYFv%2FBfJVa7FAK4irpSRdDMEV%2FNgwQrv2qvXieD9iaOE%2FQ9VIpvu%2FZlXZVGts77ilsuanr6TWyo6%2F8nMkDU3AiLKmhCKShokBc1nwcdFL4umZyJzFQAwI81P%2FTVeqDxM1WQAqKv8Zqri0gXc0sX%2BEm5whdaz2wsa7addxY2u5i2%2BZzlRpzA18MzWVTLxfL7stVsUjFTTxkN7WZ1tzV7KGKGtrtNsdhLrJVyLAXeyqncJXUKTRQh9mcYvyAdiuujUzXMjC%2BPAxw%3D%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240226T032539Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5AGEK64QEG%2F20240226%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=f2c6f6eee4e3b0ff333dfb8452e827e11674e20090cf5bb020782733849c558e',
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

