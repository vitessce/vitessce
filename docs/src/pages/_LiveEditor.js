import React from 'react';
import usePrismTheme from '@theme/hooks/usePrismTheme';
import { LiveProvider, LiveEditor, LiveError, LivePreview } from 'react-live';
import Highlight, { defaultProps } from "prism-react-renderer";
import BrowserOnly from '@docusaurus/BrowserOnly';
import styles from './styles.module.css';

const code = `function VitessceConfigEditor() {
    const bucketDomain = "https://s3.amazonaws.com"
    const baseUrl = bucketDomain + '/vitessce-data/0.0.31/master_release/dries';

    // Instantiate a view config object.
    const vc = new VitessceConfig("My config");
    // Add a dataset and its files.
    const dataset = vc
        .addDataset("Dries")
        .addFile(baseUrl + '/dries.cells.json', DataType.CELLS, FileType.CELLS_JSON)
        .addFile(baseUrl + '/dries.cell-sets.json', DataType.CELL_SETS, FileType.CELL_SETS_JSON);
    // Add components.
    // Use mapping: "UMAP" so that cells are mapped to the UMAP positions from the JSON file.
    const umap = vc.addView(dataset, Component.SCATTERPLOT, { mapping: "UMAP" });
    // Use mapping: "t-SNE" so that cells are mapped to the t-SNE positions from the JSON file.
    const tsne = vc.addView(dataset, Component.SCATTERPLOT, { mapping: "t-SNE" });
    // Add the cell sets controller component.
    const cellSetsManager = vc.addView(dataset, Component.CELL_SETS);
    // Add the cell set sizes bar plot component.
    const cellSetSizesPlot = vc.addView(dataset, Component.CELL_SET_SIZES);
    // Link the zoom levels of the two scatterplots.
    vc.linkViews([umap, tsne], [CoordinationType.EMBEDDING_ZOOM], [2.5]);
    // Try un-commenting the line below!
    //vc.linkViews([umap, tsne], [CoordinationType.EMBEDDING_TARGET_X, CoordinationType.EMBEDDING_TARGET_Y], [0, 0]);
    vc.layout(
        vconcat(
            hconcat(tsne, umap),
            hconcat(cellSetsManager, cellSetSizesPlot)
        )
    );

    return (
        <Highlight json={vc.toJSON()} />
    );
}`;

function JsonHighlight(props) {
    const {
        json,
    } = props;
    const prismTheme = usePrismTheme();
    const jsonCode = JSON.stringify(json, null, 2);
    return (
        <Highlight {...defaultProps} code={jsonCode} language="json" theme={prismTheme}>
            {({ className, style, tokens, getLineProps, getTokenProps }) => (
                <pre className={className} style={style}>
                    {tokens.map((line, i) => (
                    <div {...getLineProps({ line, key: i })}>
                        {line.map((token, key) => (
                        <span {...getTokenProps({ token, key })} />
                        ))}
                    </div>
                    ))}
                </pre>
            )}
        </Highlight>
    )
}

function LiveEditorHeader() {
    return (
        <p className={styles.liveEditorHeader}>Live editor</p>
    );
}

function LivePreviewHeader() {
    return (
        <p className={styles.livePreviewHeader}>Result</p>
    );
}

// Reference: https://github.com/mac-s-g/react-json-view/issues/121#issuecomment-670431408
export default function LiveViewConfigEditor() {
    const prismTheme = usePrismTheme();
    return (
        <BrowserOnly>
            {() => {
                const scope = {
                    Vitessce: require('../../../dist/umd/production/index.min.js').Vitessce,
                    VitessceConfig: require('../../../dist/umd/production/index.min.js').VitessceConfig,
                    hconcat: require('../../../dist/umd/production/index.min.js').hconcat,
                    vconcat: require('../../../dist/umd/production/index.min.js').vconcat,
                    Component: require('../../../dist/umd/production/index.min.js').Component,
                    DataType: require('../../../dist/umd/production/index.min.js').DataType,
                    FileType: require('../../../dist/umd/production/index.min.js').FileType,
                    CoordinationType: require('../../../dist/umd/production/index.min.js').CoordinationType,
                    Highlight: JsonHighlight,
                };
                return (
                    <LiveProvider code={code} scope={scope} theme={prismTheme}>
                        <LiveEditorHeader/>
                        <LiveEditor />
                        <LivePreviewHeader/>
                        <LiveError />
                        <LivePreview className={styles.livePreview} />
                    </LiveProvider>
                );
            }}
        </BrowserOnly>
    );
}