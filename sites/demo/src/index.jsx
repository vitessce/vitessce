import React from 'react';
import { createRoot } from 'react-dom/client';
import { VitessceDemo } from './vitessce-demo';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<VitessceDemo />);
