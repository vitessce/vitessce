import Ajv from 'ajv';
import expect from 'expect'

describe('cells.schema.json', ()=>{
  var schema = require('./cells.schema.json');
  var validate = new Ajv().compile(schema);
  var fixtures = ['good.cells.json'];
  fixtures.forEach((f) => {
    it(`handles ${f}`, ()=>{
      var data = require(`./fixtures/${f}`);
      var valid = validate(data);
      if (!valid) { console.warn(validate.errors); }
      expect(valid).toEqual(true);
    })
  })
});
