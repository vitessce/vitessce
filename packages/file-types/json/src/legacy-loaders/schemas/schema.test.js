import Ajv from 'ajv';
import { obsSetsSchema, rasterSchema } from '@vitessce/vit-s';

/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */

describe('schemas', () => {
  ['cells', 'clusters', 'genes', 'molecules', 'neighborhoods'].forEach((type) => {
    const schemaFile = `${type}.schema.json`;
    describe(schemaFile, () => {
      const schema = require(`./${schemaFile}`);
      let validate;
      if (type === 'config-1.0.1') {
        const obsSets = obsSetsSchema;
        const raster = rasterSchema;
        validate = new Ajv()
          .addSchema(obsSets)
          .addSchema(raster)
          .compile(schema);
      } else {
        validate = new Ajv().compile(schema);
      }

      const [goodFixture, badFixture, badMessage] = [
        'good',
        'bad',
        'bad.message',
      ].map(stem => `${type}.${stem}.json`);

      it(`passes ${goodFixture}`, () => {
        const data = require(`./fixtures/${goodFixture}`);
        const valid = validate(data);
        if (!valid) {
          console.warn(validate.errors);
        }
        expect(valid).toEqual(true);
      });

      it(`fails ${badFixture}`, () => {
        const data = require(`./fixtures/${badFixture}`);
        const message = require(`./fixtures/${badMessage}`);
        const valid = validate(data);
        expect(valid).toEqual(false);
        expect(validate.errors).toEqual(message);
      });
    });
  });
});
