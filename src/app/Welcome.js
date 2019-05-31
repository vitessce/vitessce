import React from 'react';

import { LIGHT_CARD } from '../components/classNames';
import version from '../version.json';

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

function Form(props) {
  const { configs } = props;
  return (
    <form method="GET">
      <h1><span role="img" aria-label="fast train!">🚄 </span> Vitessce</h1>
      <div>URL of dataset:</div>

      <div className="input-group mb-3">
        <input type="text" name="url" className="form-control" style={{ background: 'lightgrey' }} />
        <div className="input-group-append">
          <button className="btn btn-outline-secondary" type="submit">Load</button>
        </div>
      </div>

      <div>or select a dataset:</div>
      <DatasetList configs={configs} />
    </form>
  );
}

function Info() {
  return (
    <React.Fragment>
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
      </p>
      <ul>
        <li><a href="prod-docs/index.html">Documentation</a></li>
        <li><a href="https://github.com/hms-dbmi/vitessce">GitHub</a></li>
        <li><a href="https://www.npmjs.com/package/vitessce">NPM</a></li>
      </ul>
      <p>
        This demployment: branch={version.branch} | hash={version.hash} | date={version.date}
      </p>
    </React.Fragment>
  );
}

export default function Welcome(props) {
  const { configs } = props;
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-5">
          <div className={LIGHT_CARD}>
            <Form configs={configs} />
          </div>
        </div>
        <div className="col-7">
          <div className={LIGHT_CARD}>
            <Info />
          </div>
        </div>
      </div>
    </div>
  );
}
