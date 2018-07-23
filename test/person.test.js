const path = require('path');
const fs = require('fs');
const transform = require('../index');
const jsonld = require('jsonld');
const expect = require('chai').expect;

describe('Convert schema json to json-ld `@context`', function() {
    it('convert person\'s schema to json-ld `@context` succuessfully', function() {
        let schema = JSON.parse(fs.readFileSync(path.join(__dirname, './person/person.schema.json'), 'utf-8'));
        let schemaContext = transform.convertSchema(schema, 'http://knowledge.example.com/');
        let expected = JSON.parse(fs.readFileSync(path.join(__dirname, './person/person.schemaContext.json'), 'utf8'));
        expect(schemaContext).to.be.deep.equal(expected);
    })
})

describe('Transform json to json-ld', function() {
    it('transform person.json to person.ld.json successfully', function() {
        let schemaContext = JSON.parse(fs.readFileSync(path.join(__dirname, './person/person.schemaContext.json'), 'utf8'));
        let input = JSON.parse(fs.readFileSync(path.join(__dirname, './person/person.json'), 'utf-8'));
        let config = transform.evalConfigJs(fs.readFileSync(path.join(__dirname, './person/person.config.js'), 'utf8'));
        let expected = JSON.parse(fs.readFileSync(path.join(__dirname, './person/person.ld.json'), 'utf-8'));
       
        let output = transform.run(input, config, null, schemaContext);
        expect(output).to.be.deep.equal(expected);
    });
});

describe('Flatten json-ld json to triples (N-Quads)', function() {
    it('flatten person.ld.json to triples', async function() {
        let doc = JSON.parse(fs.readFileSync(path.join(__dirname, './person/person.ld.json'), 'utf-8'));
        let nquads = await jsonld.toRDF(doc, { format: 'application/n-quads' });
        nquads = nquads.split('\n');
        let expected = fs.readFileSync(path.join(__dirname, './person/person.ttl'), 'utf-8').toString().split('\n');
        expect(nquads).to.be.eql(expected);
    })
});