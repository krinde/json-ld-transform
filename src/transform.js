const engine = require('./transform-engine');
const jsonld = require('jsonld');
const converter = require('./schema-converter');

function evalConfigJs(js) {
    var obj = eval(js);
    return obj;
}

function run(input, configObj, inputContext, schemaContext) {
    let doc = {
        "@context": schemaContext
    };
    let output = engine.transform(configObj, input, inputContext);
    for(let prop in output) {
        doc[prop] = output[prop];
    }
    return doc;
}

async function toRDF(doc) {
    return await jsonld.toRDF(doc, {algorithm: 'URDNA2015', format: 'application/n-quads'});
}

module.exports = {
    evalConfigJs: evalConfigJs,
    run: run,
    convertSchema: converter.convert
}