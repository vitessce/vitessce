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
      // Create a new selection in the obsSets manager for this lasso selection
      // Only create a new selection if we have nodes selected
      const timestamp = new Date().getTime();
      
      // Log the current color assignments
      console.log('Current obsSetColor:', obsSetColor);
      console.log('Current obsColorEncoding:', obsColorEncoding);
      
      // Log the color that will be assigned to this selection
      const newSelectionIndex = obsSetSelection?.length || 0;
      console.log('New selection index:', newSelectionIndex);
      
      // Get the color from the PALETTE array
      const PALETTE = [
        [68, 119, 170],  // #4477AA
        [136, 204, 238],
        [68, 170, 153],
        [17, 119, 51],
        [153, 153, 51],
        [221, 204, 119],
        [204, 102, 119],
        [136, 34, 85],
        [170, 68, 153],
      ];
      const colorIndex = newSelectionIndex % PALETTE.length;
      console.log('Color that will be assigned:', PALETTE[colorIndex]);
      
      setObsSelection(
        nodeIds,
        additionalObsSets,
        obsSetColor,
        setObsSetSelection,
        setAdditionalObsSets,
        setObsSetColor,
        setObsColorEncoding,
        `Selection ${timestamp}`, // Use timestamp to ensure unique names
      );
      
      // Also update the highlight to the first node of this selection
      if (nodeIds.length > 0) {
        setObsHighlight(nodeIds[0]);
      }
    }
  }, [
    additionalObsSets,
    obsSetColor,
    obsSetSelection,
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