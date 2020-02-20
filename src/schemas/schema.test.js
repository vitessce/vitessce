import Ajv from 'ajv';
import expect from 'expect';

/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */

describe('schemas', () => {
  [
    'cells',
    'clusters',
    'factors',
    'genes',
    'images',
    'molecules',
    'neighborhoods',
    'dataset',
    'hierarchical-sets',
    'raster',
  ].forEach((type) => {
    const schemaFile = `${type}.schema.json`;
    describe(schemaFile, () => {
      const schema = require(`./${schemaFile}`);
      const validate = new Ajv().compile(schema);

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
