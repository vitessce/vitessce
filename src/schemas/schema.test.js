import Ajv from 'ajv';
import expect from 'expect';

/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */

describe('schemas', () => {
  [
    'config',
    'cells',
    'clusters',
    'genes',
    'molecules',
    'neighborhoods',
    'cell-sets',
    'cell-sets-tabular',
    'raster',
  ].forEach((type) => {
    const schemaFile = `${type}.schema.json`;
    describe(schemaFile, () => {
      const schema = require(`./${schemaFile}`);
      let validate;
      if (type === 'config') {
        const cellSets = require('./cell-sets.schema.json');
        const raster = require('./raster.schema.json');
        validate = new Ajv()
          .addSchema(cellSets)
          .addSchema(raster)
          .compile(schema);
      } else {
        validate = new Ajv().compile(schema);
      }

      const [goodFixture, badFixture, badMessage] = [
        'good', 'bad', 'bad.message',
      ].map(stem => `${type}.${stem}.json`);

      it(`passes ${goodFixture}`, () => {
        const data = require(`./fixtures/${goodFixture}`);
        const valid = validate(data);
        if (!valid) { console.warn(validate.errors); }
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
