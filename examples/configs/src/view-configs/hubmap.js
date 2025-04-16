import { vapi } from '../utils.js';

function getConfig() {
  // Instantiate a view config object.
  const vc = new vapi.VitessceConfig({
    schemaVersion: '1.0.15',
    name: 'HBM485.TBWH.322',
    description: 'Large intestine snATAC-seq HuBMAP dataset with genomic data visualization powered by HiGlass',
  });
  // Add a dataset and its files.
  const csvUrl = 'https://data-1.vitessce.io/0.0.33/main/sn-atac-seq-hubmap-2020/human_intestine_2020_hubmap.cells.csv';
  const genomicProfilesUrl = 'https://data-1.vitessce.io/0.0.32/master_release/human_intestine_2020_hubmap/human_intestine_2020_hubmap.genomic-profiles.zarr';
  const dataset = vc
    .addDataset('HBM485.TBWH.322', 'Human large intestine, snATAC-seq')
    .addFile({
      url: csvUrl,
      fileType: vapi.ft.OBS_EMBEDDING_CSV,
      coordinationValues: { obsType: 'cell', embeddingType: 'UMAP' },
      options: {
        obsIndex: 'cell_id',
        obsEmbedding: ['UMAP_1', 'UMAP_2'],
      },
    })
    .addFile({
      url: csvUrl,
      fileType: vapi.ft.OBS_SETS_CSV,
      coordinationValues: {
        obsType: 'cell',
      },
      options: {
        obsIndex: 'cell_id',
        obsSets: [
          {
            name: 'Clusters',
            column: 'cluster',
          },
        ],
      },
    })
    .addFile({ url: genomicProfilesUrl, fileType: vapi.ft.GENOMIC_PROFILES_ZARR });
    // Add components.
    // Use mapping: "UMAP" so that cells are mapped to the UMAP positions from the JSON file.
  const umap = vc.addView(dataset, vapi.vt.SCATTERPLOT, { mapping: 'UMAP' });
  const cellSetsManager = vc.addView(dataset, vapi.vt.OBS_SETS);
  const genomicProfiles = vc.addView(dataset, vapi.vt.GENOMIC_PROFILES);

  // Try un-commenting the line below to link center points of the two scatterplots!
  // vc.linkViews([umap, tsne], [ct.EMBEDDING_TARGET_X, ct.EMBEDDING_TARGET_Y], [0, 0]);
  vc.layout(
    vapi.vconcat(
      genomicProfiles,
      vapi.hconcat(umap, cellSetsManager),
    ),
  );

  // Return the view config as JSON.
  return vc.toJSON();
}

export const hubmapIntestineSnAtacSeq = getConfig();
