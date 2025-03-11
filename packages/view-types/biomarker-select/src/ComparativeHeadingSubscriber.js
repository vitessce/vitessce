import React, { useCallback } from 'react';
import {
  useCoordination,
} from '@vitessce/vit-s';
import { ViewType, COMPONENT_COORDINATION_TYPES } from '@vitessce/constants-internal';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  buttonContainer: {
    position: 'absolute',
    right: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    height: '100%',
  },
  headingContainer: {
    backgroundColor: theme.palette.primaryBackground,
  },
  headingSectionContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    position: 'relative',
  },
  headingText: {
    margin: 0,
    color: theme.palette.primaryForeground,
  },
}));

export function ComparativeHeadingSubscriber(props) {
  const {
    coordinationScopes,
  } = props;

  const [{
    sampleSetSelection,
    featureSelection,
  }, {
    setSampleSetSelection,
    // TODO: buttons for modification of featureSelection
    // setFeatureSelection,
  }] = useCoordination(
    COMPONENT_COORDINATION_TYPES[ViewType.COMPARATIVE_HEADING],
    coordinationScopes,
  );

  const classes = useStyles();

  const swapSampleSets = useCallback(() => {
    if (sampleSetSelection?.length === 2) {
      setSampleSetSelection([
        sampleSetSelection[1],
        sampleSetSelection[0],
      ]);
    }
  }, [sampleSetSelection, setSampleSetSelection]);

  return (
    <div className={classes.headingContainer}>
      {sampleSetSelection && sampleSetSelection.length === 2 ? (
        <div className={classes.headingSectionContainer}>
          <div style={{ width: '45%' }}><h2 className={classes.headingText}>{sampleSetSelection?.[0]?.at(-1)}</h2></div>
          <div style={{ width: '5%' }}><h2 className={classes.headingText} style={{ textAlign: 'right' }}>vs.&nbsp;</h2></div>
          <div style={{ width: '50%' }}><h2 className={classes.headingText}>{sampleSetSelection?.[1]?.at(-1)}</h2></div>
          <div className={classes.buttonContainer}>
            <button onClick={swapSampleSets} type="button">Swap</button>
          </div>
        </div>
      ) : null}
      {featureSelection && featureSelection.length > 0 ? (
        <div className={classes.headingSectionContainer}>
          <div><h3 className={classes.headingText}>Selected Biomarkers:&nbsp;</h3></div>
          {featureSelection?.map((featureName, i) => (
            <div>
              <h3 className={classes.headingText}>
                {featureName}
                {i < featureSelection.length - 1 ? (<span>,&nbsp;</span>) : null}
              </h3>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
