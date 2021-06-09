/* eslint-disable */
import React, { useState } from 'react';

import VitessceSidebar from './VitessceSidebar';
import Vitessce from '../app/Vitessce';
import { useStyles } from './styles';

export default function VitessceWithSidebarConsumer(props) {
  const {
    config,
    theme: themeProp,
    
    enableLogo = true,
    enableUndo = true,
    enableRedo = true,
    enableAddComponent = true,
    enableShareViaLink = true,
    enableThemeToggle = true,
  } = props;
  
  const classes = useStyles();
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
        
        onToggleTheme={() => {
          setTheme((theme === "light" ? "dark" : "light"));
        }}
      />
      <div className={classes.mainContainer}>
        <Vitessce
          config={config}
          theme={theme}
        />
      </div>
    </div>
  );
}
