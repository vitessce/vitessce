import React from 'react';
import clsx from 'clsx';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import ScreenshotImage from './_ScreenshotImage';
import styles from './styles.module.css';

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
    <div className={clsx('col', styles.feature)}>
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

export default function Home() {
  const context = useDocusaurusContext();
  const {siteConfig = {}} = context;

  return (
    <>
      <header className={clsx('hero hero--primary', styles.heroBanner)}>
        <div className={clsx("container", styles.heroContainer)}>
          <h1 className="hero__title">{siteConfig.title}</h1>
          <p className="hero__subtitle">{siteConfig.tagline}</p>
        </div>
      </header>
      <main>
        <section className={styles.homeScreenshots}>
          <ScreenshotImage filename="web.png" alt="Vitessce as a web application" />
          <ScreenshotImage filename="hubmap.png" alt="Vitessce as an embedded web component (HuBMAP Portal)" />
          <ScreenshotImage filename="jupyterlab.png" alt="Vitessce as an ipywidget in JupyterLab" />
          <ScreenshotImage filename="rstudio.png" alt="Vitessce as an htmlwidget in RStudio" />
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
    </>
  );
}
