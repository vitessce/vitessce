import React, { useMemo } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Legend from './Legend';

export const useStyles = makeStyles(() => ({
  multiLegend: {
    position: 'absolute',
    top: '2px',
    right: '2px',
    zIndex: '100',
    fontSize: '12px !important',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'rgba(215, 215, 215, 0.7)',
    borderRadius: '4px',
    padding: '4px',
    '& svg': {
      height: '15px',
      width: '100px',
    },
  },
}));

export default function MultiLegend(props) {
  const {
    segmentationLayerScopes,
    segmentationLayerCoordination,
    multiExpressionData,
  } = props;

  const classes = useStyles();

  return (
    <div className={classes.multiLegend}>
      {segmentationLayerScopes.map((layerScope) => {
        const {
          spatialLayerVisible: visible,
          spatialChannelColor,
          obsColorEncoding,
          featureValueColormap,
          featureValueColormapRange,
          obsType,
          featureType,
          featureSelection,
        } = segmentationLayerCoordination[0][layerScope];

        return visible ? (
          <Legend
            key={layerScope}
            obsType={obsType}
            featureType={featureType}
            spatialChannelColor={spatialChannelColor}
            obsColorEncoding={obsColorEncoding}
            featureValueColormap={featureValueColormap}
            featureValueColormapRange={featureValueColormapRange}
            featureSelection={featureSelection}

            expressionData={multiExpressionData?.[layerScope]}
          />
        ) : null;
      })}
    </div>
  );
}
