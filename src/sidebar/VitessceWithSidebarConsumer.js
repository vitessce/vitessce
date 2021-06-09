/* eslint-disable */
import React, { useState, useRef } from 'react';
import cloneDeep from 'lodash/cloneDeep';

import VitessceSidebar from './VitessceSidebar';
import Vitessce from '../app/Vitessce';
import { useStyles } from './styles';

export default function VitessceWithSidebarConsumer(props) {
  const {
    config: configProp,
    theme: themeProp,
    
    componentsToAdd = [],
    
    enableLogo = true,
    enableUndo = true,
    enableRedo = true,
    enableAddComponent = true,
    enableShareViaLink = true,
    enableThemeToggle = true,
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
        
        componentsToAdd={componentsToAdd}
        
        onAddComponent={(c) => {
          const nextConfig = cloneDeep(configRef.current);
          nextConfig.layout.push(c);
          setPrevConfig(nextConfig);
        }}
        onToggleTheme={() => {
          setTheme((theme === "light" ? "dark" : "light"));
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
