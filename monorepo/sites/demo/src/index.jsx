import React from 'react';
import { createRoot } from 'react-dom/client';
import { VitessceDemo } from './vitessce-demo';

// Register view type plugins
import { register as registerDescription } from '@vitessce/description';
import { register as registerObsSetsManager } from '@vitessce/obs-sets-manager';
import { register as registerScatterplot } from '@vitessce/scatterplot-embedding';

registerDescription();
registerObsSetsManager();
registerScatterplot();

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<VitessceDemo />);
