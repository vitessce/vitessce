import { vapi } from '../utils';

function getConfig() {
  // Instantiate a view config object.
  const vc = new vapi.VitessceConfig({
    schemaVersion: '1.0.0',
    name: 'HBM485.TBWH.322',
    description: 'Large intestine snATAC-seq HuBMAP dataset with genomic data visualization powered by HiGlass',
  });
  // Add a dataset and its files.
  const baseUrl = 'https://vitessce-data.s3.amazonaws.com/0.0.32/master_release/human_intestine_2020_hubmap';
  const dataset = vc
    .addDataset('HBM485.TBWH.322', 'Human large intestine, snATAC-seq')
    .addFile({ url: `${baseUrl}/human_intestine_2020_hubmap.cells.json`, fileType: vapi.ft.CELLS_JSON })
    .addFile({ url: `${baseUrl}/human_intestine_2020_hubmap.cell-sets.json`, fileType: vapi.ft.CELL_SETS_JSON })
    .addFile({ url: `${baseUrl}/human_intestine_2020_hubmap.genomic-profiles.zarr`, fileType: vapi.ft.GENOMIC_PROFILES_ZARR });
    // Add components.
    // Use mapping: "UMAP" so that cells are mapped to the UMAP positions from the JSON file.
  const umap = vc.addView(dataset, vapi.cm.SCATTERPLOT, { mapping: 'UMAP' });
  const cellSetsManager = vc.addView(dataset, vapi.cm.CELL_SETS);
  const genomicProfiles = vc.addView(dataset, vapi.cm.GENOMIC_PROFILES);

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
