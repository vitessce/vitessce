import { describe, it, expect } from 'vitest';
import { parseUrls } from './generate-config.js';

describe('generateConfig', () => {
  it('parses URLs', () => {
    const s1 = 'https://example.com/my_image.ome.tif';
    expect(parseUrls(s1)).toEqual([
      {
        url: 'https://example.com/my_image.ome.tif',
        fileType: 'image.ome-tiff',
      },
    ]);

    const s2 = 'https://example.com/my_image.ome.tif#obsSegmentations.ome-tiff';
    expect(parseUrls(s2)).toEqual([
      {
        url: 'https://example.com/my_image.ome.tif',
        fileType: 'obsSegmentations.ome-tiff',
      },
    ]);

    const s3 = 'https://example.com/my_image.ome.tif#obsSegmentations.ome-tiff;http://another.com/obj.zarr#anndata.zarr';
    expect(parseUrls(s3)).toEqual([
      {
        url: 'https://example.com/my_image.ome.tif',
        fileType: 'obsSegmentations.ome-tiff',
      },
      {
        url: 'http://another.com/obj.zarr',
        fileType: 'anndata.zarr',
      },
    ]);
  });
});
