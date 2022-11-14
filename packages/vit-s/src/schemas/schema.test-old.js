// TODO(monorepo)
/*
import Ajv from 'ajv';
import obsSetsSchema from './obsSets.schema';
import rasterSchema from './raster.schema';
describe('schemas', () => {
  [
    'config-1.0.1',
    'obsSets',
    'obsSetsTabular',
    'raster',
  ].forEach((type) => {
    const schemaFile = `${type}.schema.json`;
    describe(schemaFile, async () => {
      const schema = await import(`./${schemaFile}`);
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
        'good', 'bad', 'bad.message',
      ].map(stem => `${type}.${stem}.json`);

      it(`passes ${goodFixture}`, async () => {
        const data = await import(`./fixtures/${goodFixture}`);
        const valid = validate(data);
        if (!valid) { console.warn(validate.errors); }
        expect(valid).toEqual(true);
      });

      it(`fails ${badFixture}`, async () => {
        const data = await import(`./fixtures/${badFixture}`);
        const message = await import(`./fixtures/${badMessage}`);
        const valid = validate(data);
        expect(valid).toEqual(false);
        expect(validate.errors).toEqual(message);
      });
    });
  });
});
*/
