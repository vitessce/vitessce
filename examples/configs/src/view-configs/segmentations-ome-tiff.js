export const segmentationsOmeTiff = {
  version: '1.0.6',
  name: 'HBM287.WDKX.539',
  description: 'CODEX of human spleen.',
  public: true,
  datasets: [
    {
      uid: 'HBM287.WDKX.539',
      name: 'HBM287.WDKX.539',
      files: [
        {
          fileType: 'image.ome-tiff',
          url: 'https://assets.hubmapconsortium.org/69d9c52bc9edb625b496cecb623ec081/ometiff-pyramids/pipeline_output/expr/reg001_expr.ome.tif',
          options: {
            offsetsUrl: 'https://assets.hubmapconsortium.org/69d9c52bc9edb625b496cecb623ec081/output_offsets/pipeline_output/expr/reg001_expr.offsets.json',
          },
        },
        {
          fileType: 'obsSegmentations.ome-tiff',
          url: 'https://assets.hubmapconsortium.org/69d9c52bc9edb625b496cecb623ec081/ometiff-pyramids/pipeline_output/mask/reg001_mask.ome.tif',
          options: {
            offsetsUrl: 'https://assets.hubmapconsortium.org/69d9c52bc9edb625b496cecb623ec081/output_offsets/pipeline_output/mask/reg001_mask.offsets.json',
          },
        },
      ],
    },
  ],
  initStrategy: 'auto',
  layout: [
    {
      component: 'spatial',
      x: 0,
      y: 0,
      w: 8,
      h: 12,
    },
    {
      component: 'layerController',
      x: 8,
      y: 0,
      w: 4,
      h: 6,
    },
    {
      component: 'description',
      x: 8,
      y: 6,
      w: 4,
      h: 3,
    },
    {
      component: 'status',
      x: 8,
      y: 9,
      w: 4,
      h: 3,
    },
  ],
};
