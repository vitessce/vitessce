import fs from 'node:fs';
import { join } from 'node:path';
import { zodToJsonSchema } from 'zod-to-json-schema';
// We need this explicit import because we want to import from the development package,
// and Node does not use the PNPM publishConfig property like a consumer would
// be able to do with the production package.
import { VERSIONED_CONFIG_SCHEMAS } from '@vitessce/schemas/dist/index.js';


const distDir = join('dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}
Object.entries(VERSIONED_CONFIG_SCHEMAS).forEach(([version, schema]) => {
  const jsonPath = join(distDir, `config-${version}.schema.json`);
  const jsonSchema = zodToJsonSchema(schema, `config-${version}`);
  fs.writeFileSync(jsonPath, JSON.stringify(jsonSchema, null, 2));
});
