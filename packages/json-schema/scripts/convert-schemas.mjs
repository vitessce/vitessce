import fs from 'node:fs';
import { join } from 'node:path';
import { JSDOM, VirtualConsole } from 'jsdom';
import { zodToJsonSchema } from 'zod-to-json-schema';
// We need this explicit import because we want to import from the development package,
// and Node does not use the PNPM publishConfig property like a consumer would
// be able to do with the production package.
import { VERSIONED_CONFIG_SCHEMAS, buildConfigSchema } from '@vitessce/schemas/dist/index.js';


const distDir = join('dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}
Object.entries(VERSIONED_CONFIG_SCHEMAS).forEach(([version, schema]) => {
  const jsonPath = join(distDir, `config-${version}.schema.json`);
  const jsonSchema = zodToJsonSchema(schema, `config-${version}`);
  fs.writeFileSync(jsonPath, JSON.stringify(jsonSchema, null, 2));
});

// The base plugins import view type components,
// some of which access window and document at import time.
const { window } = new JSDOM('', { virtualConsole: new VirtualConsole() });
globalThis.window = window;
globalThis.document = window.document;

const {
  baseFileTypes,
  baseJointFileTypes,
  baseCoordinationTypes,
  baseViewTypes,
} = await import('@vitessce/all/dist-tsc/base-plugins.js');

// Same schema that <Vitessce/> uses to validate configs
// when no additional plugins are provided.
const basePluginsSchema = buildConfigSchema(
  baseFileTypes,
  baseJointFileTypes,
  baseCoordinationTypes,
  baseViewTypes,
);
const latestVersion = basePluginsSchema.shape.version.value;
const basePluginsName = `config-${latestVersion}.base-plugins`;
fs.writeFileSync(
  join(distDir, `${basePluginsName}.schema.json`),
  JSON.stringify(zodToJsonSchema(basePluginsSchema, basePluginsName), null, 2),
);
