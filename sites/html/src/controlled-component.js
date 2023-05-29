/* eslint-disable */
import React, { useState } from 'react';
import ReactDOM from 'react-dom'
import { Vitessce } from 'vitessce';

const e = React.createElement;

const configs = [
  {
    name: 'First config',
    uid: 'config-0',
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
        w: 6,
        h: 6,
      },
    ],
  },
  {
    name: 'Second config',
    uid: 'config-1',
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
    uid: 'config-2',
    version: '1.0.16',
    description: '',
    datasets: [],
    initStrategy: 'auto',
    coordinationSpace: { },
    layout: [
      {
        component: 'description',
        props: {
          description: 'Third config, first view',
        },
        x: 0,
        y: 0,
        w: 6,
        h: 6,
      },
      {
        component: 'description',
        props: {
          description: 'Third config, second view',
        },
        x: 6,
        y: 0,
        w: 6,
        h: 6,
      },
    ],
  },
];

function App() {
  const [configIndex, setConfigIndex] = useState(0);

  const handleSelectChange = (event) => {
    setConfigIndex(parseInt(event.target.value));
  };

  console.log(configIndex);

  return e('div', {}, [
    e('select', { onChange: handleSelectChange },
      configs.map((config, i) => e('option', { value: i }, `Config ${i}`))
    ),
    e(Vitessce,
      { config: configs[configIndex], height: 500, theme: 'light' },
      null
    ),
  ]);
}

// es-react is using React v16.
const domContainer = document.querySelector('#root');
ReactDOM.render(e(App), domContainer);