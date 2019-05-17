import React from 'react';
import { listConfigs } from './api';

import { LIGHT_CARD } from '../components/classNames';

function DatasetList() {
  const configs = listConfigs();
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

export default function Welcome() {
  return (
    <div className="container-fluid d-flex flex-column align-items-end">
      <div className={LIGHT_CARD} style={{ width: '100%', maxWidth: '330px', margin: 'auto' }}>
        <form method="GET">
          <h1><span role="img" aria-label="Fast Train">🚄 </span> Vitessce</h1>
          <div>
            <p>
              This is a demo of key concepts for a visual integration tool for exploration
              of (spatial) single-cell experiment data.
              This demo focusses on scalable, linked visualizations that support both
              spatial and non-spatial representation of cell-level and molecule-level data.
            </p>
            Select a data set below:
          </div>
          <DatasetList />
        </form>
      </div>
      <div className={LIGHT_CARD} style={{ width: '100%' }}>
        <p>
          Vitessce is supported by the NIH Common Fund, through the
          <a href="https://commonfund.nih.gov/HuBMAP">Human BioMolecular Atlas Program (HuBMAP)</a>,
          Integration, Visualization & Engagement (HIVE) Initiative,
          RFA-RM-18-001.
        </p>
      </div>
    </div>
  );
}
