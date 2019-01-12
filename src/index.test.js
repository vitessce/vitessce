import Ajv from 'ajv';

it('ajv works', async (done)=>{
  var schema = require('./schema.json');
  var validate = new Ajv().compile(schema);
  var good_data = require('./api-fixtures/good.json');
  var bad_data = require('./api-fixtures/bad.json');
  var expect_true = validate(good_data);
  if (!expect_true) { console.warn(validate.errors); }
  expect(expect_true).toEqual(true);
  expect(validate(bad_data)).toEqual(false);
  done();
});
