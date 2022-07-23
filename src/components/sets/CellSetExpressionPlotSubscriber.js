import React, { useReducer } from 'react';
import TitleInfo from '../TitleInfo';
import { useCoordination, useLoaders } from '../../app/state/hooks';
import { COMPONENT_COORDINATION_TYPES } from '../../app/state/coordination';
import { useUrls, useReady, useGridItemSize } from '../hooks';
import { useFeatureSelection, useObsSetsData, useObsFeatureMatrixIndices } from '../data-hooks';
import { useExpressionByCellSet } from './hooks';
import CellSetExpressionPlotOptions from './CellSetExpressionPlotOptions';
import CellSetExpressionPlot from './CellSetExpressionPlot';

/**
 * A subscriber component for `CellSetExpressionPlot`,
 * which listens for gene selection updates and
 * `GRID_RESIZE` events.
 * @param {object} props
 * @param {function} props.removeGridComponent The grid component removal function.
 * @param {object} props.coordinationScopes An object mapping coordination
 * types to coordination scopes.
 * @param {string} props.theme The name of the current Vitessce theme.
 */
export default function CellSetExpressionPlotSubscriber(props) {
  const {
    coordinationScopes,
    removeGridComponent,
    theme,
  } = props;

  const loaders = useLoaders();

  // Get "props" from the coordination space.
  const [{
    dataset,
    obsType,
    featureType,
    featureValueType,
    featureSelection: geneSelection,
    featureValueTransform: geneExpressionTransform,
    obsSetSelection: cellSetSelection,
    obsSetColor: cellSetColor,
    additionalObsSets: additionalCellSets,
  }, {
    setFeatureValueTransform: setGeneExpressionTransform,
  }] = useCoordination(COMPONENT_COORDINATION_TYPES.cellSetExpression, coordinationScopes);

  const [width, height, containerRef] = useGridItemSize();
  const [urls, addUrl] = useUrls(loaders, dataset);

  const [useGeneExpressionTransform, toggleGeneExpressionTransform] = useReducer((v) => {
    const newValue = !v;
    setGeneExpressionTransform(newValue ? 'log1p' : null);
    return newValue;
  }, geneExpressionTransform);

  // Get data from loaders using the data hooks.
  // eslint-disable-next-line no-unused-vars
  const [expressionData, loadedFeatureSelection, featureSelectionStatus] = useFeatureSelection(
    loaders, dataset, false, geneSelection,
    { obsType, featureType, featureValueType },
  );
  const [{ obsIndex }, matrixIndicesStatus] = useObsFeatureMatrixIndices(
    loaders, dataset, addUrl, false,
    { obsType, featureType, featureValueType },
  );
  const [{ obsSets: cellSets }, obsSetsStatus] = useObsSetsData(
    loaders, dataset, addUrl, true, {}, {},
    { obsType },
  );
  const isReady = useReady([
    featureSelectionStatus,
    matrixIndicesStatus,
    obsSetsStatus,
  ]);

  const [expressionArr, setArr, expressionMax] = useExpressionByCellSet(
    expressionData, obsIndex, cellSets, additionalCellSets,
    geneSelection, cellSetSelection, cellSetColor, useGeneExpressionTransform,
    theme,
  );

  const firstGeneSelected = geneSelection && geneSelection.length >= 1
    ? geneSelection[0]
    : null;
  return (
    <TitleInfo
      title={`Expression by Cell Set${(firstGeneSelected ? ` (${firstGeneSelected})` : '')}`}
      removeGridComponent={removeGridComponent}
      urls={urls}
      theme={theme}
      isReady={isReady}
      options={(
        <CellSetExpressionPlotOptions
          useGeneExpressionTransform={useGeneExpressionTransform}
          toggleGeneExpressionTransform={toggleGeneExpressionTransform}
        />
      )}
    >
      <div ref={containerRef} className="vega-container">
        {expressionArr ? (
          <CellSetExpressionPlot
            domainMax={expressionMax}
            colors={setArr}
            data={expressionArr}
            theme={theme}
            width={width}
            height={height}
            useGeneExpressionTransform={useGeneExpressionTransform}
          />
        ) : (
          <span>Select a gene.</span>
        )}
      </div>
    </TitleInfo>
  );
}
