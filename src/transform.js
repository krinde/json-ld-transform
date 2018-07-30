const engine = require('./transform-engine');
const jsonld = require('jsonld');
const converter = require('./schema-converter');

function evalConfigJs(js) {
    var obj = eval(js);
    return obj;
}

function addTypeProperty(node, type) {
    if (!node["@type"]) {
        node["@type"] = [type];
     } else {
         if(!Array.isArray(node["@type"])){
             node["@type"] = [node["@type"]];
         }
         if(node["@type"].indexOf(type) === -1) {
             node["@type"].push(type);
         }
     }
}

function addTypeProperties(node, schemaContext) {
    if(!schemaContext) {
        return;
    }

    for(let prop in node) {
        if (!schemaContext[prop]) {
            break;
        }
        type = schemaContext[prop];
        if(typeof(type) !== 'string') {
            type = type["@type"];
        }
        if (type.startsWith("xsd:")) {
            continue;
        }

        if (Array.isArray(node[prop])) {
            node[prop].forEach((n) => {
                addTypeProperty(n, type);
            });
        } else {
            addTypeProperty(node[prop], type);
        }
    }
}

function run(input, configObj, inputContext, schemaContext) {
    let doc = {
        "@context": schemaContext
    };
    let output = engine.transform(configObj, input, inputContext);
    // add @type property
    addTypeProperties(output, schemaContext);
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