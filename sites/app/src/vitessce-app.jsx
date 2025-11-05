/* eslint-disable no-console */
import React from 'react';
import { UncontrolledLauncher } from '@vitessce/launcher';

import './index.css';

function Navbar() {
  return (
    <div className="navbar">
      <ul>
        <li>Vitessce</li>
        <li>App</li>
        <li>Examples</li>
        <li>Docs</li>
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
