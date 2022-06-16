import React, { useMemo, useEffect } from 'react';
import TitleInfo from '../TitleInfo';
import { useUrls, useReady, useGridItemSize } from '../hooks';
/* import { useCoordination, useLoaders } from '../../app/state/hooks';
import { COMPONENT_COORDINATION_TYPES } from '../../app/state/coordination';
import { mergeCellSets } from '../utils';
import { useCellSetsData } from '../data-hooks';
import { treeToSetSizesBySetNames } from './cell-set-utils'; */
import BarPlot from './BarPlot';
import clamp from 'lodash/clamp';
import { VegaPlot, VEGA_THEMES } from '../vega';
import { csvParse } from 'd3-dsv';

const CELL_SET_SIZES_DATA_TYPES = ['cell-sets'];

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
export default function BarPlotEverything(props) {
  const {
    coordinationScopes,
    removeGridComponent,
    theme,
    title = 'Bar plot',
    marginRight = 90,
    marginBottom = 120,
  } = props;

  //const loaders = useLoaders();
  const [width, height, containerRef] = useGridItemSize();
  // Get "props" from the coordination space.
  /* const [{
    dataset,
    obsSetSelection: cellSetSelection,
    obsSetColor: cellSetColor,
    additionalObsSets: additionalCellSets,
  }, {
    setObsSetSelection: setCellSetSelection,
    setObsSetColor: setCellSetColor,
  }] = useCoordination(COMPONENT_COORDINATION_TYPES.cellSetSizes, coordinationScopes);

  
  const [urls, addUrl, resetUrls] = useUrls();
  const [
    isReady,
    setItemIsReady,
    setItemIsNotReady, // eslint-disable-line no-unused-vars
    resetReadyItems,
  ] = useReady(
    CELL_SET_SIZES_DATA_TYPES,
  );

  // Reset file URLs and loader progress when the dataset has changed.
  useEffect(() => {
    resetUrls();
    resetReadyItems();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaders, dataset]);

  // Get data from loaders using the data hooks.
  const [cellSets] = useCellSetsData(
    loaders, dataset, setItemIsReady, addUrl, true,
    { setObsSetSelection: setCellSetSelection, setObsSetColor: setCellSetColor },
    { obsSetSelection: cellSetSelection, obsSetColor: cellSetColor },
  );

  const mergedCellSets = useMemo(
    () => mergeCellSets(cellSets, additionalCellSets),
    [cellSets, additionalCellSets],
  );

  // From the cell sets hierarchy and the list of selected cell sets,
  // generate the array of set sizes data points for the bar plot.
  const data = useMemo(() => (mergedCellSets && cellSetSelection && cellSetColor
    ? treeToSetSizesBySetNames(mergedCellSets, cellSetSelection, cellSetColor, theme)
    : []
  ), [mergedCellSets, cellSetSelection, cellSetColor, theme]);
*/
  const spec = {"$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "description": "Punchcard Visualization like on Github. The day on y-axis uses a custom order from Monday to Sunday.  The sort property supports both full day names (e.g., 'Monday') and their three letter initials (e.g., 'mon') -- both of which are case insensitive.",
  "width": 500,
  "height": 290,
  "params": [{"name": "highlight", "select": {
    "type": "point",
    "on": "mouseover",
    "nearest": true
  }}],
  "transform": [{
    "window": [{
      "op": "sum",
      "field": "Expression",
      "as": "TotalTime"
    }],

  "frame": [null, null]
  },
  {
    "calculate": "datum.Expression/datum.TotalTime * 100",
    "as": "Percent Expressed (%)"

  }],



  "mark": {"type": "circle", "strokeWidth": 2},
  "encoding": {
    "y": {
      "field": "Identity",
      "type": "ordinal",
    },
    "x": {
      "field": "Features",
      "type": "ordinal",
    },
    "color": {
      "field": "Expression",
      "type": "quantitative",
      "aggregate": "sum",
    },
    "size": {
      "field": "Percent Expressed (%)",
      "type": "nominal",
      //"aggregate": "sum"
    },
    "stroke": {
      "condition": {
        "param": "highlight",
        "empty": false,
        "value": "black"
      },
    "value": null
    },
    "opacity": {
      "condition": {"param": "highlight", "value": 1},
      "value": 0.5
    }

      }

}

  
  
 // ,
 //   width: clamp(width - marginRight, 10, Infinity),
//    height: clamp(height - marginBottom, 10, Infinity),
//    config: VEGA_THEMES[theme],
 // };

  const data = csvParse(`Identity,Features,Expression,Percent Expressed
ast, act1,2
ast, act2,3
ast, act3,1
ast, act4,1
ast, act5,3
ast, act6,1
ast, act5,3
ast, act4,1
ast, act3,1
dend, act2,2
dend, act1,1
dend, act2,3
t-cell, act3,3`);

  return (
    <TitleInfo
      title={title}
      removeGridComponent={removeGridComponent}
      //urls={urls}
      theme={theme}
      isReady={true}
    >
      <div ref={containerRef} className="vega-container">
        {/*<BarPlot
          data={[
            {"a": "A", "b": 28}, {"a": "B", "b": 55}, {"a": "C", "b": 43},
            {"a": "D", "b": 91}, {"a": "E", "b": 81}, {"a": "F", "b": 53},
            {"a": "G", "b": 19}, {"a": "H", "b": 87}, {"a": "I", "b": 52}
          ]}
          theme={theme}
          width={width}
          height={height}
        />*/}
        <VegaPlot
          data={data}
          spec={spec}
        />
      </div>
      <select id = "myList" onchange = "favTutorial()" >  
      <option> ---Choose tutorial--- </option>  
      <option> w3schools </option>  
      <option> Javatpoint </option>  
      <option> tutorialspoint </option>  
      <option> geeksforgeeks </option>  
      </select>  
    </TitleInfo>
  );
}
