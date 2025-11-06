/* eslint-disable no-console */
import React from 'react';
import { UncontrolledLauncher } from '@vitessce/launcher';

import './index.css';

function Navbar() {
  return (
    <div className="navbar">
      <ul>
        <li><a href="https://vitessce.io/">Vitessce</a></li>
        <li><a href="https://vitessce.io/docs/">Docs</a></li>
        <li><a href="https://vitessce.io/examples/">Examples</a></li>
      </ul>
    </div>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="copyright">
          Copyright © 2025 <a href="http://hidivelab.org/">HIDIVE Lab</a>.
          <br/>
          Vitessce is open source and MIT licensed. Vitessce documentation is CC BY 4.0 licensed.
        </div>
        <div>
          <span className="section-title">Citation</span>
          <span className="citation-text">Keller, M.S., Gold, I., McCallum, C., Manz, T., Kharchenko, P.V., Gehlenborg, N. Vitessce: integrative visualization of multimodal and spatially resolved single-cell data. <i>Nature Methods</i> (2024). https://doi.org/10.1038/s41592-024-02436-x</span>
        </div>
        <div>
          <span className="section-title">Funding</span>
          <ul>
            <li>NIH/OD Human BioMolecular Atlas Program (HuBMAP) (OT2OD026677, PI: Nils Gehlenborg)</li>
            <li>NIH/NLM Biomedical Informatics and Data Science Research Training Program (T15LM007092, PI: Nils Gehlenborg)</li>
            <li>Harvard Stem Cell Institute (CF-0014-17-03, PI: Nils Gehlenborg)</li>
          </ul>
        </div>
        <div>
          <span>
            This deployment: branch=<pre>changeset-release/main</pre>, hash=<pre>492a271a</pre>, date=<pre>2025-10-24</pre>
          </span>
        </div>
      </div>
    </footer>
  );
}

export function VitessceApp() {
  return (
    <div className="app-container">
      <Navbar />
      <UncontrolledLauncher />
      <div className="spacer" />
      <Footer />
    </div>
  );
}
