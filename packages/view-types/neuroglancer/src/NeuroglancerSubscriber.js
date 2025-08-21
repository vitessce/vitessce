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
  quaternionToEuler,
  eulerToQuaternion,
  valueGreaterThanEpsilon,
  compareViewerState,
  makeDeckNgCalibrator,
  conjQuat,
  mulQuat,

} from './utils.js';

const VITESSCE_INTERACTION_DELAY = 50;
const INIT_DECK_ZOOM = -3.6;
const ZOOM_EPS = 1e-2;
const ROTATION_EPS = 1e-3;
const TARGET_EPS = 0.5;
// To rotate the y-axis up in NG
const Q_Y_UP = [1, 0, 0, 0]; // [x,y,z,w] for 180° about X

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
    // spatialOrbitAxis, // always along Y-axis - not used in conversion
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
    // setSpatialRotationY: setRotationY,
    // setSpatialRotationZ: setRotationZ,
    setSpatialRotationOrbit: setRotationOrbit,
    setSpatialZoom: setZoom,
  }] = useCoordination(COMPONENT_COORDINATION_TYPES[ViewType.NEUROGLANCER], coordinationScopes);


  const latestViewerStateRef = useRef(initialViewerState);
  const initialRotationPushedRef = useRef(false);

  console.log("NG Subs Render orbit", `ORBIT ${spatialOrbitAxis}`);

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

  const lastInteractionSource = useRef(null);
  const applyNgUpdateTimeoutRef = useRef(null);
  const lastNgPushOrientationRef = useRef(null);
  const calibratorRef = useRef(null);
  const translationOffsetRef = useRef([0, 0, 0]);
  const zoomRafRef = useRef(null);
  const lastNgQuatRef = useRef([0, 0, 0, 1]);
  const lastNgScaleRef = useRef(null);
  const lastVitessceRotationRef = useRef({
    x: spatialRotationX,
    y: spatialRotationY,
    z: spatialRotationZ,
    orbit: spatialRotationOrbit,
  });

  // Track the last coord values we saw, and only mark "vitessce"
  // when *those* actually change. This prevents cell set renders
  // from spoofing the source.
  const prevCoordsRef = useRef({
    zoom: spatialZoom,
    rx: spatialRotationX,
    ry: spatialRotationY,
    rz: spatialRotationZ,
    orbit: spatialRotationOrbit,
    tx: spatialTargetX,
    ty: spatialTargetY,
  });

  /*
   * handleStateUpdate - Interactions from NG to Vitessce are pushed here
   */
  const handleStateUpdate = useCallback((newState) => {
    console.log("handleStateUpdate", "current", lastInteractionSource.current, calibratorRef.current)
     lastInteractionSource.current = 'neuroglancer';
     const { projectionScale, projectionOrientation, position, crossSectionScale} = newState;
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
      } // First mount setup
      
      // ZOOM (NG → deck) — do this only after calibrator exists
      if(Number.isFinite(projectionScale) && projectionScale > 0){
        const deckZoomFromNG = calibratorRef.current.ngToDeck(projectionScale);
        console.log("ZOOM from NG -> VIT", projectionScale , lastNgScaleRef.current, projectionScale - lastNgScaleRef.current)
        const scaleChanged =
          lastNgScaleRef.current == null ||
          Math.abs(projectionScale - lastNgScaleRef.current) > 1e-6 * Math.max(1, projectionScale);
        if (scaleChanged && Number.isFinite(deckZoomFromNG) &&
            Math.abs(deckZoomFromNG - (spatialZoom ?? 0)) > ZOOM_EPS) {
          if (zoomRafRef.current) cancelAnimationFrame(zoomRafRef.current);
          console.log("[ZOOM] NG to VIT getting pushed", deckZoomFromNG, spatialZoom);
          zoomRafRef.current = requestAnimationFrame(() => {
            setZoom(deckZoomFromNG);
            zoomRafRef.current = null;
          });
        }
        // remember last NG scale
        lastNgScaleRef.current = projectionScale;
        
    }

    // TRANSLATION
    if (Array.isArray(position) && position.length >= 2) {
      const [px, py] = position;
      const [ox, oy] = translationOffsetRef.current;
      const tx = px - ox; // map NG → deck
      const ty = py - oy;
      if (Number.isFinite(tx) && Math.abs(tx - (spatialTargetX ?? tx)) > TARGET_EPS) setTargetX(tx);
      if (Number.isFinite(ty) && Math.abs(ty - (spatialTargetY ?? ty)) > TARGET_EPS) setTargetY(ty);
    }

    // ROTATION — only when NG quat actually changes
    const quatChanged = valueGreaterThanEpsilon(
      projectionOrientation, lastNgQuatRef.current, ROTATION_EPS,
    );
    if (quatChanged) {
      if (applyNgUpdateTimeoutRef.current) {
        clearTimeout(applyNgUpdateTimeoutRef.current);
      }
      lastNgPushOrientationRef.current = projectionOrientation;
      applyNgUpdateTimeoutRef.current = setTimeout(() => {
        // remove Y-up correction before sending to Vitessce to avoid dup application
        const qVit = mulQuat(conjQuat(Q_Y_UP), projectionOrientation);
        const [pitchDeg, yawDeg] = quaternionToEuler(qVit);

        const pitchDiff = Math.abs(pitchDeg - (spatialRotationX ?? 0));
        const yawDiff = Math.abs(yawDeg - (spatialRotationOrbit ?? 0));
        if (pitchDiff > ROTATION_EPS || yawDiff > ROTATION_EPS) {
          console.log('🌀 NG → Vitessce Rotation applied:', pitchDeg, yawDeg ,"prev", spatialRotationX, spatialRotationOrbit);
          setRotationX(pitchDeg);
          setRotationOrbit(yawDeg);
        }
      }, VITESSCE_INTERACTION_DELAY);
      lastNgQuatRef.current = projectionOrientation;
    }


    latestViewerStateRef.current = {
      ...latestViewerStateRef.current,
      projectionOrientation,
      projectionScale,
      position,
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
      }
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

    // Translation
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

    // ** --- Orientation handling --- ** //
    const nearEq = (a, b, eps = ROTATION_EPS) => (
      Number.isFinite(a) && Number.isFinite(b) ? Math.abs(a - b) <= eps : a === b
    );
    

    const vitessceRotationRaw = eulerToQuaternion(
      spatialRotationX,
      spatialRotationOrbit,
      spatialRotationZ,
     );

    const vitessceRotation = mulQuat(Q_Y_UP, vitessceRotationRaw);

    // Did Vitessce coords change vs the *previous* render?
    const rotChangedNow =
      !nearEq(spatialRotationX, prevCoordsRef.current.rx) ||
      !nearEq(spatialRotationY, prevCoordsRef.current.ry) ||
      !nearEq(spatialRotationZ, prevCoordsRef.current.rz) ||
      !nearEq(spatialRotationOrbit, prevCoordsRef.current.orbit);
    
    const zoomChangedNow = !nearEq(spatialZoom, prevCoordsRef.current.zoom);

    const transChangedNow =
    !nearEq(spatialTargetX, prevCoordsRef.current.tx)
    || !nearEq(spatialTargetY, prevCoordsRef.current.ty);


    // If NG quat ≠ Vitessce quat on first render, push Vitessce once.
    const shouldForceInitialVitPush = !initialRotationPushedRef.current &&
      valueGreaterThanEpsilon(vitessceRotation, projectionOrientation, ROTATION_EPS);

   // Use explicit source if set; otherwise infer Vitessce when coords changed.
    const src = lastInteractionSource.current
    ?? ((rotChangedNow || zoomChangedNow || transChangedNow) ? 'vitessce'
    : (shouldForceInitialVitPush ? 'vitessce' : null));
    
    console.log('[ORIENT] src=', src, 'NG projOri=', projectionOrientation, 'VIT quat=', eulerToQuaternion(
      spatialRotationX, spatialRotationOrbit, spatialRotationZ,
    ));

    let nextOrientation = projectionOrientation; // start from NG's current quat
    console.log('[ORIENT] src=', lastInteractionSource.current,
      'NG projOri=', projectionOrientation,
      'VIT quat=', vitessceRotation);
    if (src === 'vitessce') {
      // Only push if Vitessce rotation actually changed since last time.
      const rotDiffers = valueGreaterThanEpsilon(vitessceRotation, projectionOrientation, ROTATION_EPS);
    
      if (rotDiffers) {
        nextOrientation = vitessceRotation;
        lastVitessceRotationRef.current = {
          x: spatialRotationX, y: spatialRotationY, z: spatialRotationZ, orbit: spatialRotationOrbit,
        };
        initialRotationPushedRef.current = true;
        // Re-anchor NG -> Deck translation once we commit the initial orientation, the center shows a right translated image
        const [cx = 0, cy = 0, cz = (position?.[2] ?? current.position?.[2] ?? 0)] = position
          || current.position || [];
        const tX = Number.isFinite(spatialTargetX) ? spatialTargetX : 0;
        const tY = Number.isFinite(spatialTargetY) ? spatialTargetY : 0;
        translationOffsetRef.current = [cx - tX, cy - tY, cz];

        console.log('Vitessce → NG: pushing new orientation', nextOrientation);
      } else {
        // No real Vitessce rotation change → do not overwrite NG's quat.
        console.log('Vitessce → NG: no rotation change, keep NG quat');
      }
      if (lastInteractionSource.current === 'vitessce') {
        lastInteractionSource.current = null;
      }
    } else if (src === 'neuroglancer') {
      nextOrientation = lastNgPushOrientationRef.current ?? projectionOrientation;
      lastInteractionSource.current = null;
    } else {
      console.log('Vitessce → NG: Rotation -  Unknown Source');
    }

      const newLayer0 = {
        ...prevLayer,
        segments: nextSegments,
        segmentColors: cellColorMapping,
      };

    console.log('[SRC]', lastInteractionSource.current, 'projOri', projectionOrientation);


    const updated = {
      ...current,
      projectionScale,
      projectionOrientation: nextOrientation,
      position,
      layers: prevSegments.length === 0 ? [newLayer0, ...(current?.layers?.slice(1)
        || [])] : current?.layers,
    };

    latestViewerStateRef.current = updated;

    console.log("derivedState end", updated?.projectionOrientation,  latestViewerStateRef.current?.projectionOrientation )

    prevCoordsRef.current = {
      zoom: spatialZoom,
      rx: spatialRotationX,
      ry: spatialRotationY,
      rz: spatialRotationZ,
      orbit: spatialRotationOrbit,
      tx: spatialTargetX,
      ty: spatialTargetY,
    };

    return updated;
  }, [cellColorMapping, spatialZoom, spatialRotationX, spatialRotationY,
    spatialRotationZ, spatialTargetX, spatialTargetY]);

  const onSegmentHighlight = useCallback((obsId) => {
    setCellHighlight(String(obsId));
  }, [obsIndex, setCellHighlight]);

  // TODO: if all cells are deselected, a black view is shown, rather we want to show empty NG view?
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
