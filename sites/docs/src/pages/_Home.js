/* eslint-disable react/no-array-index-key */
import React, { useMemo } from 'react';
import clsx from 'clsx';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { useColorMode } from '@docusaurus/theme-common';
import {
  MultiModalIcon,
  SpatialIcon,
  ThreeDIcon,
  ServerlessIcon,
} from './_FeatureIcons.js';
import styles from './styles.module.css';

const features = [
  {
    icon: MultiModalIcon,
    title: 'Multi-Modal',
    description:
      'Integrate microscopy, transcriptomics, proteomics, and genome-mapped data from single-cell (dissociated) or spatial biology assays in a single visualization tool.',
  },
  {
    icon: SpatialIcon,
    title: 'Spatial & Interactive',
    description:
      'Explore spatially resolved data with coordinated, linked views including spatial plots, scatterplots, heatmaps, and genome browser tracks.',
  },
  {
    icon: ThreeDIcon,
    title: '3D Visualization',
    description:
      'Explore 3D tissue maps and volumetric imaging with meshes, OME-NGFF volumes, and XR-compatible views.',
  },
  {
    icon: ServerlessIcon,
    title: 'Serverless',
    description:
      'Visualize large datasets from cloud storage systems like AWS S3 and Google Cloud buckets. No servers to manage.',
  },
];

const platforms = [
  {
    key: 'web',
    filename: 'web.png',
    title: 'Web Application',
    description: 'Standalone browser-based visualization',
    anchor: '#web-application',
  },
  {
    key: 'hubmap',
    filename: 'hubmap.png',
    title: 'HuBMAP Portal',
    description: 'Embedded component in data portals',
    anchor: '#embedded-component',
  },
  {
    key: 'jupyter',
    filename: 'jupyterlab.png',
    title: 'JupyterLab',
    description: 'Python ipywidget for notebooks',
    anchor: '#python-jupyter-widget',
  },
  {
    key: 'rstudio',
    filename: 'rstudio.png',
    title: 'RStudio',
    description: 'R htmlwidget for data analysis',
    anchor: '#r-htmlwidget',
  },
];

// Full pool of examples; a random subset is shown on each page load.
const allExamples = [
  {
    key: 'codeluppi-2018',
    title: 'Codeluppi et al., 2018',
    description: 'osmFISH spatial transcriptomics with imaging overlay',
  },
  {
    key: 'kuppe-2022',
    title: 'Kuppe et al., 2022',
    description: 'Multi-modal spatial and single-cell myocardial analysis',
  },
  {
    key: 'jain-2024',
    title: 'Jain et al., 2024',
    description: '3D tissue maps with meshes and OME-TIFF imaging',
  },
  {
    key: 'meta-2022-azimuth',
    title: 'Tabula Sapiens (Azimuth)',
    description: 'Large-scale single-cell reference atlas',
  },
  {
    key: 'spraggins-2020',
    title: 'Spraggins et al., 2020',
    description: 'MALDI IMS multi-modal kidney tissue imaging',
  },
  {
    key: 'blin-2019',
    title: 'Blin et al., 2019',
    description: '3D OME-NGFF volumetric light-sheet imaging',
  },
  {
    key: 'wang-2018',
    title: 'Wang et al., 2018',
    description: 'Multiplexed FISH single-cell gene expression',
  },
  {
    key: 'neumann-2020',
    title: 'Neumann et al., 2020',
    description: 'Multi-modal kidney imaging with OME-TIFF',
  },
  {
    key: 'human-lymph-node-10x-visium',
    title: 'Human Lymph Node (10x Visium)',
    description: 'Spatial transcriptomics with H&E imaging',
  },
  {
    key: 'marshall-2022',
    title: 'Marshall et al., 2022',
    description: 'High-plex RNA imaging of the developing mouse brain',
  },
  {
    key: 'combat-2022',
    title: 'COMBAT Consortium, 2022',
    description: 'Multi-modal COVID-19 immune landscape atlas',
  },
  {
    key: 'salcher-2022',
    title: 'Salcher et al., 2022',
    description: 'Pan-cancer single-cell atlas at scale',
  },
  {
    key: 'maynard-2021',
    title: 'Maynard et al., 2021',
    description: 'Spatial transcriptomics of the human dorsolateral prefrontal cortex',
  },
  {
    key: 'sorger-2024-4',
    title: 'Sorger et al., 2024',
    description: '3D tissue architecture with multiplexed imaging',
  },
  {
    key: 'satija-2020',
    title: 'Satija et al., 2020',
    description: 'PBMC scRNA-seq reference with AnnData/Zarr',
  },
];

const FEATURED_COUNT = 6;

/**
 * Shuffle an array by sorting with a random comparator (returns new array).
 */
function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function FeatureCard({ icon: Icon, title, description }) {
  return (
    <div className={styles.featureCard}>
      <div className={styles.featureCardHeader}>
        <Icon className={styles.featureIcon} />
        <h3 className={styles.featureTitle}>{title}</h3>
      </div>
      <p className={styles.featureDescription}>{description}</p>
    </div>
  );
}

function PlatformCard({ filename, title, description, anchor, introUrl, isDarkTheme }) {
  const theme = isDarkTheme ? 'dark' : 'light';
  const imgSrc = useBaseUrl(`/img/screenshots/${theme}/${filename}`);
  return (
    <a href={`${introUrl}${anchor}`} className={styles.platformCard}>
      <img src={imgSrc} alt={title} className={styles.platformCardImage} />
      <div className={styles.platformCardBody}>
        <h3 className={styles.platformCardTitle}>{title}</h3>
        <p className={styles.platformCardDescription}>{description}</p>
      </div>
    </a>
  );
}

function ExampleCard({ configKey, title, description, isDarkTheme }) {
  const theme = isDarkTheme ? 'dark' : 'light';
  const imgSrc = useBaseUrl(`/img/examples/${theme}/${configKey}.png`);
  const href = useBaseUrl(`/#?dataset=${configKey}`);

  return (
    <a href={href} className={styles.exampleCard}>
      <img
        src={imgSrc}
        alt={title}
        className={styles.exampleCardImage}
        loading="lazy"
      />
      <div className={styles.exampleCardOverlay}>
        <h3 className={styles.exampleCardTitle}>{title}</h3>
        <p className={styles.exampleCardDescription}>{description}</p>
      </div>
    </a>
  );
}

export default function Home() {
  const { siteConfig = {} } = useDocusaurusContext();
  const { colorMode } = useColorMode();
  const isDarkTheme = (colorMode === 'dark');
  const theme = isDarkTheme ? 'dark' : 'light';

  const introUrl = useBaseUrl('/docs/platforms/');
  // Hero always has a dark background, so always use the light (white text) logo.
  const logoUrl = useBaseUrl('/img/logo-vitessce-light.png');
  const heroImgSrc = useBaseUrl(`/img/examples/${theme}/hero.png`);
  const examplesUrl = useBaseUrl('/examples/');

  // Pick a random subset of examples on mount (stable for the session).
  const featuredExamples = useMemo(() => shuffle(allExamples).slice(0, FEATURED_COUNT), []);

  const paperImgSrc = useBaseUrl('/img/nature-methods-paper.png');

  return (
    <>
      {/* Section 1: Hero — split layout */}
      <header className={styles.heroBanner}>
        <div className={styles.heroSplit}>
          <div className={styles.heroText}>
            <img className={styles.heroLogo} src={logoUrl} title="Vitessce" alt="Vitessce logo" />
            <p className={styles.heroTagline}>{siteConfig.tagline}</p>
            <p className={styles.heroSub}>
              A framework for interactive, integrative visualization of multi-omics
              data across spatial and dissociated single-cell experiments.
            </p>
            <div className={styles.heroCta}>
              <a href={examplesUrl} className={styles.heroCtaPrimary}>
                View Examples
              </a>
              <a
                href="https://doi.org/10.1038/s41592-024-02436-x"
                className={styles.heroCtaSecondary}
                target="_blank"
                rel="noopener noreferrer"
              >
                Read the Paper
              </a>
            </div>
          </div>
          <div className={styles.heroImageWrapper}>
            <img
              src={heroImgSrc}
              alt="Vitessce spatial biology visualization"
              loading="eager"
            />
          </div>
        </div>
      </header>

      <main>
        {/* Section 2: Features — compact horizontal strip */}
        <section className={styles.featuresStrip}>
          <div className={styles.featuresStripInner}>
            {features.map((f, i) => (
              <FeatureCard key={i} {...f} />
            ))}
          </div>
        </section>

        {/* Section 3: Featured Examples — 3x2 mosaic */}
        <section className={styles.sectionFull}>
          <div className={styles.sectionInner}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionHeading}>View Examples</h2>
              <a href={examplesUrl} className={styles.sectionLink}>View all &rarr;</a>
            </div>
            <div className={styles.examplesMosaic}>
              {featuredExamples.map((e) => (
                <ExampleCard key={e.key} configKey={e.key} {...e} isDarkTheme={isDarkTheme} />
              ))}
            </div>
          </div>
        </section>

        {/* Section 4: Platforms — compact row */}
        <section className={clsx(styles.sectionFull, styles.sectionAlt)}>
          <div className={styles.sectionInner}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionHeading}>Use Vitessce Anywhere</h2>
            </div>
            <p className={styles.sectionSub}>
              Available as a standalone web app, embeddable component, and widgets
              for Python and R.
            </p>
            <div className={styles.platformsRow}>
              {platforms.map((p) => (
                <PlatformCard key={p.key} {...p} introUrl={introUrl} isDarkTheme={isDarkTheme} />
              ))}
            </div>
          </div>
        </section>

        {/* Section 5: Publication */}
        <section className={styles.sectionFull}>
          <div className={styles.sectionInner}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionHeading}>Read the Paper</h2>
            </div>
            <div className={styles.publicationRow}>
              <a
                href="https://doi.org/10.1038/s41592-024-02436-x"
                className={styles.publicationImageLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={paperImgSrc}
                  alt="Vitessce paper first page — Nature Methods 2024"
                  className={styles.publicationImage}
                  loading="lazy"
                />
              </a>
              <div className={styles.publicationText}>
                <h3 className={styles.publicationTitle}>
                  Vitessce: integrative visualization of multimodal and spatially resolved
                  single-cell data
                </h3>
                <p className={styles.publicationAuthors}>
                  Keller, M.S., Gold, I., McCallum, C., Manz, T., Kharchenko, P.V., &amp; Gehlenborg, N.
                </p>
                <p className={styles.publicationMeta}>
                  <em>Nature Methods</em> 22, 63&ndash;67 (2025) &middot; DOI: 10.1038/s41592-024-02436-x
                </p>
                <p className={styles.publicationAbstract}>
                  Multiomics technologies with single-cell and spatial resolution make it possible
                  to measure thousands of features across millions of cells. However, visual analysis
                  of high-dimensional transcriptomic, proteomic, genome-mapped and imaging data types
                  simultaneously remains a challenge. Here we describe Vitessce, an interactive
                  web-based visualization framework for exploration of multimodal and spatially
                  resolved single-cell data. We demonstrate integrative visualization of millions of
                  data points, including cell-type annotations, gene expression quantities, spatially
                  resolved transcripts and cell segmentations, across multiple coordinated views.
                </p>
                <a
                  href="https://doi.org/10.1038/s41592-024-02436-x"
                  className={styles.heroCtaPrimary}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Read the Paper
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
