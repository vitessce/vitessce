import Ajv from 'ajv';

it('ajv works', async (done)=>{
  var schema = require('./schema.json');
  var validate = new Ajv().compile(schema);
  var good_data = require('./api-fixtures/good.json');
  var bad_data = require('./api-fixtures/bad.json');
  expect(validate(good_data)).toEqual(true);
  expect(validate(bad_data)).toEqual(false);
  done();
});
