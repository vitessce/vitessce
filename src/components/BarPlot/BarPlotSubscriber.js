import React, { useMemo, useEffect , useState } from 'react';
import TitleInfo from '../TitleInfo';
import { useUrls, useReady, useGridItemSize } from '../hooks';
import { useCoordination, useLoaders } from '../../app/state/hooks';
import { COMPONENT_COORDINATION_TYPES } from '../../app/state/coordination';
import { mergeCellSets } from '../utils';
import { useCellSetsData, useExpressionMatrixData } from '../data-hooks';
import { useExpressionAttrs } from '../data-hooks';
//import { treeToSetSizesBySetNames } from './cell-set-utils'; 
import BarPlot from './BarPlot';
import clamp from 'lodash/clamp';
import { VegaPlot, VEGA_THEMES } from '../vega';
import { csvParse } from 'd3-dsv';
import { sum } from 'lodash';
import { treeFindNodeByNamePath, nodeToSet } from '../sets/cell-set-utils';






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
export default function BarPlotEverything(props) {
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

  const [expressionMatrix] = useExpressionMatrixData(
    loaders, dataset, setItemIsReady, addUrl, true,
  );

  

  const [attrs] = useExpressionAttrs(
    loaders, dataset, setItemIsReady, addUrl, true,
  );
  const geneList = attrs ? attrs.cols : [];
  const numGenes = geneList.length;


  console.log('dotPlot', attrs, expressionMatrix, mergedCellSets)
  // From the cell sets hierarchy and the list of selected cell sets,
  // generate the array of set sizes data points for the bar plot.
  const data = useMemo(() => (mergedCellSets && cellSetSelection && cellSetColor
    ? treeToSetSizesBySetNames(mergedCellSets, cellSetSelection, cellSetColor, theme)
    : []
  ), [mergedCellSets, cellSetSelection, cellSetColor, theme]);


const [name, setName] = useState('mean');

console.log('yup', mergeCellSets(
  cellSets, additionalCellSets,
), [cellSets, additionalCellSets]);

const aa = [["Cell Type Annotations", "Astrocyte", 'Astrocyte Gfap'], 
["Cell Type Annotations", "Astrocyte", 'Astrocyte Mfge8'],
["Cell Type Annotations", 'Brain immune', 'Microglia'],
["Cell Type Annotations",'Brain immune', 'Perivascular Macrophages'],
["Cell Type Annotations",'Excitatory neurons','Hippocampus'],
["Cell Type Annotations", 'Excitatory neurons', 'Pyramidal Cpne5'],
["Cell Type Annotations", 'Excitatory neurons', 'Pyramidal Kcnip2'],
["Cell Type Annotations", 'Excitatory neurons', 'Pyramidal L2-3'],
["Cell Type Annotations",'Excitatory neurons', 'Pyramidal L2-3 L5'],
["Cell Type Annotations", 'Excitatory neurons', 'Pyramidal L3-4'],
["Cell Type Annotations", 'Excitatory neurons', 'Pyramidal L5'],
["Cell Type Annotations", 'Excitatory neurons', 'Pyramidal L6'],
["Cell Type Annotations", 'Excitatory neurons', 'pyramidal L4'],
["Cell Type Annotations", 'Inhibitory neurons', 'Inhibitory CP'],
["Cell Type Annotations", 'Inhibitory neurons', 'Inhibitory Cnr1'],
["Cell Type Annotations", 'Inhibitory neurons', 'Inhibitory Crhbp'],
["Cell Type Annotations", 'Inhibitory neurons', 'Inhibitory IC'],
["Cell Type Annotations", 'Inhibitory neurons', 'Inhibitory Kcnip2'],
["Cell Type Annotations", 'Inhibitory neurons', 'Inhibitory Pthlh'],
["Cell Type Annotations",'Inhibitory neurons','Inhibitory Vip'],
["Cell Type Annotations",'Oligodendrocytes','Oligodendrocyte COP'],
["Cell Type Annotations",'Oligodendrocytes','Oligodendrocyte MF'],
["Cell Type Annotations",'Oligodendrocytes','Oligodendrocyte Mature'],
["Cell Type Annotations", 'Oligodendrocytes', 'Oligodendrocyte NF'],
["Cell Type Annotations",'Oligodendrocytes', 'Oligodendrocyte Precursor cells'],
["Cell Type Annotations", 'Vasculature', 'Endothelial'], 
["Cell Type Annotations", 'Vasculature', 'Endothelial 1'],
["Cell Type Annotations", 'Vasculature', 'Pericytes'],
["Cell Type Annotations", 'Vasculature', 'Vascular Smooth Muscle'],
["Cell Type Annotations", 'Ventricle', 'C. Plexus'],
["Cell Type Annotations", 'Ventricle', 'Ependymal']];

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

var x = cellSetsToCellTypeMapping(mergedCellSets, cellSetSelection); //change to cellSetSelection

console.log('p',cellSetSelection)

console.log('p', mergedCellSets, aa);

const data1 = [];
 


if (attrs != undefined){

  function flatten(arr) {
    return arr.reduce(function (flat, toFlatten) {
      return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
    }, []);
  }
 //check that expressionMatrix is undefined later and check that identity, features, expression are matched correctly


  var counter = -1;

for(let i=0; i<100; i++){
  for(let a=0;a<attrs.cols.length;a++){
    counter++;

    data1.push(Object.fromEntries([["Identity", x.get(attrs.rows[i])], ["Features",attrs.cols[a]], ["Expression",expressionMatrix.matrix[counter]]]))}
  }

}


  const spec = {"$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "description": "Punchcard Visualization like on Github. The day on y-axis uses a custom order from Monday to Sunday.  The sort property supports both full day names (e.g., 'Monday') and their three letter initials (e.g., 'mon') -- both of which are case insensitive.",
  "width": 380,
  "height": 180,
  "padding": 50,
  "params": [{"name": "highlight", "select": {
    "type": "point",
    "on": "mouseover",
    "nearest": true
  }}, 

{
  "name": "minYear",
  "value": 0,
  "bind": {
    "input": "range",
    "min": 0,
    "max": 100,
    "step": 1,
    "name": "Percent Expressed (%) Minimum: "
  }
},
{
  "name": "maxYear",
  "value": 100,
  "bind": {
    "input": "range",
    "min": 0,
    "max": 100,
    "step": 1,
    "name": "Percent Expressed (%) Maximum: "
  }
}]

,


  "transform": [{
    "window": [{
      "op": "sum",
      "field": "Expression",
      "as": "TotalTime"
    }],
  "frame": [null, null]},
  {"calculate": "datum.Expression/datum.TotalTime * 100",
    "as": "PercentExpressed"
  },

    {"filter": "datum.PercentExpressed>=minYear"},
    {"filter": "datum.PercentExpressed<=maxYear"}
],

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
      "aggregate": name,
      //"scale": {"range": ["white", "green"]}
      
      
    
    },

    "tooltip": [
      {"field": "Expression", "aggregate": name, "type": "nominal", "title": `${name.charAt(0).toUpperCase() + name.slice(1)} of Expression`},
      {"field": "PercentExpressed", "type": "nominal", "title": "Percent Expressed (%)"}],



    "size": {
      "field": "PercentExpressed",
      "type": "quantitative",
      
      
      "title": "Percent Expressed (%)"
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
      "value": 0.55
    }

      }

    }

  
  
 // ,
 //   width: clamp(width - marginRight, 10, Infinity),
//    height: clamp(height - marginBottom, 10, Infinity),
//    config: VEGA_THEMES[theme],
 // };


 

 /* const data = csvParse(`Identity,Features,Expression
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
t-cell, act3,3`);*/

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
          data={data1}
          spec={spec}
        />
      </div>
      <select
        value={name}
        onChange={e => setName(e.target.value)}
      > 
      <option> mean </option>  
      <option> median </option>  
      <option> sum </option>  
      <option> stdev </option> 
      
      

      </select>  
     
    </TitleInfo>
  );
}
