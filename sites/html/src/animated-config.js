/* eslint-disable */
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom'
import { Vitessce } from 'vitessce';

const e = React.createElement;

const params = new URLSearchParams(document.location.search);
const withSameObjectReference = params.get("withSameObjectReference") === 'true';

const config = {
  name: 'Animated config',
  version: '1.0.16',
  description: '',
  datasets: [],
  initStrategy: 'auto',
  coordinationSpace: { },
  layout: [
    {
      component: 'description',
      props: {
        description: 'Timestamp: 0',
      },
      x: 0,
      y: 0,
      w: 2,
      h: 1,
    },
  ],
};

// TODO: add test using plugin view type and file type which fakes a delay in loading some (also fake) data.
// would expect no loading indicators if the data is already loaded.

function App() {

  // Note that width and height are tested using Cypress.
  const width = 800;
  const height = 800;

  const [currentConfig, setCurrentConfig] = useState(config);
  const [validateConfig, setValidateConfig] = useState(true);

  function onConfigChange(nextConfig) {
    setCurrentConfig(nextConfig);
    // Stop validating because we know it passed the initial validation and now
    // we are just updating individual properties manually.
    setValidateConfig(false);
  }

  useEffect(() => {
    function makeStep(seconds) {
      
      return () => {
        setCurrentConfig(prevConfig => {
          // When `withSameObjectReference` is true, the test would be expected to fail.
          // (i.e., the views would not be expected to update because the <Vitessce/> prop
          // for `config` has the same object reference so it does not re-render).
          const nextConfig = withSameObjectReference ? prevConfig : { ...prevConfig };
          
          nextConfig.uid = `config-${seconds}`;
          nextConfig.layout[0].props.description = `Timestamp: ${seconds}`;
    
          for(let i = 2; i <= seconds; i++) {
            nextConfig.layout.push({
              component: 'description',
              props: {
                description: `View ${i}`,
              },
              uid: `view-${i}`,
              x: (i-1)*2,
              y: 0,
              w: 2,
              h: 1
            });
          }
          return nextConfig;
        });
      };
    }

    setTimeout(makeStep(1), 1000);
    setTimeout(makeStep(2), 2000);
    setTimeout(makeStep(3), 3000);
    setTimeout(makeStep(4), 4000);
    setTimeout(makeStep(5), 5000);
  }, []);

  return e('div', { style: { width: `${width}px` }}, 
    e(Vitessce,
      { config: currentConfig, onConfigChange, validateConfig, height, theme: 'light' },
      null
    ),
  );
}

// es-react is using React v16.
const domContainer = document.querySelector('#root');
ReactDOM.render(e(App), domContainer);