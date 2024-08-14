import React, { useEffect, useState, useMemo, useref } from 'react';
// import { pMap } from 'p-map';
import { viv, deck, DEFAULT_GL_OPTIONS } from '@vitessce/gl';
import { ImageWrapper } from '@vitessce/image-utils';


const histologyUrls = {
    // Histology, Left Kidney, Male (21)
    // https://portal.hubmapconsortium.org/search?raw_dataset_type_keyword-assay_display_name_keyword[Histology][0]=H%26E%20Stained%20Microscopy&raw_dataset_type_keyword-assay_display_name_keyword[Histology][1]=PAS%20Stained%20Microscopy&raw_dataset_type_keyword-assay_display_name_keyword[Histology][2]=PAS%20Stained%20Microscopy%20%5BKaggle-1%20Glomerulus%20Segmentation%5D&origin_samples.mapped_organ[0]=Kidney%20%28Left%29&donor.mapped_metadata.sex[0]=Male&entity_type[0]=Dataset
    case: [
        'https://assets.hubmapconsortium.org/8f528475e216c283851e6941841d7173/ometiff-pyramids/processedMicroscopy/VAN0016-LK-202-89-PAS_images/VAN0016-LK-202-89-PAS_registered.ome.tif?token=',
        'https://assets.hubmapconsortium.org/0ca61e7926956da9b8bdde2b1f3c43af/ometiff-pyramids/processedMicroscopy/VAN0010-LK-155-40-PAS_images/VAN0010-LK-155-40-PAS_registered.ome.tif?token=',
        'https://assets.hubmapconsortium.org/f4188a148e4c759092d19369d310883b/ometiff-pyramids/processedMicroscopy/VAN0006-LK-2-85-PAS_images/VAN0006-LK-2-85-PAS_registered.ome.tif?token=',
        'https://assets.hubmapconsortium.org/bd42ab2f422e45ce6b0f3f55171de8aa/ometiff-pyramids/processed_microscopy/VAN0054-LK-3-21-PAS_images/VAN0054-LK-3-21-PAS-registered.ome.tif?token=',
        'https://assets.hubmapconsortium.org/0e532ea7b2f7c9ca69fff06de5d7457f/ometiff-pyramids/processed_microscopy/VAN0046-LK-3-45-PAS_images/VAN0046-LK-3-45-PAS-registered.ome.tif?token=',
        'https://assets.hubmapconsortium.org/01581ae58c54ef3c1161978d6a1bc2d3/ometiff-pyramids/processed_microscopy/VAN0016-LK-203-107-PAS_images/VAN0016-LK-203-107-PAS-registered.ome.tif?token=',
        'https://assets.hubmapconsortium.org/2bca29d0a69634ff77027bba05c6f062/ometiff-pyramids/processed_microscopy/VAN0025-LK-3-18-PAS_images/VAN0025-LK-3-18-PAS-registered.ome.tif?token=',
        'https://assets.hubmapconsortium.org/5904902bf797c61d0fe4ec8a75df61bb/ometiff-pyramids/processed_microscopy/VAN0044-LK-1-46-PAS_images/VAN0044-LK-1-46-PAS-registered.ome.tif?token=',
        'https://assets.hubmapconsortium.org/d04a1abdf3546caf1896f0d9923027db/ometiff-pyramids/processed_microscopy/VAN0024-LK-2-55-PAS_images/VAN0024-LK-2-55-PAS-registered.ome.tif?token=',
        'https://assets.hubmapconsortium.org/0f3894d45b772804de43137fa8c353ed/ometiff-pyramids/processedMicroscopy/VAN0030-LK-3-383-PAS_IMS_images/VAN0030-LK-3-383-PAS_IMS-registered.ome.tif?token=',
        'https://assets.hubmapconsortium.org/81bb208fe47a5d3a97cf531b6ee7b99f/ometiff-pyramids/processedMicroscopy/VAN0035-LK-5-10-PAS_IMS_images/VAN0035-LK-5-10-PAS_IMS-registered.ome.tif?token=',
        'https://assets.hubmapconsortium.org/53dc270e357bdee13c453fba428a882c/ometiff-pyramids/processedMicroscopy/VAN0016-LK-203-68-PAS_IMS_images/VAN0016-LK-203-68-PAS_IMS-registered.ome.tif?token=',
        'https://assets.hubmapconsortium.org/a9fcc0db07e305327483471a7f219599/ometiff-pyramids/processedMicroscopy/VAN0006-LK-4-35-PAS_IMS_images/VAN0006-LK-4-35-PAS_IMS-registered.ome.tif?token=',
        'https://assets.hubmapconsortium.org/943437ad47a767c326ac09d49cab9542/ometiff-pyramids/processedMicroscopy/VAN0010-LK-152-8-PAS_IMS_images/VAN0010-LK-152-8-PAS_IMS-registered.ome.tif?token=',
        'https://assets.hubmapconsortium.org/9475d52f85b513caaa5359232b2cdb96/ometiff-pyramids/processedMicroscopy/VAN0010-LK-152-162_PAS_images/VAN0010-LK-152-162-PAS-registered.ome.tif?token=',
        'https://assets.hubmapconsortium.org/c384f98d970bf191927a37d0b46ca3db/ometiff-pyramids/processedMicroscopy/VAN0006-LK-4-2_PAS_images/VAN0006-LK-4-33-PAS-registered.ome.tif?token=',
        'https://assets.hubmapconsortium.org/35c957ce0c5545f7bc059e711a7e0c45/ometiff-pyramids/processedMicroscopy/VAN0009-LK-106-2-PAS_FFPE.ome.tif?token=',
        'https://assets.hubmapconsortium.org/187ec1fd772164bc8b6a8ea6dbf770ae/ometiff-pyramids/processedMicroscopy/VAN0009-LK-102-7-PAS_images/VAN0009-LK-102-7-PAS_registered.ome.tif?token=',
        'https://assets.hubmapconsortium.org/2952bdd4435a1c2a73ade7a19c011d8d/ometiff-pyramids/processedMicroscopy/VAN0010-LK-160-2-PAS_FFPE.ome.tif?token=',
        'https://assets.hubmapconsortium.org/02372aa02897532a31d0100079a99aeb/ometiff-pyramids/processedMicroscopy/VAN0006-LK-7-2-PAS_FFPE.ome.tif?token=',
        'https://assets.hubmapconsortium.org/ad2019a182a2842e6a40f53fe8a9453a/ometiff-pyramids/processedMicroscopy/VAN0016-LK-208-2-PAS_FFPE.ome.tif?token=',
    ],
    // Histology, Left Kidney, Female (21)
    // https://portal.hubmapconsortium.org/search?raw_dataset_type_keyword-assay_display_name_keyword[Histology][0]=H%26E%20Stained%20Microscopy&raw_dataset_type_keyword-assay_display_name_keyword[Histology][1]=PAS%20Stained%20Microscopy&raw_dataset_type_keyword-assay_display_name_keyword[Histology][2]=PAS%20Stained%20Microscopy%20%5BKaggle-1%20Glomerulus%20Segmentation%5D&origin_samples.mapped_organ[0]=Kidney%20%28Left%29&donor.mapped_metadata.sex[0]=Female&entity_type[0]=Dataset
    control: [
        'https://assets.hubmapconsortium.org/3cf1c86138af2bbd1ea05da37dd00eec/ometiff-pyramids/processed_microscopy/VAN0031-LK-3-97-PAS_images/VAN0031-LK-3-97-PAS-registered.ome.tif?token=',
        'https://assets.hubmapconsortium.org/6b00e22e4baed73b300ae3c0fd4b4fe5/ometiff-pyramids/processed_microscopy/VAN0045-LK-3-25-PAS_images/VAN0045-LK-3-25-PAS-registered.ome.tif?token=',
        'https://assets.hubmapconsortium.org/0eeec0fb784350446438bf0a22e04880/ometiff-pyramids/processed_microscopy/VAN0007-LK-202-13-PAS_images/VAN0007-LK-202-13-PAS-registered.ome.tif?token=',
        'https://assets.hubmapconsortium.org/cfc8d3bae40b30ae578a43b0cd7c82a9/ometiff-pyramids/processed_microscopy/VAN0028-LK-2-31-PAS_images/VAN0028-LK-2-31-PAS-registered.ome.tif?token=',
        'https://assets.hubmapconsortium.org/674992adc38b332d2cc712f6ab11de0d/ometiff-pyramids/processed_microscopy/VAN0014-LK-203-191-PAS_images/VAN0014-LK-203-191-PAS-registered.ome.tif?token=',
        'https://assets.hubmapconsortium.org/bbc2fcbd0afc61d63045dd73326fce91/ometiff-pyramids/processed_microscopy/VAN0041-LK-1-45-PAS_images/VAN0041-LK-1-45-PAS-registered.ome.tif?token=',
        'https://assets.hubmapconsortium.org/c34397109dddf9ef82b4126d80f96fe2/ometiff-pyramids/processedMicroscopy/VAN0028-LK-4-8-PAS_IMS_images/VAN0028-LK-4-8-PAS_IMS-registered.ome.tif?token=',
        'https://assets.hubmapconsortium.org/edb76c1192da8f4d076b1862b3775ce4/ometiff-pyramids/processedMicroscopy/VAN0013-LK-203-8-PAS_IMS_images/VAN0013-LK-203-8-PAS_IMS-registered.ome.tif?token=',
        'https://assets.hubmapconsortium.org/15039c1e4e77bd81b297ff9fd98711ca/ometiff-pyramids/processedMicroscopy/VAN0031-LK-3-63-PAS_IMS_images/VAN0031-LK-3-63-PAS_IMS-registered.ome.tif?token=',
        'https://assets.hubmapconsortium.org/2cc5a31c10730dba1816a5d84d47247a/ometiff-pyramids/processedMicroscopy/VAN0031-LK-2-38-PAS_IMS_images/VAN0031-LK-2-38-PAS_IMS-registered.ome.tif?token=',
        'https://assets.hubmapconsortium.org/8a0a2d649b246ba8b688ac3521163624/ometiff-pyramids/processedMicroscopy/VAN0031-LK-2-58_PAS_images/VAN0031-LK-2-58-PAS-registered.ome.tif?token=',
        'https://assets.hubmapconsortium.org/7d30e20e48830cc3e74e961da349f08d/ometiff-pyramids/processedMicroscopy/VAN0014-LK-207-2-PAS_FFPE.ome.tif?token=',
        'https://assets.hubmapconsortium.org/f9ae931b8b49252f150d7f8bf1d2d13f/ometiff-pyramids/processedMicroscopy/VAN0003-LK-33-2-PAS_FFPE.ome.tif?token=',
        'https://assets.hubmapconsortium.org/1eadf62812799712d4b1232cc92b132f/ometiff-pyramids/processedMicroscopy/VAN0003-LK-32-21-PAS_images/VAN0003-LK-32-21-PAS_registered.ome.tif?token=',
        'https://assets.hubmapconsortium.org/ca224d0c1a0144240858490e3df46f83/ometiff-pyramids/processedMicroscopy/VAN0013-LK-206-2-PAS_FFPE.ome.tif?token=',
        'https://assets.hubmapconsortium.org/0bf9cb40adebcfb261dfbe9244607508/ometiff-pyramids/processedMicroscopy/VAN0013-LK-202-96-PAS_images/VAN0013-LK-202-96-PAS_registered.ome.tif?token=',
        'https://assets.hubmapconsortium.org/23f1637a0a90fdd2a8feece44d00c22e/ometiff-pyramids/processedMicroscopy/VAN0007-LK-203-103-PAS_images/VAN0007-LK-203-103-PAS_registered.ome.tif?token=',
        'https://assets.hubmapconsortium.org/4a1f8f0e22cf184574896ee1005c01c7/ometiff-pyramids/processedMicroscopy/VAN0014-LK-203-108-PAS_images/VAN0014-LK-203-108-PAS_registered.ome.tif?token=',
        'https://assets.hubmapconsortium.org/f1d381de35954d4218c2f07b2716b7ca/ometiff-pyramids/processed_microscopy/VAN0051-LK-3-23-PAS_images/VAN0051-LK-3-23-PAS-registered.ome.tif?token=',
        'https://assets.hubmapconsortium.org/a672cd1e2665fe9684d61574338ee138/ometiff-pyramids/processed_microscopy/VAN0053-LK-3-23-PAS_images/VAN0053-LK-3-23-PAS-registered.ome.tif?token=',
        'https://assets.hubmapconsortium.org/9100ad521113c5e71ff9d7186bd4b275/ometiff-pyramids/processed_microscopy/VAN0023-LK-1-49-PAS_images/VAN0023-LK-1-49-PAS-registered.ome.tif?token=',
    ]
}

// TODO: do the same for Visium, etc. Use SpatialData to store multiple in same container?

async function loadOffsets(tiffUrl) {
    const offsetsUrl = tiffUrl.replace('.ome.tif', '.offsets.json');
    const res = await fetch(offsetsUrl);
    if (res.ok) {
        const offsets = await res.json();
        return offsets;
    }
    console.warn(`OME-TIFF offsets JSON file failed to load: ${res.status} from ${res.url}`);
    return undefined
}




export function SmallMultiples(props) {
    const {
        deckRef,
        uuid,
        width,
        height,
    } = props;

    const [thumbnails, setThumbnails] = useState(null);

    async function loadImages() {
      const promises = histologyUrls.case.map(async (tiffUrl) => {
  
          const offsets = await loadOffsets(tiffUrl);
          const loader = await viv.loadOmeTiff(tiffUrl, { offsets });
          const imageWrapper = new ImageWrapper(loader);
          const thumbnail = await imageWrapper.loadThumbnail();
          return thumbnail;
      });
      const thumbnailsInner = await Promise.all(promises);
  
  
      console.log(thumbnailsInner);
      setThumbnails(thumbnailsInner);
  }

    // TODO: load via react-query?
    // TODO: load both case and control arrays.
    // TODO: load based on sampleSets
    useEffect(() => {

        loadImages();
        
    }, []);

    function scaleBounds(x, y, tileWidth, tileHeight) {
      return [
        x/thumbnails.length * width,
        y/thumbnails.length * height,
        (x/thumbnails.length * width) + tileWidth,
        (y/thumbnails.length * height) + tileHeight,
      ];
    }


    const layers = useMemo(() => {
      if(!thumbnails) {
        return []
      }
      return thumbnails.map((thumbnail, i) => {
        const y = i;
        const x = i;
        return new viv.XRLayer({
          channelData: thumbnail.data,
          channelsVisible: [true, true, true],
          contrastLimits: [[0, 255], [0, 255], [0, 255]],
          bounds: scaleBounds(x, y, thumbnail.data.width, thumbnail.data.height),
          id: `${uuid}-GridLayer-${i}`,
          dtype: thumbnail.dtype || "Uint8", // fallback if missing,
          pickable: false,
          extensions: [new viv.ColorPaletteExtension()],
          selections: [
            { c: 0, t: 0, z: 0 },
            { c: 1, t: 0, z: 0 },
            { c: 2, t: 0, z: 0 }
          ],
        });
      })
    }, [thumbnails]);

    // TODO: use DeckGL + viv.XRLayer to render each thumbnail
    // Reference: https://github.com/hms-dbmi/vizarr/blob/456ee8d412f7138f6d6c07bab354def5e6827d5b/src/gridLayer.ts#L142C5-L155C8

  return (
    <>
      <deck.DeckGL
        id={`deckgl-overlay-${uuid}`}
        ref={deckRef}
        views={[
          new deck.OrthographicView({
            id: 'ortho',
          })
        ]} // id is a fix for https://github.com/uber/deck.gl/issues/3259
        layers={
          layers
        }
        initialViewState={{ zoom: 0, target: [0, 0, 0] }}
        glOptions={DEFAULT_GL_OPTIONS}
        //onWebGLInitialized={this.onWebGLInitialized}
        //onViewStateChange={this.onViewStateChange}
        //viewState={viewState}
        useDevicePixels={true}
        controller={true}
        //getCursor={tool ? getCursorWithTool : getCursor}
        //onHover={this.onHover}
      />
    </>
  );
}