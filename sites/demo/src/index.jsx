import React from 'react';
import { createRoot } from 'react-dom/client';
import log from 'loglevel';
import { VitessceDemo } from './vitessce-demo';

log.setLevel(log.levels.WARN);

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<VitessceDemo />);
