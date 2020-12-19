---
id: view-config-live-editor
title: Live editor
sidebar_label: Live editor
slug: /view-config-live-editor
---

Try using the `VitessceConfig` class in the editor below and watch how the JSON output changes!

:::note
In this live editor we have already imported the required classes and functions. In practice you will need to import these yourself with the following line of code.

```js
import { Vitessce, VitessceConfig, hconcat, vconcat } from 'vitessce';
```
:::

```jsx live
function VitessceConfigEditor() {
    const bucketDomain = "https://s3.amazonaws.com"
    const baseUrl = `${bucketDomain}/vitessce-data/0.0.31/master_release/dries`;

    // Instantiate a view config object.
    const vc = new VitessceConfig("My config");
    // Add a dataset and its files.
    const dataset = vc
        .addDataset("Dries")
        .addFile(`${baseUrl}/dries.cells.json`, 'cells', 'cells.json')
        .addFile(`${baseUrl}/dries.cell-sets.json`, 'cell-sets', 'cell-sets.json');
    // Add components.
    const umap = vc.addView(dataset, "scatterplot", { mapping: "UMAP" });
    const tsne = vc.addView(dataset, "scatterplot", { mapping: "t-SNE" });
    const cellSetsManager = vc.addView(dataset, "cellSets");
    const cellSetSizesPlot = vc.addView(dataset, "cellSetSizes");
    // Link the zoom levels of the two scatterplots.
    vc.linkViews([umap, tsne], ["embeddingZoom"], [2.5]);
    // Try un-commenting the line below!
    //vc.linkViews([umap, tsne], ["embeddingTargetX", "embeddingTargetY"], [0, 0]);
    vc.layout(
        vconcat(
            hconcat(tsne, umap),
            hconcat(cellSetsManager, cellSetSizesPlot)
        )
    );

    return (
        <>
            <pre>{JSON.stringify(vc.toJSON(), null, 2)}</pre>
            {/* I wonder what this part does... */}
            {/*<div style={{ height: '600px' }}>
                <Vitessce config={vc.toJSON()} height={600} theme="light" />
            </div>*/}
        </>
    );
}
```