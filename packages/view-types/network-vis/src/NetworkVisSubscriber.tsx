import React from 'react';
import NetworkVis from './NetworkVis';
// import { ViewType, COMPONENT_COORDINATION_TYPES, ViewHelpMapping } from '@vitessce/constants-internal';
import { TitleInfo as TitleInfoRaw } from '@vitessce/vit-s';
import { FC, ReactNode } from 'react';

// Create a local typed version
const TitleInfo = TitleInfoRaw as unknown as FC<{ children?: ReactNode } & Record<string, any>>;


export function NetworkVisSubscriber() {
    
  return (
    <TitleInfo
      title="Node Link Graph"
      closeButtonVisible={true}
      removeGridComponent={true}
      theme={true}
      isReady={true}
      helpText={true}
    >
      <NetworkVis />
    </TitleInfo>
  );
  
}