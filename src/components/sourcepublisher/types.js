/* eslint-disable */
import {
  CELLS_ADD, CLUSTERS_ADD, FACTORS_ADD, GENES_ADD, MOLECULES_ADD, NEIGHBORHOODS_ADD,
  RASTER_ADD, CELL_SETS_ADD,
} from '../../events';

import { JsonLoader, ZarrLoader } from './loaders';

import cellsSchema from '../../schemas/cells.schema.json';
import clustersSchema from '../../schemas/clusters.schema.json';
import factorsSchema from '../../schemas/factors.schema.json';
import genesSchema from '../../schemas/genes.schema.json';
import moleculesSchema from '../../schemas/molecules.schema.json';
import neighborhoodsSchema from '../../schemas/neighborhoods.schema.json';
import rasterSchema from '../../schemas/raster.schema.json';
import cellSetsSchema from '../../schemas/cell-sets.schema.json';

export const typeToSchema = {
  CELLS: cellsSchema,
  CLUSTERS: clustersSchema,
  FACTORS: factorsSchema,
  GENES: genesSchema,
  MOLECULES: moleculesSchema,
  NEIGHBORHOODS: neighborhoodsSchema,
  RASTER: rasterSchema,
  'CELL-SETS': cellSetsSchema,
};

export const typeToEvent = {
  CELLS: CELLS_ADD,
  CLUSTERS: CLUSTERS_ADD,
  FACTORS: FACTORS_ADD,
  GENES: GENES_ADD,
  MOLECULES: MOLECULES_ADD,
  NEIGHBORHOODS: NEIGHBORHOODS_ADD,
  RASTER: RASTER_ADD,
  'CELL-SETS': CELL_SETS_ADD,
};

export const extensionToLoader = {
    '.clusters.zarr': ZarrLoader,
    '.json': JsonLoader,
};