import {
    VitessceConfig,
    CoordinationLevel as CL,
    hconcat,
    vconcat,
  } from '@vitessce/config';
  
  function generateLakeConfig() {
    const vc = new VitessceConfig({ schemaVersion: "1.0.16", name: "Lake et al." });
    const dataset = vc.addDataset("lake_et_al").addFile({
        "fileType": "anndata.zarr",
        "url": "https://storage.googleapis.com/vitessce-demo-data/scmd-analysis-october-2023/lake_et_al.2.h5ad.zarr",
        "coordinationValues": {
            "obsType": "cell",
            "featureType": "gene",
            "featureValueType": "expression",
            "embeddingType": "UMAP"
        },
        "options": {
            "obsFeatureMatrix": {
                //"path": "layers_temp/normalize_pearson_residuals_rechunked",
                "path": "layers/normalize_pearson_residuals",
                //"path": "layers/counts"
            },
            "obsEmbedding": {
                "path": "obsm/X_umap"
            },
            "obsSets": [
                {
                    "name": "Cell Type",
                    "path": "obs/cell_type"
                }
            ],
            "featureLabels": {
                "path": "var/feature_name",
            }
        }
    });

    const scatterplot = vc.addView(dataset, "scatterplot");
    const obsSets = vc.addView(dataset, "obsSets");
    const obsSetSizes = vc.addView(dataset, "obsSetSizes");
    const featureList = vc.addView(dataset, "featureList");
    const violinPlots = vc.addView(dataset, "obsSetFeatureValueDistribution");

    vc.linkViews([scatterplot], ["embeddingType"], ["UMAP"]);

    vc.layout(hconcat(
        vconcat(
            scatterplot,
            hconcat(
                obsSets,
                obsSetSizes,
            ),
        ),
        vconcat(
            featureList,
            violinPlots,
        ),
    ));
  
    const configJSON = vc.toJSON();
    return configJSON;
  }
  
  export const lake2023 = generateLakeConfig();
  