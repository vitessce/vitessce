import Ajv from 'ajv';
// TODO: We already have this, so an extra install seems unnecessary.
// eslint-disable-next-line import/no-extraneous-dependencies
import expect from 'expect';

/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */

describe('schemas', () => {
  ['cells', 'molecules', 'genes'].forEach((type) => {
    const schemaFile = `${type}.schema.json`;
    describe(schemaFile, () => {
      const schema = require(`./${schemaFile}`);
      const validate = new Ajv().compile(schema);

      const goodFixture = `${type}.good.json`;
      it(`handles ${goodFixture}`, () => {
        const data = require(`./fixtures/${goodFixture}`);
        const valid = validate(data);
        if (!valid) { console.warn(validate.errors); }
        expect(valid).toEqual(true);
      });

      const [badFixture, badMessage] = [`${type}.bad.json`, `${type}.bad.message.json`];
      it(`handles ${badFixture}`, () => {
        const data = require(`./fixtures/${badFixture}`);
        const message = require(`./fixtures/${badMessage}`);
        const valid = validate(data);
        expect(valid).toEqual(false);
        expect(validate.errors).toEqual(message);
      });
    });
  });
});
