import React, { useEffect, useMemo, useCallback, useState } from 'react';
import {
  TitleInfo,
  useDeckCanvasSize,
  useReady,
  useUrls,
  useMultiObsSpots,
  useMultiObsPoints,
  useSpotMultiObsSets,
  useMultiObsSegmentations,
  useMultiImages,
  usePointMultiObsLabels,
  useSpotMultiFeatureSelection,
  useSpotMultiObsFeatureMatrixIndices,
  useSegmentationMultiFeatureSelection,
  useSegmentationMultiObsFeatureMatrixIndices,
  useSegmentationMultiObsLocations,
  useSegmentationMultiObsSets,
  useInitialCoordination,
  useCoordination,
  useLoaders,
  useMergeCoordination,
  useSetComponentHover,
  useSetComponentViewInfo,
  useComplexCoordination,
  useMultiCoordinationScopesNonNull,
  useMultiCoordinationScopesSecondaryNonNull,
  useComplexCoordinationSecondary,
  useCoordinationScopes,
  useCoordinationScopesBy,
  useSpotMultiFeatureLabels,
  useGridItemSize,
} from '@vitessce/vit-s';
import { ViewType, COMPONENT_COORDINATION_TYPES, ViewHelpMapping, CoordinationType } from '@vitessce/constants-internal';
import { useQuery } from '@tanstack/react-query';
import Flatbush from 'flatbush';
import { FPGrowth, Itemset } from 'node-fpgrowth';
import { extent } from 'd3-array';
import { InternMap } from 'internmap';


export function SpatialQueryManagerSubscriber(props) {
  const {
    uuid,
    coordinationScopes: coordinationScopesRaw,
    coordinationScopesBy: coordinationScopesByRaw,
    closeButtonVisible,
    downloadButtonVisible,
    removeGridComponent,
    theme,
    title = 'Spatial Query Manager',
  } = props;

  const loaders = useLoaders();
  const setComponentHover = useSetComponentHover();
  const setComponentViewInfo = useSetComponentViewInfo(uuid);
  const mergeCoordination = useMergeCoordination();

  // Acccount for possible meta-coordination.
  const coordinationScopes = useCoordinationScopes(coordinationScopesRaw);
  const coordinationScopesBy = useCoordinationScopesBy(coordinationScopes, coordinationScopesByRaw);

  // Get "props" from the coordination space.
  const [{
    dataset,
    obsType,
    featureType,
    featureValueType,
    spatialZoom: zoom,
    spatialTargetX: targetX,
    spatialTargetY: targetY,
    spatialTargetZ: targetZ,
    spatialTargetT: targetT,
    spatialRenderingMode,
    spatialRotationX: rotationX,
    spatialRotationY: rotationY,
    spatialRotationZ: rotationZ,
    spatialRotationOrbit: rotationOrbit,
    spatialOrbitAxis: orbitAxis,
    spatialAxisFixed,

    // TODO: get obsSets per-layer or per-channel
    additionalObsSets,
    obsSetColor,
    obsColorEncoding,
    obsSetSelection,
  }, {
    setSpatialZoom: setZoom,
    setSpatialTargetX: setTargetX,
    setSpatialTargetY: setTargetY,
    setSpatialTargetZ: setTargetZ,
    setSpatialRotationX: setRotationX,
    setSpatialRotationY: setRotationY,
    setSpatialRotationZ: setRotationZ,
    setSpatialRotationOrbit: setRotationOrbit,

    // TODO: get obsSets per-layer or per-channel
    setAdditionalObsSets,
    setObsSetColor,
    setObsColorEncoding,
    setObsSetSelection,
  }] = useCoordination(COMPONENT_COORDINATION_TYPES[ViewType.SPATIAL_QUERY_MANAGER], coordinationScopes);

  const {
    spatialZoom: initialZoom,
    spatialTargetX: initialTargetX,
    spatialTargetY: initialTargetY,
    spatialTargetZ: initialTargetZ,
  } = useInitialCoordination(
    COMPONENT_COORDINATION_TYPES[ViewType.SPATIAL_QUERY_MANAGER], coordinationScopes,
  );

  const [segmentationLayerScopes, segmentationChannelScopesByLayer] = useMultiCoordinationScopesSecondaryNonNull(
    CoordinationType.SEGMENTATION_CHANNEL,
    CoordinationType.SEGMENTATION_LAYER,
    coordinationScopes,
    coordinationScopesBy,
  );

  const spotLayerScopes = useMultiCoordinationScopesNonNull(
    CoordinationType.SPOT_LAYER,
    coordinationScopes,
  );

  const pointLayerScopes = useMultiCoordinationScopesNonNull(
    CoordinationType.POINT_LAYER,
    coordinationScopes,
  );

  // Object keys are coordination scope names for spatialSegmentationLayer.
  const segmentationLayerCoordination = useComplexCoordination(
    [
      CoordinationType.FILE_UID,
      CoordinationType.SEGMENTATION_CHANNEL,
      CoordinationType.SPATIAL_LAYER_VISIBLE,
      CoordinationType.SPATIAL_LAYER_OPACITY,
    ],
    coordinationScopes,
    coordinationScopesBy,
    CoordinationType.SEGMENTATION_LAYER,
  );

  // Object keys are coordination scope names for spatialSegmentationChannel.
  const segmentationChannelCoordination = useComplexCoordinationSecondary(
    [
      CoordinationType.OBS_TYPE,
      CoordinationType.SPATIAL_TARGET_C,
      CoordinationType.SPATIAL_CHANNEL_VISIBLE,
      CoordinationType.SPATIAL_CHANNEL_OPACITY,
      CoordinationType.SPATIAL_CHANNEL_COLOR,
      CoordinationType.SPATIAL_SEGMENTATION_FILLED,
      CoordinationType.SPATIAL_SEGMENTATION_STROKE_WIDTH,
      CoordinationType.OBS_COLOR_ENCODING,
      CoordinationType.FEATURE_SELECTION,
      CoordinationType.FEATURE_VALUE_COLORMAP,
      CoordinationType.FEATURE_VALUE_COLORMAP_RANGE,
      CoordinationType.OBS_SET_COLOR,
      CoordinationType.OBS_SET_SELECTION,
      CoordinationType.ADDITIONAL_OBS_SETS,
      CoordinationType.OBS_HIGHLIGHT,
      CoordinationType.TOOLTIPS_VISIBLE,
      CoordinationType.TOOLTIP_CROSSHAIRS_VISIBLE,
      CoordinationType.LEGEND_VISIBLE,
    ],
    coordinationScopes,
    coordinationScopesBy,
    CoordinationType.SEGMENTATION_LAYER,
    CoordinationType.SEGMENTATION_CHANNEL,
  );

  // Spot layer
  const spotLayerCoordination = useComplexCoordination(
    [
      CoordinationType.OBS_TYPE,
      CoordinationType.SPATIAL_LAYER_VISIBLE,
      CoordinationType.SPATIAL_LAYER_OPACITY,
      CoordinationType.SPATIAL_SPOT_RADIUS,
      CoordinationType.SPATIAL_SPOT_FILLED,
      CoordinationType.SPATIAL_SPOT_STROKE_WIDTH,
      CoordinationType.OBS_COLOR_ENCODING,
      CoordinationType.FEATURE_SELECTION,
      CoordinationType.FEATURE_VALUE_COLORMAP,
      CoordinationType.FEATURE_VALUE_COLORMAP_RANGE,
      CoordinationType.OBS_SET_COLOR,
      CoordinationType.OBS_SET_SELECTION,
      CoordinationType.ADDITIONAL_OBS_SETS,
      CoordinationType.SPATIAL_LAYER_COLOR,
      CoordinationType.OBS_HIGHLIGHT,
      CoordinationType.TOOLTIPS_VISIBLE,
      CoordinationType.TOOLTIP_CROSSHAIRS_VISIBLE,
      CoordinationType.LEGEND_VISIBLE,
    ],
    coordinationScopes,
    coordinationScopesBy,
    CoordinationType.SPOT_LAYER,
  );

  // Point layer
  const pointLayerCoordination = useComplexCoordination(
    [
      CoordinationType.OBS_TYPE,
      CoordinationType.SPATIAL_LAYER_VISIBLE,
      CoordinationType.SPATIAL_LAYER_OPACITY,
      CoordinationType.OBS_COLOR_ENCODING,
      CoordinationType.FEATURE_SELECTION,
      CoordinationType.FEATURE_VALUE_COLORMAP,
      CoordinationType.FEATURE_VALUE_COLORMAP_RANGE,
      CoordinationType.SPATIAL_LAYER_COLOR,
      CoordinationType.OBS_HIGHLIGHT,
      CoordinationType.TOOLTIPS_VISIBLE,
      CoordinationType.TOOLTIP_CROSSHAIRS_VISIBLE,
      CoordinationType.LEGEND_VISIBLE,
    ],
    coordinationScopes,
    coordinationScopesBy,
    CoordinationType.POINT_LAYER,
  );

  // Points data
  const [obsPointsData, obsPointsDataStatus, obsPointsUrls] = useMultiObsPoints(
    coordinationScopes, coordinationScopesBy, loaders, dataset,
    mergeCoordination, uuid,
  );

  const [pointMultiObsLabelsData, pointMultiObsLabelsDataStatus] = usePointMultiObsLabels(
    coordinationScopes, coordinationScopesBy, loaders, dataset,
  );

  // Spots data
  const [obsSpotsData, obsSpotsDataStatus, obsSpotsUrls] = useMultiObsSpots(
    coordinationScopes, coordinationScopesBy, loaders, dataset,
    mergeCoordination, uuid,
  );

  const [obsSpotsSetsData, obsSpotsSetsDataStatus] = useSpotMultiObsSets(
    coordinationScopes, coordinationScopesBy, loaders, dataset,
  );

  const [obsSpotsFeatureLabelsData, obsSpotsFeatureLabelsDataStatus] = useSpotMultiFeatureLabels(
    coordinationScopes, coordinationScopesBy, loaders, dataset,
  );

  const [
    spotMultiExpressionData,
    spotMultiLoadedFeatureSelection,
    spotMultiExpressionExtents,
    spotMultiExpressionNormData,
    spotMultiFeatureSelectionStatus,
  ] = useSpotMultiFeatureSelection(
    coordinationScopes, coordinationScopesBy, loaders, dataset,
  );

  const [spotMultiIndicesData, spotMultiIndicesDataStatus] = useSpotMultiObsFeatureMatrixIndices(
    coordinationScopes, coordinationScopesBy, loaders, dataset,
  );

  // Segmentations data
  const [obsSegmentationsLocationsData, obsSegmentationsLocationsDataStatus] = useSegmentationMultiObsLocations(
    coordinationScopes, coordinationScopesBy, loaders, dataset,
  );

  const [obsSegmentationsData, obsSegmentationsDataStatus, obsSegmentationsUrls] = useMultiObsSegmentations(
    coordinationScopes, coordinationScopesBy, loaders, dataset,
    mergeCoordination, uuid,
  );

  const [obsSegmentationsSetsData, obsSegmentationsSetsDataStatus] = useSegmentationMultiObsSets(
    coordinationScopes, coordinationScopesBy, loaders, dataset,
  );

  const [
    segmentationMultiExpressionData,
    segmentationMultiLoadedFeatureSelection,
    segmentationMultiExpressionExtents,
    segmentationMultiExpressionNormData,
    segmentationMultiFeatureSelectionStatus,
  ] = useSegmentationMultiFeatureSelection(
    coordinationScopes, coordinationScopesBy, loaders, dataset,
  );

  const [segmentationMultiIndicesData, segmentationMultiIndicesDataStatus] = useSegmentationMultiObsFeatureMatrixIndices(
    coordinationScopes, coordinationScopesBy, loaders, dataset,
  );

  const isReady = useReady([
    // Spots
    obsSpotsDataStatus,
    obsSpotsSetsDataStatus,
    spotMultiFeatureSelectionStatus,
    spotMultiIndicesDataStatus,
    // Points
    obsPointsDataStatus,
    pointMultiObsLabelsDataStatus,
    // Segmentations
    obsSegmentationsDataStatus,
    obsSegmentationsSetsDataStatus,
    segmentationMultiFeatureSelectionStatus,
    segmentationMultiIndicesDataStatus,
    obsSegmentationsLocationsDataStatus,
  ]);

  // Convert these to coordination types?
  const [queryType, setQueryType] = useState('grid');
  const [maxDist, setMaxDist] = useState(200);
  const [minSize, setMinSize] = useState(2); // Minimum number of unique cell types in a transaction.
  const [minSupport, setMinSupport] = useState(0.5);

  const firstSpotLayerScope = spotLayerScopes?.[0];
  const currSelectedSets = spotLayerCoordination[0][firstSpotLayerScope]?.obsSetSelection;
  const currSelectedSetGroup = currSelectedSets?.[0]?.[0];

  const cellTypeOfInterest = currSelectedSets?.length === 1 && currSelectedSets[0].length === 2
    ? currSelectedSets[0][1]
    : null;
  
  const spatialQueryResult = useQuery({
    enabled: !!(obsSpotsData && obsSpotsSetsData && currSelectedSetGroup),
    // TODO: should this use obsSegmentationsLocations instead of obsSpots?
    queryKey: [queryType, maxDist, minSize, minSupport, firstSpotLayerScope, currSelectedSetGroup, 'spatial-query'],
    meta: { obsSpotsData, obsSpotsSetsData, spotLayerCoordination },
    queryFn: async (ctx) => {
      const { obsSpotsData, obsSpotsSetsData, spotLayerCoordination } = ctx.meta;
      const [queryType, maxDist, minSize, minSupport, firstSpotLayerScope, currSelectedSetGroup] = ctx.queryKey;

      const spotLayerData = obsSpotsData[firstSpotLayerScope];
      const spotLayerSets = obsSpotsSetsData[firstSpotLayerScope];
      
      const { obsIndex, obsSpots } = spotLayerData;
      const { obsIndex: obsIndexForSets, obsSets, obsSetsMembership } = spotLayerSets;
      const xCoords = obsSpots.data[0];
      const yCoords = obsSpots.data[1];
      const xExtent = extent(xCoords);
      const yExtent = extent(yCoords);

      // initialize Flatbush for N items
      const flatbushIndex = new Flatbush(obsIndex.length);

      // fill it with 1000 rectangles
      for (let i = 0; i < obsIndex.length; i++) {
        flatbushIndex.add(xCoords[i], yCoords[i]);
      }

      // perform the indexing
      flatbushIndex.finish();

      // Obtain [x,y] coordinates for the grid points.
      const gridPoints = [];
      for(let gridX = xExtent[0] - maxDist; gridX < xExtent[1] + maxDist; gridX += maxDist) {
        for(let gridY = yExtent[0] - maxDist; gridY < yExtent[1] + maxDist; gridY += maxDist) {
          gridPoints.push([gridX, gridY]);
        }
      }

      // One list of observation IDs per grid point query
      const indexLists = [];
      for(const gridPoint of gridPoints) {
        // TODO: also support k-nearest-neighbor query.
        // make a k-nearest-neighbors query
        // const neighborIds = flatbushIndex.neighbors(xCoords[10], yCoords[10], 5);

        // make a bounding box query
        const [gridX, gridY] = gridPoint;
        const minX = gridX - maxDist/2;
        const maxX = gridX + maxDist/2;
        const minY = gridY - maxDist/2;
        const maxY = gridY + maxDist/2;
        // TODO: filter to a circular region? (rather than a rectangular one)
        const found = flatbushIndex.search(minX, minY, maxX, maxY).map((i) => obsIndex[i]);
        indexLists.push(found);
      }

      // Keep track of the obsIds that match the transactions.
      // This is a map from transaction to a list of observation indices.
      // We use InternMap to allow using arrays as keys.
      const transactionToObsIdsMap = new InternMap([], JSON.stringify);

      // Convert lists of observation indices to transactions.
      const transactions = [];
      for(const indexList of indexLists) {
        if(indexList.length > 0) {
          // For each indexList, we create a transaction of cell types.
          // We use the obsSetsMembership to get the cell types for each observation ID.
          const cellTypes = indexList.map(obsId => obsSetsMembership
            .get(obsId)
            ?.find(setPath => setPath[0] === currSelectedSetGroup)
            ?.[1] // TODO: here, we take the second element of the setPath as the cell type name string.
            // Should we consider the full potential hierarchy of cell types instead?
          );
          const transaction = Array.from(new Set(cellTypes)).toSorted();
          if(transaction.length >= minSize) {
            transactions.push(transaction);
            // Store the transaction to observation IDs mapping.
            // Reference: https://github.com/ShaokunAn/Spatial-Query/blob/0570c54bd6e046466e05c6b800d6701a7ab15c4a/SpatialQuery/spatial_query.py#L789
            if (!transactionToObsIdsMap.has(transaction)) {
              transactionToObsIdsMap.set(transaction, indexList);
            } else {
              const prevTransaction = transactionToObsIdsMap.get(transaction);
              transactionToObsIdsMap.set(transaction, prevTransaction.concat(indexList));
            }
          }
        }
      }
      
      const fpgrowth = new FPGrowth(minSupport);
      const itemsets = await fpgrowth.exec(transactions);

      // Returns an array representing the frequent itemsets.
      const validItemsets = itemsets.filter(d => d.items.length >= minSize);
      const sortedItemsets = validItemsets.toSorted((a, b) => b.support - a.support);

      const sortedItemsetsWithObsIds = sortedItemsets.map((itemset) => {
        // For each itemset, get the observation IDs that match the transaction.
        const motif = itemset.items;
        let matchingObsIds = [];
        transactionToObsIdsMap.keys().forEach((transaction) => {
          // Check if all motif items are present in the transaction.
          if (motif.every(item => transaction.includes(item))) {
            // If so, we can use this transaction to get the observation IDs.
            const obsIds = transactionToObsIdsMap.get(transaction);
            matchingObsIds = matchingObsIds.concat(obsIds);
            // Filter the matchingObsIds to only include those obsIds corresponding to
            // cell types in the current motif.
            matchingObsIds = matchingObsIds.filter(obsId => {
              const obsIdCellType = obsSetsMembership.get(obsId)
                ?.find(setPath => setPath[0] === currSelectedSetGroup)
                ?.[1]; // Again, we take the second element of the setPath as the cell type name string.
                // TODO: Should we consider the full potential hierarchy of cell types instead?
              return motif.includes(obsIdCellType);
            });
          }
        });
        const obsIds = Array.from(new Set(matchingObsIds));
        return { ...itemset, obsIds };
      });
      console.log(sortedItemsetsWithObsIds);


      // TODO: compute p-values for each motif
      // Currently, SpatialQuery only provides p-values for cellTypeOfInterest queries
      // Reference: https://github.com/ShaokunAn/Spatial-Query/blob/0570c54bd6e046466e05c6b800d6701a7ab15c4a/SpatialQuery/spatial_query.py#L490C13-L492C131
      // obj = hypergeom(M, n, N), where
      // M = total number of cells (all cell types)
      // n = number of cells annotated as cell type of interest / number of times cell type of interest appears in motif
      // N = number of motif instances (number drawn without replacement) = n_motif
      // n_motif = number of cells within k-NN or radius
      // n_center_motif = number of cells within k-NN or radius, centered on cell type of interest
      // expectation = obj.mean()
      // p-value = obj.sf(n_center_motif)

      return sortedItemsets;
    },
  });
  const { data, status, isFetching, error } = spatialQueryResult;
  console.log(data, status, isFetching, error);

  const onQueryTypeChange = useCallback((e) => {
    setQueryType(e.target.value);
}, []);



  return (
    <TitleInfo
      title={title}
      theme={theme}
      closeButtonVisible={closeButtonVisible}
      downloadButtonVisible={downloadButtonVisible}
      removeGridComponent={removeGridComponent}
      isReady={isReady}
      isScroll
    >
      <div>
        <p>Query Parameters</p>
        <label>
            Query type&nbsp;
            <select onChange={onQueryTypeChange}>
                <option value="grid">Grid-based</option>
                <option value="rand">Random-based</option>
                <option value="ct-center" disabled={cellTypeOfInterest === null}>Cell type of interest</option>
            </select>
        </label>
        <br/>
        <label>
            {/* Maximum distance to consider a cell as a neighbor. */}
            Max. Dist.
            <input type="range" value={maxDist} onChange={e => setMaxDist(parseFloat(e.target.value))} min={50} max={250} step={1} />
            {maxDist}
        </label>
        <br/>
        <label>
            {/* Minimum neighborhood size for each point to consider. */}
            Min. Size
            <input type="range" value={minSize} onChange={e => setMinSize(parseFloat(e.target.value))} min={0} max={20} step={1} />
            {minSize}
        </label>
        <br/>
        <label>
            {/* Threshold of frequency to consider a pattern as a frequent pattern. */}
            Min. Support
            <input type="range" value={minSupport} onChange={e => setMinSupport(parseFloat(e.target.value))} min={0} max={1} step={0.01} />
            {minSupport}
        </label>
        <p>Query Results</p>
        <p>{data?.length} matches</p>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    </TitleInfo>
  );
}
