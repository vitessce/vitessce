import Ajv from 'ajv';
import expect from 'expect'

describe('cells.schema.json', ()=>{
  var schema = require('./cells.schema.json');
  var validate = new Ajv().compile(schema);
  var goodFixtures = ['good.cells.json'];
  goodFixtures.forEach((f) => {
    it(`handles ${f}`, ()=>{
      var data = require(`./fixtures/${f}`);
      var valid = validate(data);
      if (!valid) { console.warn(validate.errors); }
      expect(valid).toEqual(true);
    })
  });

  var badFixtures = [['bad.cells.tsne.json', 'bad.cells.tsne.message.json']];
  badFixtures.forEach(([input, output]) => {
    it(`handles ${input}`, ()=>{
      var data = require(`./fixtures/${input}`);
      var message = require(`./fixtures/${output}`);
      var valid = validate(data);
      expect(valid).toEqual(false);
      expect(validate.errors).toEqual(message);
    })
  })
});

describe('molecules.schema.json', ()=>{
  var schema = require('./molecules.schema.json');
  var validate = new Ajv().compile(schema);
  var goodFixtures = ['good.molecules.json'];
  goodFixtures.forEach((f) => {
    it(`handles ${f}`, ()=>{
      var data = require(`./fixtures/${f}`);
      var valid = validate(data);
      if (!valid) { console.warn(validate.errors); }
      expect(valid).toEqual(true);
    })
  });

  var badFixtures = [['bad.molecules.json', 'bad.molecules.message.json']];
  badFixtures.forEach(([input, output]) => {
    it(`handles ${input}`, ()=>{
      var data = require(`./fixtures/${input}`);
      var message = require(`./fixtures/${output}`);
      var valid = validate(data);
      expect(valid).toEqual(false);
      expect(validate.errors).toEqual(message);
    })
  })
});
