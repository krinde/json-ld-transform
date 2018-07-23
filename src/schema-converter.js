
function convert(schema, base) {
    if(!base) base = "http://knowledge.example.com/"
    var context = {
        "xsd": "http://www.w3.org/2001/XMLSchema#"
    };
    schema.forEach(e => {
        if(!e.name) {
            return;
        }
        let name = e.name;
        let namespace = e.namespace ? base + e.namespace + "/": base;
        if(!e.fields) {
            return;
        }
        e.fields.forEach(f => {
            let p = name + "." + f.name;
            let type = f.type;
            if(type.indexOf('.') !== -1) {
                type = namespace + type;
            } else {
                type = "xsd:" + type;
            }
            context[p] = {
                "@id": namespace + p,
                "@type": type
            };
        });
    });
    return context;
}

module.exports = {
    convert: convert
};