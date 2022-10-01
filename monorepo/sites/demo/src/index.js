import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { createRoot } from 'react-dom/client';
import { VitessceDemo } from './vitessce-demo';
const container = document.getElementById('root');
const root = createRoot(container);
root.render(_jsx(VitessceDemo, {}));
