import React from 'react';
import { createRoot } from 'react-dom/client';
import { VitessceDemo } from './vitessce-demo';

// Register view type plugins
import { register as registerDescription } from '@vitessce/description';

registerDescription();

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<VitessceDemo />);
