import React, { useMemo, useState } from 'react';
import {
  TitleInfo,
  useCoordination, useLoaders,
  useUrls, useReady, useGridItemSize,
  useObsSetsData,
} from '@vitessce/vit-s';
import { isEqual } from 'lodash-es';
import { ViewType, COMPONENT_COORDINATION_TYPES, ViewHelpMapping } from '@vitessce/constants-internal';
import {
  mergeObsSets, treeToSetSizesBySetNames, filterPathsByExpansionAndSelection, findChangedHierarchy,
} from '@vitessce/sets-utils';
import { capitalize } from '@vitessce/utils';
import CellSetSizesPlot from './CellSetSizesPlot.js';
import { useStyles } from './styles.js';

/**
 * A subscriber component for `CellSetSizePlot`,
 * which listens for cell sets data updates and
 * `GRID_RESIZE` events.
 * @param {object} props
 * @param {function} props.removeGridComponent The grid component removal function.
 * @param {function} props.onReady The function to call when the subscriptions
 * have been made.
 * @param {string} props.theme The name of the current Vitessce theme.
 * @param {string} props.title The component title.
 */
export function CellSetSizesPlotSubscriber(props) {
  const {
    coordinationScopes,
    closeButtonVisible,
    downloadButtonVisible,
    removeGridComponent,
    theme,
    title: titleOverride,
    helpText = ViewHelpMapping.OBS_SET_SIZES,
  } = props;

  const { classes } = useStyles();

  const loaders = useLoaders();

  // Get "props" from the coordination space.
  const [{
    dataset,
    obsType,
    obsSetSelection: cellSetSelection,
    obsSetColor: cellSetColor,
    additionalObsSets: additionalCellSets,
    obsSetExpansion: cellSetExpansion,
  }, {
    setObsSetSelection: setCellSetSelection,
    setObsSetColor: setCellSetColor,
  }] = useCoordination(COMPONENT_COORDINATION_TYPES[ViewType.OBS_SET_SIZES], coordinationScopes);

  const title = titleOverride || `${capitalize(obsType)} Set Sizes`;

  const [width, height, containerRef] = useGridItemSize();

  // the name of the hierarchy that was clicked on last
  const [currentHierarchy, setCurrentHierarchy] = useState([]);
  // the previous cell set that was selected
  const [prevCellSetSelection, setPrevCellSetSelection] = useState([]);

  // Get data from loaders using the data hooks.
  const [{ obsSets: cellSets }, obsSetsStatus, obsSetsUrls] = useObsSetsData(
    loaders, dataset, true,
    { setObsSetSelection: setCellSetSelection, setObsSetColor: setCellSetColor },
    { obsSetSelection: cellSetSelection, obsSetColor: cellSetColor },
    { obsType },
  );
  const isReady = useReady([obsSetsStatus]);
  const urls = useUrls([obsSetsUrls]);

  const mergedCellSets = useMemo(
    () => mergeObsSets(cellSets, additionalCellSets),
    [cellSets, additionalCellSets],
  );

  const data = useMemo(() => {
    if (cellSetSelection && cellSetColor && mergedCellSets && cellSets) {
      let newHierarchy = currentHierarchy;

      if (cellSetSelection) {
        const changedHierarchy = findChangedHierarchy(prevCellSetSelection, cellSetSelection);
        setPrevCellSetSelection(cellSetSelection);

        if (changedHierarchy) {
          setCurrentHierarchy(changedHierarchy);
          newHierarchy = changedHierarchy;
        }
      }

      const cellSetPaths = filterPathsByExpansionAndSelection(
        mergedCellSets,
        newHierarchy,
        cellSetExpansion,
        cellSetSelection,
      );

      if (mergedCellSets && cellSets && cellSetSelection && cellSetColor) {
        return treeToSetSizesBySetNames(
          mergedCellSets,
          cellSetPaths,
          cellSetSelection,
          cellSetColor,
          theme,
        );
      }
    }
    return [];
  }, [
    mergedCellSets,
    cellSetSelection,
    cellSetExpansion,
    cellSetColor,
    theme,
  ]);

  const onBarSelect = (setNamePath, wasGrayedOut, selectOnlyEnabled = false) => {
    if (selectOnlyEnabled) {
      setCellSetSelection([setNamePath]);
      return;
    }
    if (!wasGrayedOut) {
      setCellSetSelection(cellSetSelection.filter(d => !isEqual(d, setNamePath)));
    } else if (wasGrayedOut) {
      setCellSetSelection([...cellSetSelection, setNamePath]);
    }
  };

  return (
    <TitleInfo
      title={title}
      closeButtonVisible={closeButtonVisible}
      downloadButtonVisible={downloadButtonVisible}
      removeGridComponent={removeGridComponent}
      urls={urls}
      theme={theme}
      isReady={isReady}
      helpText={helpText}
    >
      <div ref={containerRef} className={classes.vegaContainer}>
        <CellSetSizesPlot
          data={data}
          onBarSelect={onBarSelect}
          theme={theme}
          width={width}
          height={height}
          obsType={obsType}
        />
      </div>
    </TitleInfo>
  );
}
