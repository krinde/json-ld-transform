const readline = require('readline');
const fs = require('fs');
const path = require('path');
const transform = require('../index');
const expect = require('chai').expect;


describe('Transform json to json-ld', function() {
    it('person.json to person.ld.json successfully', function() {
        let input = JSON.parse(fs.readFileSync(path.join(__dirname, './cases/person.json'), 'utf-8'));
        let config = transform.evalConfigJs(fs.readFileSync(path.join(__dirname, './cases/person.config.js'), 'utf8'));
        let expected = JSON.parse(fs.readFileSync(path.join(__dirname, './cases/person.ld.json'), 'utf-8'));
        
        let output = transform.run(input, config);
        expect(output).to.be.deep.equal(expected);
    });
})