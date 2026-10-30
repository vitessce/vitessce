import { AbstractTwoStepLoader, LoaderResult } from '@vitessce/abstract';
import { ImageWrapper } from '@vitessce/image-utils';
import { CoordinationLevel as CL } from '@vitessce/config';
import { log } from '@vitessce/globals';
import type { VivLoaderType } from '@vitessce/types';
import {
  type Volume,
  getDisplayGeometry,
  getOutputDtype,
  toNgffMetadata,
  createSliceSource,
} from './volume.js';
import type { RadiologySource } from './RadiologySource.js';

type ImageData = { image: { instance: ImageWrapper }; featureIndex: string[] };

/**
 * Base loader for radiology volumes. Subclasses read their file format
 * into a Volume; this class turns it into an image for the spatial views.
 */
export abstract class VolumeLoader extends AbstractTwoStepLoader<RadiologySource> {
  result?: Promise<LoaderResult<ImageData>>;

  abstract loadVolume(): Promise<Volume>;

  async load() {
    if (!this.result) {
      this.result = this.loadVolume().then(volume => this.toLoaderResult(volume));
      // Allow a failed load to be retried.
      this.result.catch(() => { this.result = undefined; });
    }
    return this.result;
  }

  toLoaderResult(volume: Volume) {
    const geometry = getDisplayGeometry(volume.affine, [volume.width, volume.height, volume.depth]);
    if (geometry.isOblique) {
      log.warn(`${volume.name} is an oblique acquisition. Its rotation is ignored, so it may not align with other images.`);
    }
    const dtype = getOutputDtype(volume.rawDtype, volume.rawRange, volume.slope, volume.intercept);
    const vivLoader = {
      data: [createSliceSource(volume, geometry, dtype)],
      metadata: toNgffMetadata(volume, geometry),
    } as unknown as VivLoaderType;
    const imageWrapper = new ImageWrapper(vivLoader, this.options);

    const coordinationValues = {
      spatialTargetZ: imageWrapper.getDefaultTargetZ(),
      spatialTargetT: imageWrapper.getDefaultTargetT(),
      imageLayer: CL([
        {
          fileUid: this.coordinationValues?.fileUid || null,
          spatialLayerOpacity: 1.0,
          spatialLayerVisible: true,
          photometricInterpretation: 'BlackIsZero',
          volumetricRenderingAlgorithm: 'maximumIntensityProjection',
          spatialTargetResolution: null,
          imageChannel: CL([
            {
              spatialTargetC: 0,
              spatialChannelColor: [255, 255, 255],
              spatialChannelVisible: true,
              spatialChannelOpacity: 1.0,
              spatialChannelWindow: volume.window,
            },
          ]),
        },
      ]),
    };

    return new LoaderResult<ImageData>(
      {
        image: { instance: imageWrapper },
        featureIndex: imageWrapper.getChannelNames(),
      },
      this.url ? [{ url: this.url, name: volume.name }] : null,
      coordinationValues,
    );
  }
}
