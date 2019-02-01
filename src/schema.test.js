import Ajv from 'ajv';
import expect from 'expect'

describe('Schema', ()=>{
  var schema = require('./schema.json');
  var validate = new Ajv().compile(schema);
  var fixtures = ['AddCells', 'AddMolecules', 'AddRGBImagery', 'AddBWImagery'];
  fixtures.forEach((f) => {
    it(`handles ${f}`, ()=>{
      var data = require(`./api-fixtures/${f}.json`);
      var valid = validate(data);
      if (!valid) { console.warn(validate.errors); }
      expect(valid).toEqual(true);
    })
  })
});
