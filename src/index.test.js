import Ajv from 'ajv';

it('ajv works', ()=>{
  var schema = {
    'properties': {
      'a_string': {'type': 'string'},
      'lt_three': { 'type': 'number', 'maximum': 3 }
    }
  };
  var foo = '';
  var validate = new Ajv().compile(schema);
  var good_data = {
    'a_string': 'asdf',
    'lt_three': 2
  };
  var bad_data = {
    'a_string': 4,
    'lt_three': 4
  };
  expect(validate(good_data)).toEqual(true);
  expect(validate(bad_data)).toEqual(false);
});
