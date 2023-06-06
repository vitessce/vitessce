/* eslint-disable */
import React, { useState } from 'react';
import ReactDOM from 'react-dom'
import { Vitessce } from 'vitessce';

const e = React.createElement;

const params = new URLSearchParams(document.location.search);
const withUid = params.get("withUid") === 'true';

const configs = [
  {
    name: 'First config',
    uid: (withUid ? 'config-0' : undefined),
    version: '1.0.16',
    description: '',
    datasets: [],
    initStrategy: 'auto',
    coordinationSpace: { },
    layout: [
      {
        component: 'description',
        props: {
          description: 'First config, first view',
        },
        x: 0,
        y: 0,
        w: 12,
        h: 12,
      },
    ],
  },
  {
    name: 'Second config',
    uid: (withUid ? 'config-1' : undefined),
    version: '1.0.16',
    description: '',
    datasets: [],
    initStrategy: 'auto',
    coordinationSpace: { },
    layout: [
      {
        component: 'description',
        props: {
          description: 'Second config, first view',
        },
        x: 0,
        y: 0,
        w: 6,
        h: 6,
      },
      {
        component: 'description',
        props: {
          description: 'Second config, second view',
        },
        x: 6,
        y: 0,
        w: 6,
        h: 6,
      },
      {
        component: 'description',
        props: {
          description: 'Second config, third view',
        },
        x: 6,
        y: 6,
        w: 6,
        h: 6,
      },
    ],
  },
  {
    name: 'Third config',
    uid: (withUid ? 'config-2' : undefined),
    version: '1.0.16',
    description: '',
    datasets: [],
    initStrategy: 'auto',
    coordinationSpace: { },
    layout: [
      {
        component: 'description',
        uid: '1',
        props: {
          description: 'Third config, first view',
        },
        x: 0,
        y: 0,
        w: 3,
        h: 3,
      },
      {
        component: 'description',
        uid: '2',
        props: {
          description: 'Third config, second view',
        },
        x: 3,
        y: 0,
        w: 3,
        h: 3,
      },
    ],
  },
];

function App() {
  const [configIndex, setConfigIndex] = useState(0);

  const handleSelectChange = (event) => {
    setConfigIndex(parseInt(event.target.value));
  };

  // Note that width and height are tested using Cypress.
  const width = 800;
  const height = 800;

  return e('div', { style: { width: `${width}px` }}, [
    e('select', { onChange: handleSelectChange },
      configs.map((config, i) => e('option', { value: i }, `Config ${i}`))
    ),
    e(Vitessce,
      { config: configs[configIndex], height: height, theme: 'light' },
      null
    ),
  ]);
}

// es-react is using React v16.
const domContainer = document.querySelector('#root');
ReactDOM.render(e(App), domContainer);