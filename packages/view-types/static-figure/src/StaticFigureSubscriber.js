import React, { useState } from 'react';
import {
  TitleInfo,
  useCoordination,
  registerPluginViewType,
  registerPluginFileType,
  registerPluginCoordinationType,
  AbstractTwoStepLoader,
  LoaderResult,
  useMultiFigures,
  useLoaders,
  useUrls,
  useReady,
} from '@vitessce/vit-s';
import {
  FileType,
  DataType,
  ViewType,
  COMPONENT_COORDINATION_TYPES,
} from '@vitessce/constants-internal';
import { makeStyles } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import clsx from 'clsx';


const useStyles = makeStyles(() => ({
  container: {
    height: '100%',
    position: 'relative',
  },
  grid: {
    height: '100%',
    display: 'grid',
    gridTemplateRows: '1fr min-content',
  },
  image: {
    width: '100%',
    display: 'block',
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
  },
  button: {
    position: 'absolute',
    bottom: 0,
  },
  buttonLeft: {
    left: 0,
  },
  buttonRight: {
    right: 0,
  },
  caption: {
    textAlign: 'center !important',
    width: '80%',
    marginLeft: '10%',
    paddingTop: '10px',
  },
}));

export function StaticFigure(props) {
  const {
    figureScopes,
    figureData,
  } = props;

  const [index, setIndex] = useState(0);

  const isMulti = figureScopes.length > 1;

  function handleLeft() {
    setIndex(prev => Math.max(0, prev - 1));
  }
  function handleRight() {
    setIndex(prev => Math.min(isMulti ? figureScopes.length - 1 : 0, prev + 1));
  }

  const classes = useStyles();

  const selectedFigure = figureData[figureScopes[index]];

  return (
    <div className={classes.container}>
      <div className={classes.grid}>
        <div title={selectedFigure?.caption} style={{ backgroundImage: `url(${selectedFigure?.url})` }} className={classes.image} />
        <div className={classes.caption}>
          {selectedFigure?.caption}
        </div>
      </div>
      {isMulti && index !== 0 ? (
        <IconButton className={clsx(classes.button, classes.buttonLeft)} onClick={handleLeft}>
          <ChevronLeft />
        </IconButton>
      ) : null}
      {isMulti && index !== (figureScopes.length - 1) ? (
        <IconButton className={clsx(classes.button, classes.buttonRight)} onClick={handleRight}>
          <ChevronRight />
        </IconButton>
      ) : null}
    </div>
  );
}

/**
 * A subscriber component for the status component,
 * which renders hovered cell/gene/molecule information
 * as well as schema validation and data loading errors.
 * @param {object} props
 * @param {string} props.theme The current theme name.
 * @param {object} props.coordinationScopes The mapping from coordination types to coordination
 * scopes.
 * @param {function} props.removeGridComponent The callback function to pass to TitleInfo,
 * to call when the component has been removed from the grid.
 * @param {string} props.title The component title.
 */
export function StaticFigureSubscriber(props) {
  const {
    coordinationScopes,
    removeGridComponent,
    theme,
    title = 'Figure',
  } = props;

  const loaders = useLoaders();

  // Get "props" from the coordination space.
  const [{
    dataset,
  }] = useCoordination(COMPONENT_COORDINATION_TYPES[ViewType.STATIC_FIGURE], coordinationScopes);

  const [urls, addUrl] = useUrls(loaders, dataset);

  // Get figures from datasets[].files[]
  // to enable {{ base_url }} placeholder support and downloading.
  const [figureData, figureStatus] = useMultiFigures(
    coordinationScopes, loaders, dataset, addUrl,
  );

  const figureScopes = Array.isArray(coordinationScopes.figure)
    ? coordinationScopes.figure
    : [coordinationScopes.figure];

  const isReady = useReady([
    figureStatus,
  ]);

  return (
    <TitleInfo
      title={title}
      theme={theme}
      removeGridComponent={removeGridComponent}
      isReady={isReady}
      urls={urls}
    >
      <StaticFigure figureScopes={figureScopes} figureData={figureData} />
    </TitleInfo>
  );
}

export default class FigureJpgLoader extends AbstractTwoStepLoader {
  async load() {
    const { url, options } = this;
    const { caption } = options || {};
    const result = { url, caption };
    return Promise.resolve(new LoaderResult(
      result,
      url,
    ));
  }
}

class AbstractSource {
  // No-op
}


export function register() {
  registerPluginFileType(
    FileType.FIGURE_JPG,
    DataType.FIGURE,
    FigureJpgLoader,
    AbstractSource,
  );
  registerPluginViewType(
    ViewType.STATIC_FIGURE,
    StaticFigureSubscriber,
    COMPONENT_COORDINATION_TYPES[ViewType.STATIC_FIGURE],
  );
  registerPluginCoordinationType(
    'figure',
    null,
  );
}
