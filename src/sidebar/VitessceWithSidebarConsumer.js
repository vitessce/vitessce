/* eslint-disable */
import React, { useState, useRef } from 'react';
import cloneDeep from 'lodash/cloneDeep';

import VitessceSidebar from './VitessceSidebar';
import Vitessce from '../app/Vitessce';
import { useStyles } from './styles';

import { COMPONENT_NAMES } from '../app/names';

import EditorOverlay from './overlays/EditorOverlay';

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
    onConfigChange,
    validateOnConfigChange,
    
    enableLogo = true,
    enableUndo = true,
    enableRedo = true,
    enableAddComponent = true,
    enableShareViaLink = true,
    enableThemeToggle = true,
    enableEditViewConfig = true,
    enableClearViewConfig = true,
    generateShareUrl = defaultGenerateShareUrl,
  } = props;
  
  const classes = useStyles();
  const [prevConfig, setPrevConfig] = useState(configProp);
  const configRef = useRef();
  const [theme, setTheme] = useState(themeProp);
  
  const [tab, setTab] = useState(1);
  
  return (
    <div className={classes.appContainer}>
      <VitessceSidebar
        enableLogo={enableLogo}
        enableUndo={enableUndo}
        enableRedo={enableRedo}
        enableAddComponent={enableAddComponent}
        enableShareViaLink={enableShareViaLink}
        enableThemeToggle={enableThemeToggle}
        enableEditViewConfig={enableEditViewConfig}
        enableClearViewConfig={enableClearViewConfig}
        
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
        onEditViewConfig={() => {
          console.log("Editing view config");
        }}
        onClearViewConfig={() => {
          console.log("Clearing view config");
        }}
        
        tab={tab}
        setTab={setTab}
      />
      <div className={classes.mainContainer}>
        <Vitessce
          config={prevConfig}
          onConfigChange={(newConfig) => {
            configRef.current = newConfig;
            if(onConfigChange) {
              onConfigChange(newConfig);
            }
          }}
          validateOnConfigChange={validateOnConfigChange}
          theme={theme}
        />
        {tab == 1 ? (
          <EditorOverlay
          
          />
        ) : null}
      </div>
    </div>
  );
}
