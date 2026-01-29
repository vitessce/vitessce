/* eslint-disable no-unused-vars */
import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import {
  TitleInfo,
  useCoordination,
  useObsSetsData,
  useLoaders,
  useObsEmbeddingData,
  useCoordinationScopes,
} from '@vitessce/vit-s';
import {
  ViewHelpMapping,
  ViewType,
  COMPONENT_COORDINATION_TYPES,
} from '@vitessce/constants-internal';
import { mergeObsSets, getCellColors, setObsSelection } from '@vitessce/sets-utils';
import { NeuroglancerComp } from './Neuroglancer.js';
import { useNeuroglancerViewerState } from './data-hook-ng-utils.js';
import { useStyles } from './styles.js';
import {
  quaternionToEuler,
  eulerToQuaternion,
  valueGreaterThanEpsilon,
  nearEq,
  makeVitNgZoomCalibrator,
  conjQuat,
  multiplyQuat,
  rad2deg,
  deg2rad,
  Q_Y_UP,
} from './utils.js';

const VITESSCE_INTERACTION_DELAY = 50;
const INIT_VIT_ZOOM = -3.6;
const ZOOM_EPS = 1e-2;
const ROTATION_EPS = 1e-3;
const TARGET_EPS = 0.5;
const NG_ROT_COOLDOWN_MS = 120;

const LAST_INTERACTION_SOURCE = {
  vitessce: 'vitessce',
  neuroglancer: 'neuroglancer',
};

function rgbToHex(rgb) {
  return (typeof rgb === 'string'
    ? rgb
    : `#${rgb.map(c => c.toString(16).padStart(2, '0')).join('')}`);
}

export function NeuroglancerSubscriber(props) {
  const {
    coordinationScopes: coordinationScopesRaw,
    closeButtonVisible,
    downloadButtonVisible,
    removeGridComponent,
    theme,
    title = 'Neuroglancer',
    helpText = ViewHelpMapping.NEUROGLANCER,
  } = props;

  const loaders = useLoaders();
  const coordinationScopes = useCoordinationScopes(coordinationScopesRaw);

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
    obsSetColor: cellSetColor,
    obsSetSelection: cellSetSelection,
    additionalObsSets: additionalCellSets,
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


  // console.log("NG Subs Render orbit", spatialRotationX, spatialRotationY, spatialRotationOrbit);

  const { classes } = useStyles();

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

  const [initalViewerState] = useNeuroglancerViewerState(
    loaders, dataset, false,
    undefined, undefined,
    { obsType: 'cell' },
  );

  const latestViewerStateRef = useRef(initalViewerState);
  const initialRotationPushedRef = useRef(false);

  const ngRotPushAtRef = useRef(0);
  const lastInteractionSource = useRef(null);
  const applyNgUpdateTimeoutRef = useRef(null);
  const lastNgPushOrientationRef = useRef(null);
  const initialRenderCalibratorRef = useRef(null);
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

  // Track layer loading state for showing loading indicator
  const [isLayersLoaded, setIsLayersLoaded] = useState(false);

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

  /*
   * handleStateUpdate - Interactions from NG to Vitessce are pushed here
   */
  const handleStateUpdate = useCallback((newState) => {
    lastInteractionSource.current = LAST_INTERACTION_SOURCE.neuroglancer;
    const { projectionScale, projectionOrientation, position } = newState;

    // Set the views on first mount
    if (!initialRenderCalibratorRef.current) {
      // wait for a real scale
      if (!Number.isFinite(projectionScale) || projectionScale <= 0) return;

      // anchor to current Vitessce zoom
      const zRef = Number.isFinite(spatialZoom) ? spatialZoom : 0;
      initialRenderCalibratorRef.current = makeVitNgZoomCalibrator(projectionScale, zRef);

      const [px = 0, py = 0, pz = 0] = position;
      const tX = Number.isFinite(spatialTargetX) ? spatialTargetX : 0;
      const tY = Number.isFinite(spatialTargetY) ? spatialTargetY : 0;
      // TODO: translation off in the first render - turn pz to 0 if z-axis needs to be avoided
      translationOffsetRef.current = [px - tX, py - tY, pz];
      // console.log(" translationOffsetRef.current",  translationOffsetRef.current)
      const syncedZoom = initialRenderCalibratorRef.current.vitToNgZoom(INIT_VIT_ZOOM);
      latestViewerStateRef.current = {
        ...latestViewerStateRef.current,
        projectionScale: syncedZoom,
      };

      if (!Number.isFinite(spatialZoom) || Math.abs(spatialZoom - INIT_VIT_ZOOM) > ZOOM_EPS) {
        setZoom(INIT_VIT_ZOOM);
      }
      return;
    }

    // ZOOM (NG → Vitessce) — do this only after calibrator exists
    if (Number.isFinite(projectionScale) && projectionScale > 0) {
      const vitZoomFromNg = initialRenderCalibratorRef.current.ngToVitZoom(projectionScale);
      const scaleChanged = lastNgScaleRef.current == null
          || (Math.abs(projectionScale - lastNgScaleRef.current)
          > 1e-6 * Math.max(1, projectionScale));
      if (scaleChanged && Number.isFinite(vitZoomFromNg)
            && Math.abs(vitZoomFromNg - (spatialZoom ?? 0)) > ZOOM_EPS) {
        if (zoomRafRef.current) cancelAnimationFrame(zoomRafRef.current);
        zoomRafRef.current = requestAnimationFrame(() => {
          setZoom(vitZoomFromNg);
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
      const tx = px - ox; // map NG → Vitessce
      const ty = py - oy;
      if (Number.isFinite(tx) && Math.abs(tx - (spatialTargetX ?? tx)) > TARGET_EPS) setTargetX(tx);
      if (Number.isFinite(ty) && Math.abs(ty - (spatialTargetY ?? ty)) > TARGET_EPS) setTargetY(ty);
    }
    // ROTATION — only when NG quat actually changes
    const quatChanged = valueGreaterThanEpsilon(
      projectionOrientation, lastNgQuatRef.current, ROTATION_EPS,
    );

    if (quatChanged) {
      if (applyNgUpdateTimeoutRef.current) clearTimeout(applyNgUpdateTimeoutRef.current);
      lastNgPushOrientationRef.current = projectionOrientation;

      applyNgUpdateTimeoutRef.current = setTimeout(() => {
        // Remove the Y-up correction before converting to Euler for Vitessce
        const qVit = multiplyQuat(conjQuat(Q_Y_UP), projectionOrientation);
        const [pitchRad, yawRad] = quaternionToEuler(qVit); // radians
        const currPitchRad = deg2rad(spatialRotationX ?? 0);
        const currYawRad = deg2rad(spatialRotationOrbit ?? 0);

        if (Math.abs(pitchRad - currPitchRad) > ROTATION_EPS
              || Math.abs(yawRad - currYawRad) > ROTATION_EPS) {
          const pitchDeg = rad2deg(pitchRad);
          const yawDeg = rad2deg(yawRad);

          // Mark Vitessce as the source for the next derived pass
          lastInteractionSource.current = LAST_INTERACTION_SOURCE.vitessce;
          setRotationX(pitchDeg);
          setRotationOrbit(yawDeg);
          ngRotPushAtRef.current = performance.now();

          // // Test to verify rotation from NG to Vitessce and back to NG
          // requestAnimationFrame(() => {
          //   requestAnimationFrame(() => {
          //     // Recreate the Vitessce quaternion from the angles we *just set*
          //     const qVitJustSet = eulerToQuaternion(deg2rad(pitchDeg), deg2rad(yawDeg), 0);
          //     // Convert to NG frame (apply Y-up)
          //     const qNgExpected = multiplyQuat(Q_Y_UP, qVitJustSet);
          //     // What NG is currently holding (latest from ref, fallback to local)
          //     const qNgCurrent  = latestViewerStateRef.current?.projectionOrientation
          //  || projectionOrientation;

          //     const dot = quatdotAbs(qNgExpected, qNgCurrent);
          //     console.log('[POST-APPLY] |dot| =', dot.toFixed(6));
          //   });
          // });
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
    if (value) {
      const id = String(value);
      const selectedCellIds = [id];
      const alreadySelectedId = cellSetSelection?.flat()?.some(sel => sel.includes(id));
      // Don't create new selection from same ids
      if (alreadySelectedId) {
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
    const { current } = latestViewerStateRef;
    const nextSegments = Object.keys(cellColorMapping);
    const prevLayer = current?.layers?.[0] || {};
    const prevSegments = prevLayer.segments || [];
    const { projectionScale, projectionOrientation, position } = current;

    // Did Vitessce coords change vs the *previous* render?
    const rotChangedNow = !nearEq(spatialRotationX, prevCoordsRef.current.rx, ROTATION_EPS)
        || !nearEq(spatialRotationY, prevCoordsRef.current.ry, ROTATION_EPS)
        || !nearEq(spatialRotationZ, prevCoordsRef.current.rz, ROTATION_EPS)
        || !nearEq(spatialRotationOrbit, prevCoordsRef.current.orbit, ROTATION_EPS);

    const zoomChangedNow = !nearEq(spatialZoom, prevCoordsRef.current.zoom, ROTATION_EPS);

    const transChangedNow = !nearEq(spatialTargetX, prevCoordsRef.current.tx, ROTATION_EPS)
      || !nearEq(spatialTargetY, prevCoordsRef.current.ty, ROTATION_EPS);

    let nextProjectionScale = projectionScale;
    let nextPosition = position;

    // ** --- Zoom handling --- ** //
    if (typeof spatialZoom === 'number'
        && initialRenderCalibratorRef.current
        && lastInteractionSource.current !== LAST_INTERACTION_SOURCE.neuroglancer
        && zoomChangedNow) {
      const s = initialRenderCalibratorRef.current.vitToNgZoom(spatialZoom);
      if (Number.isFinite(s) && s > 0) {
        nextProjectionScale = s;
      }
    }

    // ** --- Translation handling --- ** //
    const [ox, oy, oz] = translationOffsetRef.current;
    const [px = 0, py = 0, pz = (current.position?.[2] ?? oz)] = current.position || [];
    const hasVitessceSpatialTarget = Number.isFinite(spatialTargetX)
       && Number.isFinite(spatialTargetY);
    if (hasVitessceSpatialTarget
        && lastInteractionSource.current !== LAST_INTERACTION_SOURCE.neuroglancer
        && transChangedNow) {
      const nx = spatialTargetX + ox; // Vitessce → NG
      const ny = spatialTargetY + oy;
      if (Math.abs(nx - px) > TARGET_EPS || Math.abs(ny - py) > TARGET_EPS) {
        nextPosition = [nx, ny, pz];
      }
    }

    // ** --- Orientation/Rotation handling --- ** //
    const vitessceRotationRaw = eulerToQuaternion(
      deg2rad(spatialRotationX ?? 0),
      deg2rad(spatialRotationOrbit ?? 0),
      deg2rad(spatialRotationZ ?? 0),
    );

    // Apply Y-up to have both views with same axis-direction (xy)
    const vitessceRotation = multiplyQuat(Q_Y_UP, vitessceRotationRaw);

    // // Round-trip check: NG -> Vit (remove Y-UP)
    // const qVitBack = multiplyQuat(conjQuat(Q_Y_UP), vitessceRotation);
    // const dotVitLoop = quatdotAbs(qVitBack, vitessceRotationRaw);

    // // Expect ~1 (± sign OK)
    // const fmt = (v) => Array.isArray(v) ? v.map(n => Number(n).toFixed(6)) : v;
    // console.log('[CHK Vit→NG→Vit] |dot| =', dotVitLoop.toFixed(6),
    //             ' qVitRaw=', fmt(vitessceRotationRaw),
    //             ' qVitBack=', fmt(qVitBack));

    // // Cross-view check: does the NG orientation we're about to send match our Vit -> NG?
    // const dotVsNg = quatdotAbs(vitessceRotation, projectionOrientation);
    // console.log('[CHK Vit→NG vs current NG] |dot| =', dotVsNg.toFixed(6));

    // If NG quat != Vitessce quat on first render, push Vitessce once.
    const shouldForceInitialVitPush = !initialRotationPushedRef.current
      && valueGreaterThanEpsilon(vitessceRotation, projectionOrientation, ROTATION_EPS);

    // Use explicit source if set; otherwise infer Vitessce when coords changed.
    const ngFresh = (performance.now() - (ngRotPushAtRef.current || 0)) < NG_ROT_COOLDOWN_MS;

    const changedNowOrIInitialVitPush = rotChangedNow
      || zoomChangedNow || transChangedNow || shouldForceInitialVitPush;

    const src = ngFresh ? LAST_INTERACTION_SOURCE.neuroglancer
      : (lastInteractionSource.current
      ?? (changedNowOrIInitialVitPush ? LAST_INTERACTION_SOURCE.vitessce : null));


    let nextOrientation = projectionOrientation; // start from NG's current quat

    // console.log('[ORIENT]',
    //   'srcResolved=', src,
    //   'lastSource=', lastInteractionSource.current,
    //   'dotLoop=', dotVitLoop.toFixed(6),
    //   'dotCross=', dotVsNg.toFixed(6)
    // );

    // console.log('[ORIENT Q]',
    //   'qVitRaw=', fmt(vitessceRotationRaw), // Vit frame (pre Y-up)
    //   'qVitToNg=', fmt(vitessceRotation), // NG frame (post Y-up)
    //   'qNgCurr=', fmt(projectionOrientation),
    // );


    if (src === LAST_INTERACTION_SOURCE.vitessce) {
      // Only push if Vitessce rotation actually changed since last time.
      const rotDiffers = valueGreaterThanEpsilon(
        vitessceRotation,
        projectionOrientation,
        ROTATION_EPS,
      );

      if (rotDiffers) {
        nextOrientation = vitessceRotation;
        lastVitessceRotationRef.current = {
          x: spatialRotationX,
          y: spatialRotationY,
          z: spatialRotationZ,
          orbit: spatialRotationOrbit,
        };
        initialRotationPushedRef.current = true;
        // Re-anchor NG -> Vitessce translation once we commit the initial orientation,
        // the center shows a right translated image
        const [cx = 0, cy = 0,
          cz = (nextPosition?.[2] ?? current.position?.[2] ?? 0),
        ] = nextPosition
          || current.position || [];
        const tX = Number.isFinite(spatialTargetX) ? spatialTargetX : 0;
        const tY = Number.isFinite(spatialTargetY) ? spatialTargetY : 0;
        translationOffsetRef.current = [cx - tX, cy - tY, cz];
      }
      // else {
      //   // No real Vitessce rotation change → do not overwrite NG's quat.
      //   console.log('Vitessce → NG: no rotation change, keep NG quat');
      // }
      if (lastInteractionSource.current === LAST_INTERACTION_SOURCE.vitessce) {
        lastInteractionSource.current = null;
      }
    } else if (src === LAST_INTERACTION_SOURCE.neuroglancer) {
      nextOrientation = lastNgPushOrientationRef.current ?? projectionOrientation;
      lastInteractionSource.current = null;
    }

    const newLayer0 = {
      ...prevLayer,
      segments: nextSegments,
      segmentColors: cellColorMapping,
    };


    const updated = {
      ...current,
      projectionScale: nextProjectionScale,
      projectionOrientation: nextOrientation,
      position: nextPosition,
      layers: prevSegments.length === 0 ? [newLayer0, ...(current?.layers?.slice(1)
        || [])] : current?.layers,
    };

    latestViewerStateRef.current = updated;

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

  const handleLayerLoadingChange = useCallback((isLoaded) => {
    setIsLayersLoaded(isLoaded);
  }, []);

  // TODO: if all cells are deselected, a black view is shown, rather we want to show empty NG view?
  // if (!cellColorMapping || Object.keys(cellColorMapping).length === 0) {
  //   return;
  // }

  return (
    <TitleInfo
      title={title}
      helpText={helpText}
      isSpatial
      theme={theme}
      closeButtonVisible={closeButtonVisible}
      downloadButtonVisible={downloadButtonVisible}
      removeGridComponent={removeGridComponent}
      isReady={isLayersLoaded}
      withPadding={false}
    >
      <NeuroglancerComp
        classes={classes}
        onSegmentClick={onSegmentClick}
        onSelectHoveredCoords={onSegmentHighlight}
        viewerState={derivedViewerState}
        cellColorMapping={cellColorMapping}
        setViewerState={handleStateUpdate}
        onLayerLoadingChange={handleLayerLoadingChange}
      />
    </TitleInfo>
  );
}
