import React, { useMemo } from 'react';
import {
  TitleInfo,
  useCoordination,
  useLoaders,
  useReady,
  useGridItemSize,
  useFeatureAnnotationSelection,
  useFeatureAnnotationKeys,
} from '@vitessce/vit-s';
import { v4 as uuidv4 } from 'uuid';
import { ViewType, COMPONENT_COORDINATION_TYPES, ViewHelpMapping } from '@vitessce/constants-internal';
import { useStyles } from './styles.js';
import AnnotationBarPlot from './AnnotationBarPlot.js';
import ExpressionHistogram from './ExpressionHistogram.js';

import { useId } from 'react-aria';
import { TableCell, TableRow } from '@material-ui/core';
import { usePlotOptionsStyles, OptionSelect, OptionsContainer } from '@vitessce/vit-s';
import { capitalize, pluralize as plur } from '@vitessce/utils';

export function FeatureAnnotationBarPlotOptions(props) {
  const {
    setFeatureAnnotationSelection,
    featureType,
    annotations,
    selection
  } = props;

  const featureAnnotationId = useId();

  const classes = usePlotOptionsStyles();

  // Handlers for custom option field changes.
  const handleAnnotationSelectionChange = (event) => {
    const { value } = event.target;
    if (value) {
      setFeatureAnnotationSelection(value);
    }
  };

  if (!annotations) {
    return null;
  }

  return (
    <OptionsContainer>
    <TableRow>
      <TableCell className={classes.labelCell} variant="head" scope="row">
        <label
          htmlFor={`feature-annotation-select-${featureAnnotationId}`}
        >
          {capitalize(plur(featureType, annotations?.length))}
        </label>
      </TableCell>
      <TableCell className={classes.inputCell} variant="body">
        <OptionSelect
          multiple
          className={classes.select}
          value={selection || undefined}
          onChange={handleAnnotationSelectionChange}
          inputProps={{
            id: `feature-annotation-select-${featureAnnotationId}`,
          }}
        >
          {annotations.map(name => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </OptionSelect>
      </TableCell>
    </TableRow>
    </OptionsContainer>
  );
}

function dataToSetSizes(data) {
  if (!data.length) {
    return []
  }
  const sizes = {};
  data.forEach((d) => {
    if (!(d in sizes)) {
      const stringified = String(d)
      sizes[d] = {
        key: uuidv4(),
        name: stringified,
        size: 1,
        color: [255, 0, 255],
        setNamePath: [stringified],
        // used by the AnnotationBarPlot to determine if the bar should be grayed out
        isGrayedOut: true,
      }
    } else {
      sizes[d].size += 1;
    }
  });
  return Object.values(sizes);
}


export function FeatureAnnotationBarPlotSubscriber(props) {
  const {
    coordinationScopes,
    removeGridComponent,
    theme,
    helpText = ViewHelpMapping.FEATURE_ANNOTATION_BAR_PLOT,
  } = props;

  const classes = useStyles();
  const loaders = useLoaders();

  // Get "props" from the coordination space.
  const [{
    dataset,
    featureAnnotationSelection,
    featureType,
  }, {
    setFeatureAnnotationSelection
  }] = useCoordination(
    COMPONENT_COORDINATION_TYPES[ViewType.FEATURE_ANNOTATION_BAR_PLOT],
    coordinationScopes,
  );

  const [width, height, containerRef] = useGridItemSize();

  // Get data from loaders using the data hooks.
  // eslint-disable-next-line no-unused-vars
  const [featureAnnotationData, encodingType, featureAnnotationStatus] = useFeatureAnnotationSelection(
    loaders, dataset, featureAnnotationSelection,
    { featureType },
  );
  const isBarPlot = encodingType === 'categorical' || encodingType.includes('nullable');
  const data = useMemo(() => isBarPlot ? dataToSetSizes(featureAnnotationData) : featureAnnotationData.map(value => ({ value: Number(value) })), [featureAnnotationData])
  console.log(data)
  const [featureAnnotationKeys, featureAnnotationKeysStatus] = useFeatureAnnotationKeys(
    loaders, dataset, { featureType },
  );
  const isReady = useReady([
    featureAnnotationStatus,
    featureAnnotationKeysStatus
  ]);
  return (
    <TitleInfo
      title={`${capitalize(featureType)} Annotation Plots`}
      removeGridComponent={removeGridComponent}
      theme={theme}
      isReady={isReady}
      helpText={helpText}
      options={FeatureAnnotationBarPlotOptions({
        setFeatureAnnotationSelection, featureType, annotations: featureAnnotationKeys, selection: featureAnnotationSelection
      })}
    >
      <div ref={containerRef} className={classes.vegaContainer}>
        {isBarPlot ?
          <AnnotationBarPlot
            data={data}
            theme={theme}
            width={width}
            height={height}
            obsType={featureType}
          /> :
          <ExpressionHistogram
            geneSelection={[featureAnnotationSelection]}
            obsType={featureType}
            data={data}
            theme={theme}
            width={width}
            height={height}
          />
        }
      </div>
    </TitleInfo>
  );
}
