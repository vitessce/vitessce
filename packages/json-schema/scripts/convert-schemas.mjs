import fs from 'node:fs';
import { join } from 'node:path';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { VERSIONED_CONFIG_SCHEMAS } from '@vitessce/schemas/dist/index.mjs';


const distDir = join('dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}
Object.entries(VERSIONED_CONFIG_SCHEMAS).forEach(([version, schema]) => {
  const jsonPath = join(distDir, `config-${version}.schema.json`);
  const jsonSchema = zodToJsonSchema(schema, `config-${version}`);
  fs.writeFileSync(jsonPath, JSON.stringify(jsonSchema, null, 2));
});
