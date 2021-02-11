/* eslint-disable dot-notation */
import React, { useEffect } from 'react';
import Grid from '@material-ui/core/Grid';
import TitleInfo from '../TitleInfo';
import RasterLayerController from './RasterLayerController';
import VectorLayerController from './VectorLayerController';
import ImageAddButton from './ImageAddButton';
import { useReady } from '../hooks';
import { useCellsData, useMoleculesData, useRasterData } from '../data-hooks';
import { useCoordination, useLoaders } from '../../app/state/hooks';
import { COMPONENT_COORDINATION_TYPES } from '../../app/state/coordination';
import { initializeLayerChannels } from '../spatial/utils';
import { DEFAULT_RASTER_LAYER_PROPS } from '../spatial/constants';

const LAYER_CONTROLLER_DATA_TYPES = ['raster'];

/**
 * A subscriber component for the spatial layer controller.
 * @param {object} props
 * @param {string} props.theme The current theme name.
 * @param {object} props.coordinationScopes The mapping from coordination types to coordination
 * scopes.
 * @param {function} props.removeGridComponent The callback function to pass to TitleInfo,
 * to call when the component has been removed from the grid.
 * @param {boolean} props.initializeSpatialRasterLayers Should the coordination
 * value be automatically initialized based on the data?
 * @param {boolean} props.initializeSpatialCellsLayers Should the coordination
 * value be automatically initialized based on the data?
 * @param {boolean} props.initializeSpatialMoleculesLayers Should the coordination
 * value be automatically initialized based on the data?
 * @param {string} props.title The component title.
 */
function LayerControllerSubscriber(props) {
  const {
    coordinationScopes,
    removeGridComponent,
    theme,
    initializeSpatialCellsLayers = true,
    initializeSpatialMoleculesLayers = true,
    title = 'Spatial Layers',
  } = props;

  const loaders = useLoaders();

  // Get "props" from the coordination space.
  const [{
    dataset,
    spatialRasterLayers: rasterLayers,
    spatialCellsLayers: cellsLayers,
    spatialMoleculesLayers: moleculesLayers,
  }, {
    setSpatialRasterLayers: setRasterLayers,
    setSpatialCellsLayers: setCellsLayers,
    setSpatialMoleculesLayers: setMoleculesLayers,
  }] = useCoordination(COMPONENT_COORDINATION_TYPES.layerController, coordinationScopes);

  const [isReady, setItemIsReady, resetReadyItems] = useReady(
    LAYER_CONTROLLER_DATA_TYPES,
  );

  // Reset loader progress when the dataset has changed.
  useEffect(() => {
    resetReadyItems();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaders, dataset]);

  // Get data from loaders using the data hooks.
  // eslint-disable-next-line no-unused-vars
  const [raster, imageLayerLoaders, imageLayerMeta] = useRasterData(
    loaders, dataset, setItemIsReady, () => {}, false,
  );

  useCellsData(
    loaders, dataset, setItemIsReady, () => {}, false,
    { setSpatialCellsLayers: setCellsLayers },
    { initializeSpatialCellsLayers },
  );
  useMoleculesData(
    loaders, dataset, setItemIsReady, () => {}, false,
    { setSpatialMoleculesLayers: setMoleculesLayers },
    { initializeSpatialMoleculesLayers },
  );

  const handleImageAdd = async (index) => {
    const loader = imageLayerLoaders[index];
    const newChannels = await initializeLayerChannels(loader);
    const newLayer = {
      index,
      ...DEFAULT_RASTER_LAYER_PROPS,
      channels: newChannels,
    };
    const newLayers = [...rasterLayers, newLayer];
    setRasterLayers(newLayers);
  };

  function handleCellsLayerChange(newLayer, i) {
    const newLayers = [...cellsLayers];
    newLayers[i] = newLayer;
    setCellsLayers(newLayers);
  }

  function handleMoleculesLayerChange(newLayer, i) {
    const newLayers = [...moleculesLayers];
    newLayers[i] = newLayer;
    setMoleculesLayers(newLayers);
  }

  function handleRasterLayerChange(newLayer, i) {
    const newLayers = [...rasterLayers];
    newLayers[i] = newLayer;
    setRasterLayers(newLayers);
  }

  function handleRasterLayerRemove(i) {
    const newLayers = [...rasterLayers];
    newLayers.splice(i, 1);
    setRasterLayers(newLayers);
  }

  return (
    <TitleInfo
      title={title}
      isScroll
      removeGridComponent={removeGridComponent}
      theme={theme}
      isReady={isReady}
    >
      <div className="layer-controller-container">
        {moleculesLayers && moleculesLayers.map((layer, i) => (
          <VectorLayerController
            key={`${dataset}-molecules`}
            label="Molecules"
            layerType="molecules"
            layer={layer}
            handleLayerChange={v => handleMoleculesLayerChange(v, i)}
          />
        ))}
        {cellsLayers && cellsLayers.map((layer, i) => (
          <VectorLayerController
            key={`${dataset}-cells`}
            label="Cell Segmentations"
            layerType="cells"
            layer={layer}
            handleLayerChange={v => handleCellsLayerChange(v, i)}
          />
        ))}
        {rasterLayers && rasterLayers.map((layer, i) => {
          const { index } = layer;
          const loader = imageLayerLoaders[index];
          const layerMeta = imageLayerMeta[index];
          return (loader && layerMeta ? (
            // eslint-disable-next-line react/no-array-index-key
            <Grid key={`${dataset}-raster-${index}-${i}`} item style={{ marginTop: '10px' }}>
              <RasterLayerController
                name={layerMeta.name}
                rasterType={layerMeta.type}
                layer={layer}
                loader={loader}
                theme={theme}
                handleLayerChange={v => handleRasterLayerChange(v, i)}
                handleLayerRemove={() => handleRasterLayerRemove(i)}
              />
            </Grid>
          ) : null);
        })}
        <Grid item>
          <ImageAddButton
            imageOptions={imageLayerMeta}
            handleImageAdd={handleImageAdd}
          />
        </Grid>
      </div>
    </TitleInfo>
  );
}

export default LayerControllerSubscriber;
