export const convenienceFileDefsCollapsed = {
  version: '1.0.15',
  name: 'My config name',
  description: 'My config description',
  initStrategy: 'auto',
  datasets: [
    {
      files: [
        {
          fileType: 'anndata.convenience.zarr',
          url: 'http://localhost:8000/my_anndata.zarr',
          options: {
            cells: {
              xy: 'obsm/centroids',
            },
            cellSets: [
              {
                groupName: 'Leiden',
                setName: 'obs/leiden',
              },
            ],
          },
        },
      ],
      name: 'A',
      uid: 'A',
    },
  ],
  layout: [],
};

export function pluginExpandAnnDataConvenience(fileDef) {
  return [
    {
      fileType: 'anndata-cells.zarr',
      url: fileDef.url,
      options: fileDef.options.cells,
    },
    {
      fileType: 'anndata-cell-sets.zarr',
      url: fileDef.url,
      options: fileDef.options.cellSets,
    },
  ];
}

export const convenienceFileDefsExpanded = {
  version: '1.0.15',
  name: 'My config name',
  description: 'My config description',
  initStrategy: 'auto',
  datasets: [
    {
      files: [
        {
          fileType: 'anndata-cells.zarr',
          url: 'http://localhost:8000/my_anndata.zarr',
          options: {
            xy: 'obsm/centroids',
          },
        },
        {
          fileType: 'anndata-cell-sets.zarr',
          url: 'http://localhost:8000/my_anndata.zarr',
          options: [
            {
              groupName: 'Leiden',
              setName: 'obs/leiden',
            },
          ],
        },
      ],
      name: 'A',
      uid: 'A',
    },
  ],
  layout: [],
};
