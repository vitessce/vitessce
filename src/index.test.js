import Ajv from 'ajv';

var validate = new Ajv().compile({});

it('works', () => {
  expect(validate({})).toEqual(true);
});
