/* eslint-disable */
import React, { useState, useRef } from 'react';
import cloneDeep from 'lodash/cloneDeep';

import VitessceSidebar from './VitessceSidebar';
import Vitessce from '../app/Vitessce';
import { useStyles } from './styles';

import { COMPONENT_NAMES } from '../app/names';

function defaultGenerateShareUrl(configToShare) {
  return `http://localhost:3000/?url=data:,${encodeURIComponent(JSON.stringify(configToShare))}`;
}

function copyToClipBoard(url) {
  const dummy = document.createElement('input');
  document.body.appendChild(dummy);
  dummy.setAttribute('value', url);
  dummy.select();
  document.execCommand('copy');
  document.body.removeChild(dummy);
}

export default function VitessceWithSidebarConsumer(props) {
  const {
    config: configProp,
    theme: themeProp,
    
    enableLogo = true,
    enableUndo = true,
    enableRedo = true,
    enableAddComponent = true,
    enableShareViaLink = true,
    enableThemeToggle = true,
    generateShareUrl = defaultGenerateShareUrl,
  } = props;
  
  const classes = useStyles();
  const [prevConfig, setPrevConfig] = useState(configProp);
  const configRef = useRef();
  const [theme, setTheme] = useState(themeProp);
  
  return (
    <div className={classes.appContainer}>
      <VitessceSidebar
        enableLogo={enableLogo}
        enableUndo={enableUndo}
        enableRedo={enableRedo}
        enableAddComponent={enableAddComponent}
        enableShareViaLink={enableShareViaLink}
        enableThemeToggle={enableThemeToggle}
        
        componentsToAdd={COMPONENT_NAMES}
        
        onAddComponent={(c) => {
          const nextConfig = cloneDeep(configRef.current);
          nextConfig.layout.push(c);
          setPrevConfig(nextConfig);
        }}
        onToggleTheme={() => {
          setTheme((theme === "light" ? "dark" : "light"));
        }}
        onShareViaLink={() => {
          copyToClipBoard(generateShareUrl(configRef.current));
        }}
      />
      <div className={classes.mainContainer}>
        <Vitessce
          config={prevConfig}
          onConfigChange={(newConfig) => {
            configRef.current = newConfig;
          }}
          theme={theme}
        />
      </div>
    </div>
  );
}
