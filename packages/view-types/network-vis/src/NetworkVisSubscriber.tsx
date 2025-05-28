import React, { useCallback } from 'react';
import NetworkVis from './NetworkVis';
import { ViewType, COMPONENT_COORDINATION_TYPES, ViewHelpMapping } from '@vitessce/constants-internal';
import { TitleInfo as TitleInfoRaw, useCoordination } from '@vitessce/vit-s';
import { FC, ReactNode } from 'react';
import { setObsSelection } from '@vitessce/sets-utils';

// Create a local typed version
const TitleInfo = TitleInfoRaw as unknown as FC<{ children?: ReactNode } & Record<string, any>>;

export function NetworkVisSubscriber(props:any) {
  const {
    coordinationScopes,
    closeButtonVisible,
    downloadButtonVisible,
    removeGridComponent,
    theme,
    title = 'Node Link Graph',
    helpText = ViewHelpMapping.NETWORK_VIS,
  } = props;

  const [{
    obsSetSelection,
    obsSetColor,
    obsColorEncoding,
    obsHighlight,
    additionalObsSets,
  }, {
    setObsSetSelection,
    setObsSetColor,
    setObsColorEncoding,
    setObsHighlight,
    setAdditionalObsSets,
  }] = useCoordination(COMPONENT_COORDINATION_TYPES[ViewType.NETWORK_VIS], coordinationScopes);

  // Handle node selection
  const onNodeSelect = useCallback((nodeIds: string[]) => {
    console.log('onNodeSelect', nodeIds);
    if (nodeIds && nodeIds.length > 0) {
      // Create a selection in the obsSets manager
      setObsSelection(
        nodeIds, // Already strings from NetworkVis
        additionalObsSets,
        obsSetColor,
        setObsSetSelection,
        setAdditionalObsSets,
        setObsSetColor,
        setObsColorEncoding,
        'Selection ',
        `: based on selected nodes ${nodeIds.join(', ')}`,
      );
      
      // Also update the highlight
      if (nodeIds.length === 1) {
        setObsHighlight(nodeIds[0]);
      } else {
        setObsHighlight(null);
      }
    }
  }, [
    additionalObsSets,
    obsSetColor,
    setAdditionalObsSets,
    setObsColorEncoding,
    setObsSetColor,
    setObsSetSelection,
    setObsHighlight
  ]);

  return (
    <TitleInfo
      title={title}
      helpText={helpText}
      theme={theme}
      closeButtonVisible={closeButtonVisible}
      downloadButtonVisible={downloadButtonVisible}
      removeGridComponent={removeGridComponent}
      isReady={true}
    >
      <NetworkVis 
        onNodeSelect={onNodeSelect}
        obsSetSelection={obsSetSelection}
        obsSetColor={obsSetColor}
        obsHighlight={obsHighlight}
        additionalCellSets={additionalObsSets}
        setAdditionalCellSets={setAdditionalObsSets}
      />
    </TitleInfo>
  );
}