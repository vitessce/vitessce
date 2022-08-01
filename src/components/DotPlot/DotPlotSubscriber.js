import React, { useMemo, useEffect , useState } from 'react';
import TitleInfo from '../TitleInfo';
import { useUrls, useReady, useGridItemSize } from '../hooks';
import { useCoordination, useLoaders } from '../../app/state/hooks';
import { COMPONENT_COORDINATION_TYPES } from '../../app/state/coordination';
import { mergeCellSets } from '../utils';
import { useCellSetsData, useExpressionMatrixData } from '../data-hooks';
import { useExpressionAttrs } from '../data-hooks';
//import { treeToSetSizesBySetNames } from './cell-set-utils'; 
import clamp from 'lodash/clamp';
import { VegaPlot, VEGA_THEMES } from '../vega';
import { csvParse } from 'd3-dsv';
import { sum } from 'lodash';
import { treeFindNodeByNamePath, nodeToSet } from '../sets/cell-set-utils';
import { Component } from '../../app/constants';



const CELL_SET_SIZES_DATA_TYPES = ['cell-sets', 'expression-matrix'];

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
export default function DotPlotEverything(props) {
  const {
    coordinationScopes,
    removeGridComponent,
    theme,
    title = 'Dot Plot',
    marginRight = 90,
    marginBottom = 120,
  } = props;


  const loaders = useLoaders();

  const [width, height, containerRef] = useGridItemSize();
  // Get "props" from the coordination space.
  const [{
    dataset,
    obsSetSelection: cellSetSelection,
    obsSetColor: cellSetColor,
    featureSelection: geneSelection,
    featureHighlight: geneHighlight,
    featureFilter: geneFilter,
    additionalObsSets: additionalCellSets,
  }, {
    setObsSetSelection: setCellSetSelection,
    setObsSetColor: setCellSetColor,
    setFeatureHighlight: setGeneHighlight,
    setFeatureSelection: setGeneSelection,
  }] = useCoordination(COMPONENT_COORDINATION_TYPES[Component.DOTPLOT], coordinationScopes);

  
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

  const [expressionMatrix] = useExpressionMatrixData(
    loaders, dataset, setItemIsReady, addUrl, true,
  );

  const [attrs] = useExpressionAttrs(
    loaders, dataset, setItemIsReady, addUrl, true,
  );
  const geneList = attrs ? attrs.cols : [];
  const numGenes = geneList.length;


  console.log('dotPlot', attrs, expressionMatrix, mergedCellSets);


  // From the cell sets hierarchy and the list of selected cell sets,
  // generate the array of set sizes data points for the bar plot.
  /*const data = useMemo(() => (mergedCellSets && cellSetSelection && cellSetColor
    ? treeToSetSizesBySetNames(mergedCellSets, cellSetSelection, cellSetColor, theme)
    : []
  ), [mergedCellSets, cellSetSelection, cellSetColor, theme]);*/


const [name, setName] = useState('mean');

//This code can help to map between cell IDs and cell types
/**
 * 
 * @param {object} currTree Cell sets hierarchy object returned by mergeCellSets.
 * @param {array} selectedNamePaths Array of selected cell sets from cellSetSelection coordination value.
 * @returns 
 */
function cellSetsToCellTypeMapping(currTree, selectedNamePaths) {
  // Store the result as an array of tuples like [
  //  ['cellA', 'cellType1'],
  //  ['cellB', 'cellType1'],
  //  ['cellC', 'cellType2'],
  // ]
  let cellTypes = [];
  if(currTree && selectedNamePaths) {
    // Iterate over the selected cell sets.
    // Each is stored as a "path" (from coarser to finer) like ['Neuron', 'Excitatory Neuron']
    // since the cell sets are represented as a hierarchy.
    selectedNamePaths.forEach((setNamePath) => {
      // Find the node in the cell set tree that contains the corresponding cell set.
      const node = treeFindNodeByNamePath(currTree, setNamePath);
      if (node) {
        // Get the cell set associated with this node.
        // This is an array of cell IDs and probability scores like 
        // [
        //   ['cellA', 0.25],
        //   ['cellB', 0.99],
        // ]
        const nodeSet = nodeToSet(node);
        // Get the name associated with this node, like 'Excitatory Neuron'
        // (the final element in the setNamePath array).
        const nodeName = node.name;
        // Concatenate the previously-added cell type tuples to the
        // cell type tuples for the current node.
        cellTypes = [
          ...cellTypes,
          // For each cell in the node's set, create a tuple like ['cellA', 'cellType1']
          ...nodeSet.map(([cellId, prob]) => [cellId, nodeName]),
        ];
      }
    });
  }
  // Convert the array to a JavaScript Map object.
  // Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
  return new Map(cellTypes);
}

var x = cellSetsToCellTypeMapping(mergedCellSets, cellSetSelection); 

//This code collects all of the data into objects (i.e. {Identity: 'Excitatory neurons', Features: 'Lamp5', Expression: 84})
const data1 = [];
if (attrs != undefined){
  function flatten(arr) {
    return arr.reduce(function (flat, toFlatten) {
      return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
    }, []);
  }


  var counter = -1;
for(let i=0; i<attrs.rows.length; i++){
  for(let a=0;a<attrs.cols.length;a++){
    counter++;

    if (geneSelection === null){
      data1.push(Object.fromEntries([["Identity", x.get(attrs.rows[i])], ["Features",attrs.cols[a]], ["Expression",expressionMatrix.matrix[counter]]]))
    }
    
    else if (geneSelection.includes(attrs.cols[a])){
        data1.push(Object.fromEntries([["Identity", x.get(attrs.rows[i])], ["Features",attrs.cols[a]], ["Expression",expressionMatrix.matrix[counter]]]))}
     }
}}

//This code allows you to deselect an Item on Cell Sets, and have it disappear. If not it shows up as undefined (i.e. if you deselect Astrocyte, it can disappear instead of changing label to Undefined).
let result = data1.map(a => a.Identity); //First finds all Identities
const filteredArray = [];
for (let i = 0; i < result.length; i++) { //Checks if any of them are undefined, and gets their index

  if (result[i] === undefined) filteredArray.push(i);}

for (var i = filteredArray.length -1; i >= 0; i--)  //Removes all undefined from data (i.e. it was not selected in cell sets), so it does not show up
   data1.splice(filteredArray[i],1);


  const spec = {"$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "description": "Punchcard Visualization like on Github. The day on y-axis uses a custom order from Monday to Sunday.  The sort property supports both full day names (e.g., 'Monday') and their three letter initials (e.g., 'mon') -- both of which are case insensitive.",
  "width": 430,
  "height": 410,
  "padding": 1,
  "params": [{"name": "highlight", "select": { //parameters for selecting dots with cursor
    "type": "point",
    "on": "mouseover",
    "nearest": false
  }}, 

{//This code adds a slider for the Minimum of Dot Plot
  "name": "minExpress",
  "value": 0,
  "bind": {
    "input": "range",
    "min": 0,
    "max": 100,
    "step": 0.01,
    "name": "Percent Expressed (%) Minimum: "
  }
},
{//This code adds a slider for Maximum Expressed of Dot Plot
  "name": "maxExpress",
  "value": 100,
  "bind": {
    "input": "range",
    "min": 0,
    "max": 100,
    "step": 0.01,
    "name": "Percent Expressed (%) Maximum: ",
    
  }
}]
,
//This code puts the data into percentages
  "transform": [{
    "window": [{
      "op": "sum",
      "field": "Expression",
      "as": "TotalExpression"
    }],
  "frame": [null, null]},
  {"calculate": "datum.Expression/datum.TotalExpression* 100",
    "as": "PercentExpressed",
    
  },


    {"filter": "datum.PercentExpressed>=minExpress"},
    {"filter": "datum.PercentExpressed<=maxExpress"}
],

  "mark": {"type": "circle", "strokeWidth": 2}, //the shape of the plots (i.e. you can plot data as dots or squares) and how big the cursor is around the data
  "encoding": {
    "y": {
      "field": "Identity",
      "type": "ordinal",
    },
    "x": {
      "field": "Features",
      "type": "ordinal",
    },
    "color": {//This is the gradient legend on the top right of the graph (i.e. it shows mean of expression as color gradient bar)
      "field": "Expression",
      "type": "quantitative",
      "aggregate": name,
    },

    "tooltip": [//This tooltip adds transparent portion when you scroll over dots (i.e. it shows the box with Mean of Expression and Percent Expressed)
      {"field": "Expression", "aggregate": name, "type": "nominal", "title": `${name.charAt(0).toUpperCase() + name.slice(1)} of Expression`},
      {"field": "PercentExpressed", "type": "nominal", "title": "Percent Expressed (%)"}],

    "size": {//This is the dot legend on the bottom right of the graph (i.e. it shows the sizes of each percent expressed) 
      "field": "PercentExpressed",
      "type": "quantitative",
      "title": "Percent Expressed (%)"
    },


    "stroke": {
      "condition": {//This allows you to highlight dots of plot, and the border color when you select dot (i.e. black)
        "param": "highlight",
        "empty": false,
        "value": "black"
      },
    "value": null
    },
    "opacity": {//This makes the other non-selected dots opaque, you can vary the opaque value to make it more or less
      "condition": {"param": "highlight", "value": 1},
      "value": 0.55
    }
   }
    }

function aggregate_function(p)
{console.log('Parameter Name', p.target.value)
aggregate_variable = p.target.value
this.setState({p})

}
  return (
    <TitleInfo
      title={title}
      removeGridComponent={removeGridComponent}
      //urls={urls}
      theme={theme}
      isReady={true}
    >
      
      <div ref={containerRef} className="vega-container">
        <VegaPlot
          data={data1}
          spec={spec}
          actions={false}
        />
        
      </div>
      <select
        value={name}
        onChange={e => setName(e.target.value)}
      > //These are the mathematical options for the dot plot
      <option> mean </option>  
      <option> median </option>  
      <option> sum </option>  
      <option> stdev </option> 
      </select>  
     
    </TitleInfo>
  );
}
