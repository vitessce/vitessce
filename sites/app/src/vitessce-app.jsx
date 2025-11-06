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

export function VitessceApp() {
  return (
    <>
      <Navbar />
      <UncontrolledLauncher />
    </>
  );
}
