import React from 'react';
import { createRoot } from 'react-dom/client';
import { MyComponent } from 'vitessce';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<MyComponent color="purple" a={1} b={2} />);
