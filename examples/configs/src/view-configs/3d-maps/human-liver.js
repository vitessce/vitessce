import {
  VitessceConfig,
  CoordinationLevel as CL,
  hconcat,
} from '@vitessce/config';

// Reference: https://portal.hubmapconsortium.org/preview/multimodal-mass-spectrometry-imaging-data

function generateThreeMinimalConfiguration() {
  const config = new VitessceConfig({
    schemaVersion: '1.0.16',
    name: 'Human Liver',
  });
  const dataset = config.addDataset('My dataset').addFile({
    fileType: 'image.ome-tiff',
    // url: "https://assets.hubmapconsortium.org/30bc1823e0c19be58557fb979499bac2/ometiff-pyramids/data/3D_image_stack.ome.tif?token=",
    // url: "https://vitessce-data-v2.s3.amazonaws.com/data/kiemenetal/5xHE.ome.tiff",
    // url: "http://127.0.0.1:8080/cell_community.ome.tif",
    // url: "https://vitessce-data-v2.s3.amazonaws.com/data/redBloodCell.ome.tiff",
    // url: "https://vitessce-data-v2.s3.amazonaws.com/data/sorger/f8ii.ome.tiff",
    //url: 'https://hdv-spatial-data.s3.us-east-1.amazonaws.com/spraggings/pyramid.ome.tif?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEMv%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJGMEQCIHYchjibyKbQCBwOD3w8cdVZrGtyevPB21AXiliFFjd3AiAkTBwY388zzoFDsZumEgD5n6K2TNY2Gj3k5fq%2FVFStxSr1AwiU%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAEaDDEzNjU3NjUyMjA0OCIM7hLTKLzsiqeY0btaKskDZWyS61YhT2bQhkA8u1imFhWseFAbwKlOBepmcM4SliLHX5aBEiz5el8E9uKEPICdyVQRyZfjGS6LMVR21HuXal8b6yt9pk3E5TSOKHT%2Bj2aowe3Qoxidg%2BbGoOCveQeUPt2mQx83qqZBRzLiTD0S32Nh55ytFXx0nroATt3A8mYQBdztVPWydDSvg2WMBc4hsidLgymXN0EJmZPjuozyDm34EDIA51WGyNEKRQxxCzwlGaxwlXo%2BK6vvIRK5RvZ3TjRxmQVTH1A8LKeJFMraHVvOCt9i33RAfpoogdfprpeflr0OYb2XF7lwyAB%2FyNR%2B0OAjppLe%2BAKmq2glrhrgixn%2F50m6TBxJpvZNJ2uk6%2BY%2FjJtsGvYUOgSAs57et0R79mpz7YTHiVJ9jVUbXOTf8yEY8NH4k%2BQC1AECOOEUYyOIlcDccnXKKXM4XmVtWO5%2BjWU5hr%2Fs8p3lfS0jKfC9NhOwJBaMfrZkygilqvHmK87v26AD%2FCkWI3rlUDCQhobpyfAxn5qUqpikq4i3IDB5lu6ep8qUjk%2Ffk3exlRYVAaqIUDYT7wwrNJ4HelqqXvkDKeXOXqABw4igKIQ5WTxDEgMsRpIPUbN9bTD8k8u0BjqVAuen3aJWK6Kd9icw4Kbc%2BuDrJdVMXxzodPfui8IO6ic8FlVsHRz03HETDB0%2BJPAERAskxeeMA0vEMLb%2Fdz9qjniz%2Bta%2BvOS%2FB9%2B9EFxead%2FBDE6l7DiK2Wl5WWC8q%2BzHULtBQ2A5IzJ69FFVvertqRn%2Bc7EGAu2CzBslM4fDbR4kUa1kbtU2AVosN9lwk6FWHpzKDWzxozabSKwyYByH1%2BO%2BjbrdqnOz9%2FoC1LVH6y67%2FbcxzVEFyPDgfVfIVp%2FK6TxonbfZzM1TRJ6YqeRDhCX6ZOqgUxj5URHUVg5gVfyrPHviUrwDN3KGDXW5valxB7vmIScsh2e7OheYSKTBs06vMQLsqzKLbrVJsNuRjMV8ZrOXTPs%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240713T184118Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5AHH34SF5D%2F20240713%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=cbd7e787a109e4cd5f2088ef4cac0ea3cf1c46dc8545b481afd7bc88da19b5e3',
    //url: 'https://vitessce-data-v2.s3.amazonaws.com/data/washu-kidney/LS_20x_5_Stitched.pyramid.ome.tiff',
    //options: {
    //  offsetsUrl: 'https://hdv-spatial-data.s3.us-east-1.amazonaws.com/spraggings/pyramid.offsets.json?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEMv%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJGMEQCIHYchjibyKbQCBwOD3w8cdVZrGtyevPB21AXiliFFjd3AiAkTBwY388zzoFDsZumEgD5n6K2TNY2Gj3k5fq%2FVFStxSr1AwiU%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAEaDDEzNjU3NjUyMjA0OCIM7hLTKLzsiqeY0btaKskDZWyS61YhT2bQhkA8u1imFhWseFAbwKlOBepmcM4SliLHX5aBEiz5el8E9uKEPICdyVQRyZfjGS6LMVR21HuXal8b6yt9pk3E5TSOKHT%2Bj2aowe3Qoxidg%2BbGoOCveQeUPt2mQx83qqZBRzLiTD0S32Nh55ytFXx0nroATt3A8mYQBdztVPWydDSvg2WMBc4hsidLgymXN0EJmZPjuozyDm34EDIA51WGyNEKRQxxCzwlGaxwlXo%2BK6vvIRK5RvZ3TjRxmQVTH1A8LKeJFMraHVvOCt9i33RAfpoogdfprpeflr0OYb2XF7lwyAB%2FyNR%2B0OAjppLe%2BAKmq2glrhrgixn%2F50m6TBxJpvZNJ2uk6%2BY%2FjJtsGvYUOgSAs57et0R79mpz7YTHiVJ9jVUbXOTf8yEY8NH4k%2BQC1AECOOEUYyOIlcDccnXKKXM4XmVtWO5%2BjWU5hr%2Fs8p3lfS0jKfC9NhOwJBaMfrZkygilqvHmK87v26AD%2FCkWI3rlUDCQhobpyfAxn5qUqpikq4i3IDB5lu6ep8qUjk%2Ffk3exlRYVAaqIUDYT7wwrNJ4HelqqXvkDKeXOXqABw4igKIQ5WTxDEgMsRpIPUbN9bTD8k8u0BjqVAuen3aJWK6Kd9icw4Kbc%2BuDrJdVMXxzodPfui8IO6ic8FlVsHRz03HETDB0%2BJPAERAskxeeMA0vEMLb%2Fdz9qjniz%2Bta%2BvOS%2FB9%2B9EFxead%2FBDE6l7DiK2Wl5WWC8q%2BzHULtBQ2A5IzJ69FFVvertqRn%2Bc7EGAu2CzBslM4fDbR4kUa1kbtU2AVosN9lwk6FWHpzKDWzxozabSKwyYByH1%2BO%2BjbrdqnOz9%2FoC1LVH6y67%2FbcxzVEFyPDgfVfIVp%2FK6TxonbfZzM1TRJ6YqeRDhCX6ZOqgUxj5URHUVg5gVfyrPHviUrwDN3KGDXW5valxB7vmIScsh2e7OheYSKTBs06vMQLsqzKLbrVJsNuRjMV8ZrOXTPs%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240713T184213Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5AHH34SF5D%2F20240713%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=ab42d63130d6b6ac4f663b8016d9fcce7ecf40a465d95ddd939ea61c18c5f8c3',
    //},
    url: 'https://vitessce-data-v2.s3.amazonaws.com/data/redBloodCell.ome.tiff',
    options: {
      offsetsUrl: 'https://vitessce-data-v2.s3.amazonaws.com/data/redBloodCell.offsets.json',
    },
    coordinationValues: {
      fileUid: 'kidney',
    },
  });

  const spatialThreeView = config.addView(dataset, 'spatialBeta').setProps({ three: true });
  const lcView = config.addView(dataset, 'layerControllerBeta');
  config.linkViewsByObject([spatialThreeView, lcView], {
    spatialTargetZ: 0,
    spatialTargetT: 0,
    spatialRenderingMode: '3D',
    imageLayer: CL([
      {
        fileUid: 'kidney',
        spatialLayerOpacity: 1,
        spatialTargetResolution: null,
        imageChannel: CL([
          {
            spatialTargetC: 0,
            spatialChannelColor: [0, 0, 255],
            spatialChannelVisible: true,
            spatialChannelOpacity: 1.0,
            spatialChannelWindow: [0.314, 1.570],
          },
          {
            spatialTargetC: 1,
            spatialChannelColor: [0, 255, 0],
            spatialChannelVisible: true,
            spatialChannelOpacity: 1.0,
            spatialChannelWindow: [0.44, 1.57],
          },
          {
            spatialTargetC: 2,
            spatialChannelColor: [255, 0, 255],
            spatialChannelVisible: true,
            spatialChannelOpacity: 1.0,
            spatialChannelWindow: [0.5, 1.57],
          },
          {
            spatialTargetC: 3,
            spatialChannelColor: [255, 255, 0],
            spatialChannelVisible: true,
            spatialChannelOpacity: 1.0,
            spatialChannelWindow: [0.86, 1.57],
          },
        ]),
      },
    ]),
  });

  config.layout(hconcat(spatialThreeView, lcView));

  const configJSON = config.toJSON();
  return configJSON;
}

export const humanLiver = generateThreeMinimalConfiguration();
