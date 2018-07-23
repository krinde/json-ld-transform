const engine = require('./transform-engine');
const jsonld = require('jsonld');

function evalConfigJs(js) {
    var obj = eval(js);
    return obj;
}

function run(input, configObj, inputContext, schemaContext) {
    var doc = engine.transform(configObj, input, inputContext);
    if(schemaContext) doc["@context"] = schemaContext;
    return doc;
}

async function toRDF(doc) {
    return await jsonld.toRDF(doc, {algorithm: 'URDNA2015', format: 'application/n-quads'});
}

module.exports = {
    evalConfigJs: evalConfigJs,
    run: run
}