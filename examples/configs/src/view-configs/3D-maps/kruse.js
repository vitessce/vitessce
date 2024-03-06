import {
    VitessceConfig,
    CoordinationLevel as CL,
    hconcat, vconcat,
} from '@vitessce/config';


function generateKruse2024Configuration() {
    const config = new VitessceConfig({
        schemaVersion: '1.0.16',
        name: 'Kruse',
    });
    const dataset = config.addDataset('My dataset').addFile({
        fileType: 'image.ome-tiff',
        url: "https://hdv-spatial-data.s3.us-east-1.amazonaws.com/kruse/AW2_6A_gpINS_RtCK19_5x_simultaneous.ome.tiff?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEJ3%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJGMEQCIBg2Ny8mNrcoerL%2BF3ZjR0VUbCd3Bd8AjmmfzdYnGS3yAiA4fZiyfAQgPJxTRoxdPdNeqUn5N9bux%2BVqM2pbWw%2Bbqir1AwiW%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAEaDDEzNjU3NjUyMjA0OCIMU0fEYMYfsuFMHgUUKskDvI%2FPmwGXwN7J1066XEOQXQvqlnWqvb52d8d4M8iaPA5GIC2QmY2kiUx%2BbVJwCReVw93QpJ2RtsIHriHJU%2FzEVqTKNddqVsce5Qs1zRUrPndnXg9kSt%2FT711s9XaHpV9aBOJwVUBlkmt0mRIgbe5eb4CIJDe%2BKUyvxQGVuk9tMFg2YrAgzJkq8dxYuWlcoCMwSVULbQmMXS3Wto2kpWKZqQg1wQZbd8axM1UgpSxpDRB4iGBy%2B3q4Ernc5h1xJbwFXyTlA8LK3EFaFzkGArP4PWOU%2BK9JopYpFkG6cJSzJfkbRsKlvN9qo5nB31ndn3cwrq%2FLyFFkNjiycKk51kJP1KTm7ll4LA0%2BXPSduW4XTKdQ3Vwfdb%2FB3MF0p17Azc%2BEMmhi%2FP3fHNweP1AmAvHIE4AUZ4c7wSgA%2B%2F3W9mdoraXdfkS3o%2Fn73YVoMmljKzfaGAoacHCbF4wJgkak1O2ja%2FNoa6gXuQbYylIoLQtJw9cSv6heXVn6wE8WK9kspjwMY23nzuuDh46Ki2crCSQ4RKaW7mIdSWee96GOJpmdzC9FAmzNDRrBSOMYzrBFSE%2FCIINZPR9hC3grD6KkKqB45FBAsi%2B1Y495EDDvgZ6vBjqVArrHTrU4bpe3dLtYbm7XbWdM6RoOxBFtXSN%2FdYXCCEPk%2Fg2znV1RN9fOhYjuotBfN%2FCCr0Lxwj7xS5iwV4Hbo5bdF5YTsE%2BkhXfMTHMt%2Bh5e4LvYRTbT97p40cV2r%2BDuuOGop6Ft50F4cf8s1JCvrHnA02wkJcoBTl54sud5gTXlFBx5QNT948%2BPVjuVeXFzv8TLtWYEfbSGkxh6onTdrHPz%2FMJ9SRMr4q4tC4VQwwz%2F%2B0H07ANDA6%2BVtqf8KCq1gYvBSBKW5V6fgjN1QEHQo%2Bl%2BtLcHB8BwcI5Srf28xeHTEzF765LDlgXEHFQHsKiDEng8aah32xO1O976MjK4sNOh4fgZ%2FTXtrU716eA18GkuZwCtqJQ%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240305T205229Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43199&X-Amz-Credential=ASIAR7TEYK5ACGCW6PMN%2F20240305%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=a9d97af0c45f2b39fbf4fd55a16ff8601ae1c7e3b194c7f082bb92dee6adc44f",
        options: {
               offsetsUrl: "https://hdv-spatial-data.s3.us-east-1.amazonaws.com/kruse/AW2_6A_gpINS_RtCK19_5x_simultaneous.offsets.json?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEJ3%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJGMEQCIBg2Ny8mNrcoerL%2BF3ZjR0VUbCd3Bd8AjmmfzdYnGS3yAiA4fZiyfAQgPJxTRoxdPdNeqUn5N9bux%2BVqM2pbWw%2Bbqir1AwiW%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAEaDDEzNjU3NjUyMjA0OCIMU0fEYMYfsuFMHgUUKskDvI%2FPmwGXwN7J1066XEOQXQvqlnWqvb52d8d4M8iaPA5GIC2QmY2kiUx%2BbVJwCReVw93QpJ2RtsIHriHJU%2FzEVqTKNddqVsce5Qs1zRUrPndnXg9kSt%2FT711s9XaHpV9aBOJwVUBlkmt0mRIgbe5eb4CIJDe%2BKUyvxQGVuk9tMFg2YrAgzJkq8dxYuWlcoCMwSVULbQmMXS3Wto2kpWKZqQg1wQZbd8axM1UgpSxpDRB4iGBy%2B3q4Ernc5h1xJbwFXyTlA8LK3EFaFzkGArP4PWOU%2BK9JopYpFkG6cJSzJfkbRsKlvN9qo5nB31ndn3cwrq%2FLyFFkNjiycKk51kJP1KTm7ll4LA0%2BXPSduW4XTKdQ3Vwfdb%2FB3MF0p17Azc%2BEMmhi%2FP3fHNweP1AmAvHIE4AUZ4c7wSgA%2B%2F3W9mdoraXdfkS3o%2Fn73YVoMmljKzfaGAoacHCbF4wJgkak1O2ja%2FNoa6gXuQbYylIoLQtJw9cSv6heXVn6wE8WK9kspjwMY23nzuuDh46Ki2crCSQ4RKaW7mIdSWee96GOJpmdzC9FAmzNDRrBSOMYzrBFSE%2FCIINZPR9hC3grD6KkKqB45FBAsi%2B1Y495EDDvgZ6vBjqVArrHTrU4bpe3dLtYbm7XbWdM6RoOxBFtXSN%2FdYXCCEPk%2Fg2znV1RN9fOhYjuotBfN%2FCCr0Lxwj7xS5iwV4Hbo5bdF5YTsE%2BkhXfMTHMt%2Bh5e4LvYRTbT97p40cV2r%2BDuuOGop6Ft50F4cf8s1JCvrHnA02wkJcoBTl54sud5gTXlFBx5QNT948%2BPVjuVeXFzv8TLtWYEfbSGkxh6onTdrHPz%2FMJ9SRMr4q4tC4VQwwz%2F%2B0H07ANDA6%2BVtqf8KCq1gYvBSBKW5V6fgjN1QEHQo%2Bl%2BtLcHB8BwcI5Srf28xeHTEzF765LDlgXEHFQHsKiDEng8aah32xO1O976MjK4sNOh4fgZ%2FTXtrU716eA18GkuZwCtqJQ%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240305T205211Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5ACGCW6PMN%2F20240305%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=2dd6368e5554d0c7b2a01c43eff93f33a021ac57f337f1000e7b8cbf7887eebf",
        },
        coordinationValues: {
            fileUid: 'kidney',
        },
    }).addFile({
        fileType: 'segmentation.glb',
        // url: 'https://hdv-spatial-data.s3.us-east-1.amazonaws.com/kruse/kruse.glb?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEJ7%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJIMEYCIQCyrPCrd4%2FIKiUnkIn2VyW8hj9icaG2IixMXSP3MbYWiwIhAJf8%2BhjtCgz3gcrAwEG5aCQnigVKpAF%2FtISKwJNt8sJqKvUDCJf%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQARoMMTM2NTc2NTIyMDQ4Igxcs%2FaZpHSlCSfS2GkqyQO4YA%2B0pF9LkDFaAGlxY2Hh2gUKvrlGGpW7zF%2BSQGybTkKrKx3kL6M0iOto4J7DZED%2BVT%2BGqJCj%2FcE9tuWF57qRnWrk4cu3FiZu664YbFG0vut%2FASWS%2FKsWI0taLIBvdD%2BsZcIH0Vfoi64m4Zg8I9ZznDXTxDjsW3aYmfF1Uw0QtPsS4BEnhpmALjFKD60fUNN6b5UFJJVa1dUM1pVSmUUTIfO2yw3vamD8htAVkXJ%2BZNbKXOjfs14alPpbTehGF5O%2Bqwd85anQgaNCAJvHWqo1V89ROG9LqmjqoP9hf%2B4qMD0ilXSK%2FW1lUeq9Tdd7Gn3tfQU8PMrXqKIE89Fgk%2BhK0xPWzCJ2VtznlvDGbTKiyR9B%2BdyjN5tN5fRiqbVt9sYXym7t4rryhAQhgp4EyFk29ewxIW2%2BApsUR9LgjnXfx3PFD%2Fde7dQKYVHzNypk0AQmkYj8rSA%2FJX4TsnJuUry8p8t%2BNGG3028J7jX8SB7aGVQH78YmMI4W9p%2BrtoujKehu6EHhYkNSwucf%2BE%2BRBqNghZY82Yi3DCr%2BQAXozDgq0YOc2GvCXdWYMMmM422i9Pgy0%2FZ8hcEg0wOFb9PRo3KyZ3%2BEEsSaHCyzMPOanq8GOpMC%2FhrR42A13Oqzd4Ys89%2BWYruklR8naVQ0mv6FpMFjfW4%2Bm8JFf1vjXnIPTEqVDyDFv2cUdJlBe8EfcElS%2FqOW1O%2FFHUyD3HgKuis1f9YIGP2o079luLOqKRVUxX7jv%2FMAxbEaALAxAnOSo%2FEOjeclHJ8RvtNuVqOX9NqZMx6c5sWGLweNZTV5CgUqEW9F4EL1H4QoVDqiyXVG0n5oA2RcjvMEJ3PFLhBzN4t86j8ZR2zqLXsvXk9S7PDTd5W6uQz1s%2FUOqBbq05RWJqp5u%2Fakh5UDazwT3om2UoKddIGYo%2BMnkgjqE%2BIIMrULF5Ob2M981CTgncZlsjDp6wOjYsBZUdK0muv5VMxwsx%2BrbsOuFK0nPaY%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240305T212421Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5AOQ2BGXMM%2F20240305%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=5d00b0df74f11fbbc40f2e2b0f57ad9ce0d16261a185734c98c9b2926ace419c',
        //url: 'http://127.0.0.1:808/kruse_full.glb',
        url: 'https://hdv-spatial-data.s3.us-east-1.amazonaws.com/kruse/kruse_one.glb?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEKH%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJIMEYCIQC2ej8JI7WZRpMOFmDA9%2B%2FtOSPT3440e3zGgRWNs3VRhQIhAIkC3NcpXBF73sspcjYmiSA9lDlWqWR0FZdrMDoe3JlBKvUDCJr%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQARoMMTM2NTc2NTIyMDQ4IgxlMZ920b6isYfWFD4qyQOAeAh8tg4vItdzjS6z1I0B690keN4%2Bej6xmUXYjEKFDf6zX6iBNavMBazL3vS0wMv6gf20uI40KiA3xjh00NcYIMc66fBDPjpqHZmCWkfh7vmlBiMsLZU1KMks3GtY0l0q3W9wVF%2BudOLRi%2FpN6rSNDC7r7ixW80LpYRMfjUiTvcRI4mCJfU2%2FXH8c%2FSeVR6MStds%2BcgDom89sWZbhMMbcJYsxw%2FLKY9MXfs3gq%2BuS6Eo%2B3rCIGljGA0brRmOZbqfGdF2XXRA4awiFdSN%2BLWu70eiPrcfktF7kcNVrAnZ1rHnmXwi%2BjjZPSbZZzeLG4F7rM0WRX44hmIcPiyFXm217Umdi%2Fop6OrOHaDiqhDU5au5LHqidulIvZV%2BpFFv%2FawU6nbV4UmWQERXyPQbdVIQ%2FWxiq98XvkKriDty0HOs79%2B9LJ4s%2ByjKhNv7mS1vVcd2%2BYPwuKhR9Ezm4JXHnLW%2FFOM9KF1UYR%2BIyna0%2BFHhsYyfZD7MjIa5MwMyRRouah1f1mpdZAzMG4X1CKSgei%2BZ7%2F8bpEEqNmeK5dGiG6J6%2BPALJP60QBOEAgaMW8GOhxrZMAb6GfurgS0eFkQlpXcHJOhjS9pD9odprMMz%2Bnq8GOpMC4VNuAMe0SxURtxRzbgVW8dTfZamxIAzgGh9RqtlktvVmQ6Era8dpidIOm08TfJwrH%2FCQleUqHfl1h5iZ0RM8zZZ8sWwFfL5S0ZePHUjJp5%2Bf2pn6oh3L6vAWDieyCMwQaWPTCLRK4sqAQKJIulVqKt6vE2z%2F9dJ80S%2B%2BIeAcZxmZktw512SCM069%2F8iluFRaUIx0E6IPNV%2Fj9y7s1viAaG2fT3zglGdgdInZN64PjtX%2B1TDLCA7A0dIZc2x%2FyFn3EWutiNEjCdAu%2Bq2V7gXhx3vxhwvEqmiqhPouGGacOgTcPnnh6TUXqtBV63oyLe6eGpbvLQNyfAy9%2B82dK8N8T2mxZzX%2BeyrI4bsLDZ%2Fu6RSaCxc%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240306T005924Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5APPJQSJWN%2F20240306%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=00b5a196d907804137076b66df38e4d095de2bfcaef64b96e883c5c00355f58a',
        coordinationValues: {
            fileUid: 'gloms',
        }
    })

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

    const spatialThreeView = config.addView(dataset, 'spatialThree');
    const lcView = config.addView(dataset, 'layerControllerBeta');
    config.linkViewsByObject([spatialThreeView, lcView], {
        spatialTargetZ: 0,
        spatialTargetT: 0,
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
                        spatialChannelWindow: [1281,1427],
                    },
                    {
                        spatialTargetC: 1,
                        spatialChannelColor: [255, 0, 255],
                        spatialChannelVisible: true,
                        spatialChannelOpacity: 1.0,
                        spatialChannelWindow: [627,673],
                    },
                ]),
            },
        ]),segmentationLayer: CL([
            {
                fileUid: 'gloms',
                spatialLayerVisible: true,
                spatialLayerOpacity: 1,
                spatialTargetX: -270,
                spatialTargetY: -950/2.0,
                spatialTargetZ: -950/2.0,
                spatialScaleX: -0.095361611229783,
                spatialScaleY: 0.125*2,
                spatialScaleZ: -0.125*2,
                spatialRotationZ: 3.14159265359,
                spatialRotationY: 1.57079632679,
                spatialSceneScaleX: 1.0,
                spatialSceneScaleY: 1.0,
                spatialSceneScaleZ: 1.0,
                segmentationChannel: CL([
                    {
                        obsType: 'islets',
                        featureType: glomsFeatureTypeScope,
                        // featureValueType: glomsFeatureValueTypeScope,
                        // featureSelection: glomsFeatureSelectionScope,
                        spatialTargetC: 0,
                        spatialChannelColor: [0, 0, 255],
                        spatialChannelOpacity: 0.5,
                        spatialChannelVisible: true,
                        obsColorEncoding: colorEncodingScope,
                        spatialSegmentationFilled: false,
                        spatialSegmentationStrokeWidth: 0.01,
                    },
                    {
                        obsType: 'ducts',
                        featureType: glomsFeatureTypeScope,
                        // featureValueType: glomsFeatureValueTypeScope,
                        // featureSelection: glomsFeatureSelectionScope,
                        spatialTargetC: 1,
                        spatialChannelColor: [255, 255, 0],
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

    config.layout(hconcat(spatialThreeView, lcView));

    const configJSON = config.toJSON();
    return configJSON;
}

export const kruse2024 = generateKruse2024Configuration();
