import React from 'react';

import { LIGHT_CARD } from '../components/classNames';

function DatasetList(props) {
  const { configs } = props;
  const links = configs.map(
    ({ id, name, description }) => (
      <a
        href={`?dataset=${id}`}
        className="list-group-item list-group-item-action flex-column align-items-start bg-black"
        key={id}
      >
        <div className="d-flex w-100 justify-content-between">
          <h5>{name}</h5>
        </div>
        <p>{description}</p>
      </a>
    ),
  );
  return (
    <div className="list-group">
      {links}
    </div>
  );
}

export default function Welcome(props) {
  const { configs } = props;
  return (
    <div className="container-fluid d-flex flex-column align-items-end">
      <div className={LIGHT_CARD} style={{ width: '100%', maxWidth: '330px', margin: 'auto' }}>
        <form method="GET">
          <h1><span role="img" aria-label="fast train!">🚄 </span> Vitessce</h1>
          <div>
            Select a data set:
          </div>
          <DatasetList configs={configs} />
        </form>
      </div>
      <div className={LIGHT_CARD} style={{ width: '100%' }}>
        <p>
          This is a demo of key concepts for
          a <b>v</b>isual <b>i</b>ntegration <b>t</b>ool
          for <b>e</b>xploration of
          (<b>s</b>patial) <b>s</b>ingle-<b>c</b>ell <b>e</b>xperiment data.
          This demo focusses on scalable, linked visualizations that support both
          spatial and non-spatial representation of cell-level and molecule-level data.
        </p>
        <p>
          Vitessce is supported by the NIH Common Fund, through
          the <a href="https://commonfund.nih.gov/HuBMAP">Human BioMolecular Atlas Program (HuBMAP)</a>,
          Integration, Visualization & Engagement (HIVE) Initiative,
          RFA-RM-18-001.
        </p>
        <p>
          More information:
          <ul>
            <li><a href="prod-docs/index.html">Documentation</a></li>
            <li><a href="https://github.com/hms-dbmi/vitessce">GitHub</a></li>
            <li><a href="https://www.npmjs.com/package/vitessce">NPM</a></li>
          </ul>
        </p>
      </div>
    </div>
  );
}
