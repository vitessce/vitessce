import React, { useState, useCallback, useMemo } from 'react';
import {
  useAsyncFunction,
  useViewConfigStoreApi,
  useSetViewConfig,
  useViewConfig,
  useCoordination,
  useLoaders,
  useComparisonMetadata,
  useMatchingLoader,
  useColumnNameMapping,
  useCoordinationScopes,
} from '@vitessce/vit-s';
import { AsyncFunctionType, ViewType, COMPONENT_COORDINATION_TYPES, DataType } from '@vitessce/constants-internal';
import {
  Button, ButtonGroup, Tooltip, NativeSelect, Grid, TextField,
  Typography, Add as AddIcon, Info as InfoIcon, Autocomplete,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
} from '@vitessce/styles';
import { VariableSizeList } from 'react-window';
import { isEqual } from 'lodash-es';


export function BiomarkerSelect(props) {
    const {
        geneSelection,
        setGeneSelection,
        sampleSetSelection,
        setSampleSetSelection,
    } = props;

    return (
        <p>Biomarker select UI here</p>
    );
}