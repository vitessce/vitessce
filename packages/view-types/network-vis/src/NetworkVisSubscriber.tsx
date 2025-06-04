import React, { useCallback, useMemo } from 'react';
import NetworkVis from './NetworkVis';
import { ViewType, COMPONENT_COORDINATION_TYPES, ViewHelpMapping } from '@vitessce/constants-internal';
import { TitleInfo as TitleInfoRaw, useCoordination, useLoaders, useObsSetsData, useObsEmbeddingData } from '@vitessce/vit-s';
import { FC, ReactNode } from 'react';
import { getCellColors, mergeObsSets, setObsSelection } from '@vitessce/sets-utils';

// Create a local typed version
const TitleInfo = TitleInfoRaw as unknown as FC<{ children?: ReactNode } & Record<string, any>>;

interface GetCellColorsParams {
  cellSetSelection: string[][] | null;
  cellSetColor: { path: string[]; color: [number, number, number] }[] | null;
  cellSets: any; // TODO: more strict typing here
  obsIndex: string[] | null;
  theme: 'light' | 'dark' | null;
}

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
    dataset,
    obsType,
    obsSetSelection: cellSetSelection,
    obsSetColor: cellSetColor,
    obsColorEncoding,
    obsHighlight,
    additionalObsSets: additionalCellSets,
  }, {
    setObsSetSelection: setCellSetSelection,
    setObsSetColor: setCellSetColor,
    setObsColorEncoding,
    setObsHighlight,
    setAdditionalObsSets: setAdditionalCellSets,
  }] = useCoordination(COMPONENT_COORDINATION_TYPES[ViewType.NETWORK_VIS], coordinationScopes);

  const loaders = useLoaders();

  // Get cell sets data
  const [{ obsSets: cellSets }] = useObsSetsData(
    loaders, dataset, false,
    { setObsSetSelection: setCellSetSelection, setObsSetColor: setCellSetColor },
    { cellSetSelection, obsSetColor: cellSetColor },
    { obsType },
  );

  // Get observation index data
  const [{ obsIndex }] = useObsEmbeddingData(
    loaders, dataset, true, {}, {},
    { obsType },
  );

  // Merge cell sets
  const mergedCellSets = useMemo(() => mergeObsSets(
    cellSets, additionalCellSets,
  ), [cellSets, additionalCellSets]);

  // Calculate cell colors
  const cellColors = useMemo(() => getCellColors({
    cellSetSelection,
    cellSetColor,
    obsIndex,
    theme,
    cellSets: mergedCellSets,
  } as GetCellColorsParams), [mergedCellSets, theme, cellSetColor, cellSetSelection, obsIndex]);

  console.log("NEUROGLANCER cellColors", cellColors);

  // Handle node selection
  const onNodeSelect = useCallback((nodeIds: string[]) => {
    console.log('onNodeSelect', nodeIds);
    if (nodeIds && nodeIds.length > 0) {
      // Create a new selection in the obsSets manager for this lasso selection
      // Only create a new selection if we have nodes selected
      const timestamp = new Date().getTime();
      
      setObsSelection(
        nodeIds,
        additionalCellSets,
        cellSetColor,
        setCellSetSelection,
        setAdditionalCellSets,
        setCellSetColor,
        setObsColorEncoding,
        `Selection ${timestamp}`, // Use timestamp to ensure unique names
      );
      
      // Also update the highlight to the first node of this selection
      if (nodeIds.length > 0) {
        setObsHighlight(nodeIds[0]);
      }
    }
  }, [
    additionalCellSets,
    cellSetColor,
    cellSetSelection,
    setAdditionalCellSets,
    setObsColorEncoding,
    setCellSetColor,
    setCellSetSelection,
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
        obsSetSelection={cellSetSelection}
        obsSetColor={cellSetColor}
        obsHighlight={obsHighlight}
        additionalCellSets={additionalCellSets}
        setAdditionalCellSets={setAdditionalCellSets}
        cellColors={cellColors}
      />
    </TitleInfo>
  );
}