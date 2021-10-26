/* eslint-disable camelcase */
import Ajv from 'ajv';
import configSchema0_1_0 from '../schemas/config-0.1.0.schema.json';
import configSchema1_0_0 from '../schemas/config-1.0.0.schema.json';
import configSchema1_0_1 from '../schemas/config-1.0.1.schema.json';
import configSchema1_0_2 from '../schemas/config-1.0.2.schema.json';
import configSchema1_0_3 from '../schemas/config-1.0.3.schema.json';
import configSchema1_0_4 from '../schemas/config-1.0.4.schema.json';
import configSchema1_0_5 from '../schemas/config-1.0.5.schema.json';
import cellSetsSchema from '../schemas/cell-sets.schema.json';
import rasterSchema from '../schemas/raster.schema.json';
import {
  upgradeFrom0_1_0,
  upgradeFrom1_0_0,
  upgradeFrom1_0_1,
  upgradeFrom1_0_2,
  upgradeFrom1_0_3,
  upgradeFrom1_0_4,
} from './view-config-upgraders';

/**
 * Mapping from view config versions to view config schemas and upgrade functions.
 * Add a new schema and upgrade function here when bumping the view config version.
 * The latest view config version should always have a null value instead of an upgrade function.
 */
export const LATEST_VERSION = '1.0.5';
export const SCHEMA_HANDLERS = {
  '0.1.0': [new Ajv().compile(configSchema0_1_0), upgradeFrom0_1_0],
  '1.0.0': [new Ajv().addSchema(cellSetsSchema).addSchema(rasterSchema).compile(configSchema1_0_0), upgradeFrom1_0_0],
  '1.0.1': [new Ajv().addSchema(cellSetsSchema).addSchema(rasterSchema).compile(configSchema1_0_1), upgradeFrom1_0_1],
  '1.0.2': [new Ajv().addSchema(cellSetsSchema).addSchema(rasterSchema).compile(configSchema1_0_2), upgradeFrom1_0_2],
  '1.0.3': [new Ajv().addSchema(cellSetsSchema).addSchema(rasterSchema).compile(configSchema1_0_3), upgradeFrom1_0_3],
  '1.0.4': [new Ajv().addSchema(cellSetsSchema).addSchema(rasterSchema).compile(configSchema1_0_4), upgradeFrom1_0_4],
  '1.0.5': [new Ajv().addSchema(cellSetsSchema).addSchema(rasterSchema).compile(configSchema1_0_5), null],
};
