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

      // {
      //   keyword: 'type',
      //   dataPath: '['778'].tsne[1]',
      //   schemaPath: '#/definitions/coord/items/type',
      //   params: Object{type: ...},
      //   message: 'should be number'
      // }]

    })
  })
});
