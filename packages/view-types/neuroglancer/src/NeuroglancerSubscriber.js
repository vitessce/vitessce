/* eslint-disable no-unused-vars */
import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { startTransition } from 'react';
import {
  TitleInfo,
  useCoordination,
  useObsSetsData,
  useLoaders,
  useObsEmbeddingData,
} from '@vitessce/vit-s';
import {
  ViewHelpMapping,
  ViewType,
  COMPONENT_COORDINATION_TYPES,
} from '@vitessce/constants-internal';
import { mergeObsSets, getCellColors, setObsSelection } from '@vitessce/sets-utils';
import { isEqual } from 'lodash-es';
import { NeuroglancerComp } from './Neuroglancer.js';
import { useStyles } from './styles.js';
import {
  // deckZoomToProjectionScale,
  // projectionScaleToDeckZoom,
  quaternionToEuler,
  eulerToQuaternion,
  valueGreaterThanEpsilon,
  compareViewerState,
  // computeBaseScaleCss,
  snapTopDownQuat,
  // deckZoomToNgProjectionScale,
  // ngProjectionScaleToDeckZoom,
  makeDeckNgCalibrator,

} from './utils.js';
import { useBaseScale } from './hooks.js';


// TODO: the initial value after 0 changes, should be a way to capture it as is
// const deckZoom = 0;
const VITESSCE_INTERACTION_DELAY = 50;
const INIT_DECK_ZOOM = -3.6;
const ZOOM_EPS = 1e-3;
export function NeuroglancerSubscriber(props) {
  const {
    coordinationScopes,
    closeButtonVisible,
    downloadButtonVisible,
    removeGridComponent,
    theme,
    title = 'Neuroglancer',
    helpText = ViewHelpMapping.NEUROGLANCER,
    viewerState: initialViewerState,
  } = props;

  const [{
    dataset,
    obsType,
    spatialZoom,
    spatialTargetX,
    spatialTargetY,
    spatialRotationX,
    spatialRotationY,
    spatialRotationZ,
    spatialRotationOrbit,
    spatialOrbitAxis,
    embeddingType: mapping,
    obsSetSelection: cellSetSelection,
    additionalObsSets: additionalCellSets,
    obsSetColor: cellSetColor,
  }, {
    setAdditionalObsSets: setAdditionalCellSets,
    setObsSetColor: setCellSetColor,
    setObsColorEncoding: setCellColorEncoding,
    setObsSetSelection: setCellSetSelection,
    setObsHighlight: setCellHighlight,
    setSpatialTargetX: setTargetX,
    setSpatialTargetY: setTargetY,
    setSpatialRotationX: setRotationX,
    setSpatialRotationY: setRotationY,
    // setSpatialRotationZ: setRotationZ,
    setSpatialRotationOrbit: setRotationOrbit,

    setSpatialZoom: setZoom,
  }] = useCoordination(COMPONENT_COORDINATION_TYPES[ViewType.NEUROGLANCER], coordinationScopes);
  const latestViewerStateRef = useRef(initialViewerState);
  // const [clickedSegmentId, setClickedSegmentId] = useState(null);
  console.log("NG Subs REnder Zoom", spatialZoom, spatialTargetX, spatialTargetY);
  // console.log("NG Subs REnder translation", spatialTargetX, spatialTargetY)
  // console.log("NG Subs REnder Rotation",     spatialRotationX, spatialRotationY,spatialRotationZ,spatialRotationOrbit,spatialOrbitAxis)
  const { classes } = useStyles();
  const loaders = useLoaders();

  const [{ obsSets: cellSets }] = useObsSetsData(
    loaders, dataset, false,
    { setObsSetSelection: setCellSetSelection, setObsSetColor: setCellSetColor },
    { cellSetSelection, obsSetColor: cellSetColor },
    { obsType },
  );

  const [{ obsIndex }] = useObsEmbeddingData(
    loaders, dataset, true, {}, {},
    { obsType, embeddingType: mapping },
  );

  const hasMountedRef = useRef(false);
  const lastInteractionSource = useRef(null);
  const applyNgUpdateTimeoutRef = useRef(null);
  const lastNgPushOrientationRef = useRef(null);
  const calibratorRef = useRef(null);
  const translationOffsetRef = useRef([0, 0, 0]);
  const zoomRafRef = useRef(null);
  
  useEffect(() => {
    console.log('useEffect');
        // Avoiding circular updates on first render
        if (!hasMountedRef.current) {
          hasMountedRef.current = true;
        }
        if (lastInteractionSource.current === 'neuroglancer') return;
        lastInteractionSource.current = 'vitessce';
        // console.log('🔁 Vitessce interaction', lastInteractionSource.current);
      }, [spatialZoom, spatialRotationX, spatialRotationY]);

  /*
   * handleStateUpdate - Interactions from NG to Vitessce
   */
  const handleStateUpdate = useCallback((newState) => {
    console.log("handleStateUpdate", newState, "current", lastInteractionSource.current, calibratorRef.current)
     const { projectionScale, projectionOrientation, position, crossSectionScale, crossSectionOrientation, orthographicProjection } = newState;
     const prevProjectionOrientation = latestViewerStateRef.current.projectionOrientation;

      if (!calibratorRef.current) {
        const sEff0 = (Number.isFinite(projectionScale) && projectionScale > 0)
          ? projectionScale
          : crossSectionScale;
        if (!Number.isFinite(sEff0) || sEff0 <= 0) return; // wait for a real scale
      
        const zRef = Number.isFinite(spatialZoom) ? spatialZoom : 0; // anchor to current deck zoom
        calibratorRef.current = makeDeckNgCalibrator(sEff0, zRef);
      
        const [px = 0, py = 0, pz = 0] = Array.isArray(position) ? position : [0, 0, 0];
        const tX = Number.isFinite(spatialTargetX) ? spatialTargetX : 0;
        const tY = Number.isFinite(spatialTargetY) ? spatialTargetY : 0;
        translationOffsetRef.current = [px - tX, py - tY, pz];

        const sWanted = calibratorRef.current.deckToNg(INIT_DECK_ZOOM);
        latestViewerStateRef.current = {
          ...latestViewerStateRef.current,
          projectionScale: sWanted,
          crossSectionScale: sWanted,
        };
        if (!Number.isFinite(spatialZoom) || Math.abs(spatialZoom - INIT_DECK_ZOOM) > ZOOM_EPS) {
          setZoom(INIT_DECK_ZOOM);
        }
      return;
      }
      
      // ZOOM (NG → deck) — do this only after calibrator exists
      const ngScaleEff = (Number.isFinite(projectionScale) && projectionScale > 0)
        ? projectionScale
        : crossSectionScale;
      const deckZoomFromNG = calibratorRef.current.ngToDeck(ngScaleEff);
      console.log("deckZoomFromNG", ngScaleEff, deckZoomFromNG, Math.abs(deckZoomFromNG - (spatialZoom ?? 0)) > ZOOM_EPS)
   
   
    // const deckZoomFromNG = calibratorRef.current.ngToDeck(projectionScale);
  
      if (Number.isFinite(deckZoomFromNG) &&
        Math.abs(deckZoomFromNG - (spatialZoom ?? 0)) > ZOOM_EPS) {

          if (zoomRafRef.current) cancelAnimationFrame(zoomRafRef.current);
          console.log("[ZOOM] NG to VIT", deckZoomFromNG)
          zoomRafRef.current = requestAnimationFrame(() => {
            setZoom(deckZoomFromNG);
            zoomRafRef.current = null;
            });
          // setZoom(deckZoomFromNG);
      }
      lastInteractionSource.current = 'neuroglancer';
      
    //TRANSLATION
    const TARGET_EPS = 0.5;
    if (Array.isArray(position) && position.length >= 2) {
      const [px, py] = position;
      const [ox, oy] = translationOffsetRef.current;
      const tx = px - ox;   // map NG → deck
      const ty = py - oy;
      if (Number.isFinite(tx) && Math.abs(tx - (spatialTargetX ?? tx)) > TARGET_EPS) setTargetX(tx);
      if (Number.isFinite(ty) && Math.abs(ty - (spatialTargetY ?? ty)) > TARGET_EPS) setTargetY(ty);
    }


    console.log("handleStateUpdate", projectionScale, deckZoomFromNG, projectionOrientation, position);
    if (
      !valueGreaterThanEpsilon(projectionOrientation, prevProjectionOrientation, 1e-5)
    ) {
      // console.log('⛔️ Skip NG → Vitessce update (loopback)');
      return;
    }
    // ROTATION
    if (applyNgUpdateTimeoutRef.current) {
      clearTimeout(applyNgUpdateTimeoutRef.current);
    }
    lastNgPushOrientationRef.current = latestViewerStateRef.current.projectionOrientation;
    applyNgUpdateTimeoutRef.current = setTimeout(() => {
      const [pitch, yaw] = quaternionToEuler(latestViewerStateRef.current.projectionOrientation);

      const pitchDiff = Math.abs(pitch - spatialRotationX);
      if (pitchDiff > 0.001) {
        console.log('🌀 NG → Vitessce (debounced apply):', pitch);
        setRotationX(pitch);
        setRotationOrbit(yaw);
        lastInteractionSource.current = 'neuroglancer';
      }
    }, VITESSCE_INTERACTION_DELAY);


    latestViewerStateRef.current = {
      ...latestViewerStateRef.current,
      projectionOrientation,
      projectionScale,
      // position,
    };
  }, []);


  const onSegmentClick = useCallback((value) => {
    // TODO multiple segments are added sometime to the selection - each click replaces the other
    if (value) {
      const id = String(value);
      const selectedCellIds = [id];
      const alreadySelectedId = cellSetSelection?.flat()?.some(sel => sel.includes(id));
      // Don't create no selection from same ids
      if (alreadySelectedId) {
        // TODO: reset the setObsSelection
        return;
      };
      setObsSelection(
        selectedCellIds, additionalCellSets, cellSetColor,
        setCellSetSelection, setAdditionalCellSets, setCellSetColor,
        setCellColorEncoding,
        'Selection ',
        `: based on selected segments ${value}`,
      );
    }
  }, [additionalCellSets, cellSetColor, setAdditionalCellSets,
    setCellColorEncoding, setCellSetColor, setCellSetSelection,
  ]);

  const mergedCellSets = useMemo(() => mergeObsSets(
    cellSets, additionalCellSets,
  ), [cellSets, additionalCellSets]);

  const cellColors = useMemo(() => getCellColors({
    cellSets: mergedCellSets,
    cellSetSelection,
    cellSetColor,
    obsIndex,
    theme,
  }), [mergedCellSets, theme,
    cellSetColor, cellSetSelection, obsIndex]);

  const rgbToHex = useCallback(rgb => (typeof rgb === 'string' ? rgb
    : `#${rgb.map(c => c.toString(16).padStart(2, '0')).join('')}`), []);

  // const toNormalizedRgb = (c) => {
  //   if (Array.isArray(c)) {
  //     const [r, g, b] = c;
  //     // accept either 0..255 or 0..1
  //     return (r <= 1 && g <= 1 && b <= 1)
  //       ? [r, g, b]
  //       : [r / 255, g / 255, b / 255];
  //   }
  //   if (typeof c === 'string' && c[0] === '#') {
  //     return [
  //       parseInt(c.slice(1, 3), 16) / 255,
  //       parseInt(c.slice(3, 5), 16) / 255,
  //       parseInt(c.slice(5, 7), 16) / 255,
  //     ];
  //   }
  //   return [0, 0, 0];
  // };

  // const cellColorMappingRef = useRef({});
  const batchedUpdateTimeoutRef = useRef(null);
  const [batchedCellColors, setBatchedCellColors] = useState(cellColors);

  useEffect(() => {
    if (batchedUpdateTimeoutRef.current) {
      clearTimeout(batchedUpdateTimeoutRef.current);
    }
    batchedUpdateTimeoutRef.current = setTimeout(() => {
      setBatchedCellColors(cellColors);
    }, 100);

    // TODO: look into deferredValue from React
    // startTransition(() => {
    //   setBatchedCellColors(cellColors);
    // });

  }, [cellColors]);
  // TODO use a ref if slow - see prev commits
  const cellColorMapping = useMemo(() => {
    const colorMapping = {};
    batchedCellColors.forEach((color, cell) => {
      colorMapping[cell] = rgbToHex(color);
      // colorMapping[cell] = toNormalizedRgb(color);
    });
    return colorMapping;
  }, [batchedCellColors]);



  const derivedViewerState = useMemo(() => {
    // TODO: Tune NG to sync with Vitessce on first load
    const { current } = latestViewerStateRef;
    const nextSegments = Object.keys(cellColorMapping);
    const prevLayer = current?.layers?.[0] || {};
    const prevSegments = prevLayer.segments || [];
    // let hasInteractionsChangedState = false;
    console.log("derivedViewerState", prevSegments?.length, Object.keys(cellColorMapping)?.length, current.projectionOrientation);
    let { projectionScale, projectionOrientation, position,  crossSectionScale, crossSectionOrientation } = current;

    if (typeof spatialZoom === 'number' && calibratorRef.current && lastInteractionSource.current !== 'neuroglancer') {
       const s = calibratorRef.current.deckToNg(spatialZoom);
       if (Number.isFinite(s) && s > 0) {
        projectionScale = s;
        crossSectionScale = s;
       }
     }

    const TARGET_EPS = 0.5;
    const [ox, oy, oz] = translationOffsetRef.current;
    const [px = 0, py = 0, pz = (current.position?.[2] ?? oz)] = current.position || [];
    const hasDeckTarget =  Number.isFinite(spatialTargetX) && Number.isFinite(spatialTargetY);
    if (hasDeckTarget) {
       const nx = spatialTargetX + ox;  // deck → NG
       const ny = spatialTargetY + oy;
        if (Math.abs(nx - px) > TARGET_EPS || Math.abs(ny - py) > TARGET_EPS) {
        position = [nx, ny, pz];
      }
    }
    const vitessceRotation = eulerToQuaternion(
      spatialRotationX,
      spatialRotationOrbit,
      spatialRotationZ,
    );
    // Only update state if coming from Vitessce - avoid circular self changes
    if (lastInteractionSource.current === 'vitessce') {
      console.log('Vitessce → NG: pushing new orientation Before', vitessceRotation, projectionOrientation);
      if (valueGreaterThanEpsilon(vitessceRotation, projectionOrientation, 1e-2)) {
        projectionOrientation = vitessceRotation;
        console.log('Vitessce → NG: pushing new orientation', vitessceRotation, projectionOrientation);
      }
       else {
        console.log('Skip push to NG — no quaternion change');
      }
    } else if (lastInteractionSource.current === 'neuroglancer') {
      // prevent override by committing what NG sent
      projectionOrientation = lastNgPushOrientationRef.current ?? projectionOrientation;
      // console.log('NG → NG: committing NG-derived orientation');
      lastInteractionSource.current = null;
    }
    else {
      console.log('Vitessce → NG: Skipping due to unknown source');
    }

    const newLayer0 = {
      ...prevLayer,
      segments: nextSegments,
      segmentColors: cellColorMapping,
    };
    const desiredQuat = snapTopDownQuat(spatialRotationOrbit ?? 0);

    const updated = {
      ...current,
      projectionScale,
      // TODO: Uncomment if we want a rotated view to match Spatial View (xy)
      // projectionOrientation,
      // Below changes the view to yz plan to mimic Spatial view projection
      projectionOrientation: desiredQuat, // TODO - move y upward
      // position,
      // orthographicProjection: true,
      // crossSectionScale,
      // crossSectionOrientation: desiredQuat,
      layers: [newLayer0, ...(current?.layers?.slice(1) || [])],
    };
    // console.log("before", compareViewerState(current, updated))
    const hasInteractionsChangedState = compareViewerState(current, updated);
    latestViewerStateRef.current = updated;
    // if (!hasInteractionsChangedState){
      // console.log("interactions From vitessce", prevSegments?.length > 0, hasInteractionsChangedState, prevSegments?.length === 0 && hasInteractionsChangedState, isEqual( latestViewerStateRef.current, updated));
    // }
    

    // if (prevSegments?.length === 0 && hasInteractionsChangedState) 
    //     return current;

    console.log("derivedState end", updated,  latestViewerStateRef.current )

    return updated;
  }, [cellColorMapping, spatialZoom, spatialRotationX, spatialRotationY,
    spatialRotationZ,]);

  const onSegmentHighlight = useCallback((obsId) => {
    setCellHighlight(String(obsId));
  }, [obsIndex, setCellHighlight]);

  // TODO: if all cells are deselected, a black view is shown, rather we want to show empty NG view
  if (!cellColorMapping || Object.keys(cellColorMapping).length === 0) {
    return;
  }
  
  return (
    <TitleInfo
      title={title}
      helpText={helpText}
      isSpatial
      theme={theme}
      closeButtonVisible={closeButtonVisible}
      downloadButtonVisible={downloadButtonVisible}
      removeGridComponent={removeGridComponent}
      isReady
      withPadding={false}
    >
      <NeuroglancerComp
        classes={classes}
        onSegmentClick={onSegmentClick}
        onSelectHoveredCoords={onSegmentHighlight}
        viewerState={derivedViewerState}
        cellColorMapping={cellColorMapping}
        setViewerState={handleStateUpdate}
      />
    </TitleInfo>
  );
}
