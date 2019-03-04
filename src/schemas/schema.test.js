import Ajv from 'ajv';
// TODO: We already have this, so an extra install seems unnecessary.
// eslint-disable-next-line import/no-extraneous-dependencies
import expect from 'expect';

/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */

describe('schemas', () => {
  describe('cells.schema.json', () => {
    const schema = require('./cells.schema.json');
    const validate = new Ajv().compile(schema);
    const goodFixtures = ['good.cells.json'];
    goodFixtures.forEach((f) => {
      it(`handles ${f}`, () => {
        const data = require(`./fixtures/${f}`);
        const valid = validate(data);
        if (!valid) { console.warn(validate.errors); }
        expect(valid).toEqual(true);
      });
    });

    const badFixtures = [['bad.cells.tsne.json', 'bad.cells.tsne.message.json']];
    badFixtures.forEach(([input, output]) => {
      it(`handles ${input}`, () => {
        const data = require(`./fixtures/${input}`);
        const message = require(`./fixtures/${output}`);
        const valid = validate(data);
        expect(valid).toEqual(false);
        expect(validate.errors).toEqual(message);
      });
    });
  });

  describe('molecules.schema.json', () => {
    const schema = require('./molecules.schema.json');
    const validate = new Ajv().compile(schema);
    const goodFixtures = ['good.molecules.json'];
    goodFixtures.forEach((f) => {
      it(`handles ${f}`, () => {
        const data = require(`./fixtures/${f}`);
        const valid = validate(data);
        if (!valid) { console.warn(validate.errors); }
        expect(valid).toEqual(true);
      });
    });

    const badFixtures = [['bad.molecules.json', 'bad.molecules.message.json']];
    badFixtures.forEach(([input, output]) => {
      it(`handles ${input}`, () => {
        const data = require(`./fixtures/${input}`);
        const message = require(`./fixtures/${output}`);
        const valid = validate(data);
        expect(valid).toEqual(false);
        expect(validate.errors).toEqual(message);
      });
    });
  });
});
