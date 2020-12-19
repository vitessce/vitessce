import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import { VitessceConfig, hconcat, vconcat } from '../../../dist/umd/production/index.min.js';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import ThemedVitessce from './_ThemedVitessce';
import styles from './styles.module.scss';

const config = new VitessceConfig("Dries");
const dataset = config
  .addDataset("Dries")
  .addFile("https://s3.amazonaws.com/vitessce-data/0.0.31/master_release/dries/dries.cells.json", 'cells', 'cells.json')
  .addFile("https://s3.amazonaws.com/vitessce-data/0.0.31/master_release/dries/dries.cell-sets.json", 'cell-sets', 'cell-sets.json');
const spatial = config.addView(dataset, "spatial");
const umap = config.addView(dataset, "scatterplot", { mapping: "UMAP" });
const tsne = config.addView(dataset, "scatterplot", { mapping: "t-SNE" });
const cellSets = config.addView(dataset, "cellSets");
const cellSetSizes = config.addView(dataset, "cellSetSizes");
config.linkViews([umap], ["embeddingZoom"], [2.5]);
config.linkViews([tsne], ["embeddingZoom"], [2.5]);
config.linkViews([spatial], ["spatialTargetX", "spatialTargetY", "spatialZoom"], [3800, -900, -4.4])
config.layout(vconcat(hconcat(tsne, umap, cellSets), hconcat(spatial, cellSetSizes)));

const configJson = config.toJSON();

const features = [
  {
    title: 'Interactive',
    description: (
      <>
        Vitessce consists of reusable interactive components including a scatterplot, spatial+imaging plot, genome browser tracks, statistical plots, and controller components, built on web technologies such as WebGL.
      </>
    ),
  },
  {
    title: 'Integrative',
    description: (
      <>
        Vitessce enables visual analysis of multi-modal assay types which probe biological systems through techniques such as microscopy, genomics, and transcriptomics.
      </>
    ),
  },
  {
    title: 'Serverless',
    description: (
      <>
        Visualize large datasets stored in static cloud object stores such as AWS S3. No need to manage or pay for expensive compute infrastructure for visualization purposes.
      </>
    ),
  },
];

function Feature({imageUrl, title, description}) {
  const imgUrl = useBaseUrl(imageUrl);
  return (
    <div className={clsx('col col--4', styles.feature)}>
      {imgUrl && (
        <div className="text--center">
          <img className={styles.featureImage} src={imgUrl} alt={title} />
        </div>
      )}
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

function Home() {
  const context = useDocusaurusContext();
  const {siteConfig = {}} = context;
  const height = 600;
  return (
    <Layout
      description="Description will go into a meta tag in <head />">
      <header className={clsx('hero hero--primary', styles.heroBanner)}>
        <div className="container">
          <h1 className="hero__title">{siteConfig.title}</h1>
          <p className="hero__subtitle">{siteConfig.tagline}</p>
        </div>
      </header>
      <main>
        <section style={{ height: `${height}px` }}>
          <ThemedVitessce
            height={height}
            config={configJson}
          />
        </section>
        {features && features.length > 0 && (
          <section className={styles.features}>
            <div className="container">
              <div className="row">
                {features.map((props, idx) => (
                  <Feature key={idx} {...props} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </Layout>
  );
}

export default Home;
