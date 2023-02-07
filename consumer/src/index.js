/* eslint-disable */
import React from 'react';
import ReactDOM from 'react-dom';
import { VitS } from '@vitessce/vit-s';
import { register as registerDescription } from '@vitessce/description';

const e = React.createElement;

registerDescription();

const eng2019 = {
  name: 'Eng et al., Nature 2019',
  version: '1.0.15',
  description: '',
  datasets: [],
  initStrategy: 'auto',
  coordinationSpace: { },
  layout: [
    {
      component: 'description',
      props: {
        description: 'Transcriptome-scale super-resolved imaging in tissues by RNA seqFISH'
      },
      x: 9,
      y: 0,
      w: 3,
      h: 2,
    },
  ],
};

class App extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return e(
      VitS,
      { config: eng2019, height: 500, theme: 'light' },
      null
    );
  }
}

const domContainer = document.querySelector('#root');
ReactDOM.render(e(App), domContainer);
