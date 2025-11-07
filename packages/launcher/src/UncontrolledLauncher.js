/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
import React, { useEffect, useState } from 'react';
import { QueryParamProvider } from 'use-query-params';
import { useHashOrQueryParam } from './use-query-or-hash-param.js';
import { ControlledLauncher } from './ControlledLauncher.js';


function UncontrolledLauncherInner(props) {
  const {
    marginTop = 0,
    setIsFooterVisible,
    configUrlParamName = 'config',
    sourceUrlParamName = 'source',
    exampleIdParamName = 'example',
    isEditingParamName = 'edit',
  } = props;
  // Logic for managing state and query/hash params.

  // TODO: make this a fully "controlled" component.
  // Handle URL param getting/setting in a parent component.
  // Set and get URL parameters via the parent.
  // Use an edit=true flag to indicate whether to still show the launcher component despite having non-empty param values.
  // TODO: style the launcher so that the one relevant card is "spotlighted" when there is a non-empty param value.

  // That way, the launcher could eventually be contained within the <Vitessce /> component, e.g., if there is an empty config.

  const [exampleId, setExampleId, exampleIdParamError] = useHashOrQueryParam(exampleIdParamName, undefined, 'string');
  // TODO: support vitessce-link code param
  // const wsCodeValue = useHashOrQueryParam('session', undefined, 'string');
  const [configUrl, setConfigUrl, configUrlParamError] = useHashOrQueryParam(configUrlParamName, undefined, 'string');
  const [sourceUrlArr, setSourceUrlArr, sourceUrlArrParamError] = useHashOrQueryParam(sourceUrlParamName, undefined, 'string-array');
  const [isEditingParam, setIsEditing, isEditingParamError] = useHashOrQueryParam(isEditingParamName, undefined, 'boolean');

  // We need this here since the URL param will not indicate whether local data was dropped.
  // TODO: Store in a cookie/localStorage? Store in a URL param?
  // However if the page changes, we will lose the dropped data anyway...
  const [isUsingLocalFiles, setIsUsingLocalFiles] = useState(false);

  // Check for parameter errors (e.g., both hash+query for same value) and conflicting parameters.
  const hasNoParamError = !exampleIdParamError && !configUrlParamError && !sourceUrlArrParamError && !isEditingParamError;
  const hasNoConflictingParams = (
    (exampleId ? 1 : 0)
    + (configUrl ? 1 : 0)
    + (sourceUrlArr && sourceUrlArr.length > 0 ? 1 : 0)
  ) <= 1;
  const needsStart = !exampleId && !configUrl && (!sourceUrlArr || (Array.isArray(sourceUrlArr) && sourceUrlArr.length === 0));

  const isEditing = !isUsingLocalFiles && (isEditingParam === true || needsStart);

  useEffect(() => {
    if (typeof setIsFooterVisible === 'function') {
      setIsFooterVisible(isEditing);
    }
  }, [isEditing, setIsFooterVisible]);

  return (
    <ControlledLauncher
      isEditing={isEditing}
      setIsEditing={setIsEditing}
      isUsingLocalFiles={isUsingLocalFiles}
      setIsUsingLocalFiles={setIsUsingLocalFiles}
      configUrl={configUrl}
      setConfigUrl={setConfigUrl}
      sourceUrlArr={sourceUrlArr}
      setSourceUrlArr={setSourceUrlArr}
      marginTop={marginTop}
    />
  );
}

/**
 *
 * @param {object} props
 * @param {number} [props.marginTop=0] The distance in pixels from the top of the window.
 * This is used to calculate the height of the Vitessce component (100vh minus marginTop).
 * @param {function} [props.setIsFooterVisible] Callback to set whether the footer is visible.
 * Used to hide the footer when Vitessce component is visible.
 * @returns
 */
export function UncontrolledLauncher(props) {
  const {
    marginTop = 0,
    setIsFooterVisible = null,
    configUrlParamName = 'config',
    sourceUrlParamName = 'source',
    exampleIdParamName = 'example',
    isEditingParamName = 'edit',
    // TODO: Optional mapping from example IDs to their full JSON config, and potentially more values such as PageComponent, Plugins, etc.
    // See https://github.com/vitessce/vitessce/blob/main/sites/demo/src/api.js
    exampleConfigs = null,
  } = props;

  // TODO: wrap in MUI themeProvider?
  return (
    <QueryParamProvider>
      <div style={{ display: 'none' }}>
        {/* TEMP: links for quick testing */}
        <a href="/">Reset</a>&nbsp;
        <a href="/?source=https://storage.googleapis.com/vitessce-demo-data/maynard-2021/151673.sdata.zarr">SpatialData Example</a>&nbsp;
        <a href="/#?source=https://uk1s3.embassy.ebi.ac.uk/idr/zarr/v0.4/idr0062A/6001240.zarr$image.ome-zarr">OME-Zarr Example</a>
      </div>
      <UncontrolledLauncherInner
        marginTop={marginTop}
        setIsFooterVisible={setIsFooterVisible}

        isEditingParamName={isEditingParamName}
        exampleIdParamName={exampleIdParamName}
        configUrlParamName={configUrlParamName}
        sourceUrlParamName={sourceUrlParamName}
      />
    </QueryParamProvider>
  );
}
