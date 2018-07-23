const JSPath = require('jspath');
const VALUE = '$$value';
const PATH = '$$path';
const SELECT = '$$select';
const PRIORITY = '$$priority';
const SUBJECTKEY = '@id';
const TYPE = '@type';

const FILTERED_PROPS = [VALUE, PATH, SELECT, TYPE];

const getPathValue = (path, input) => {
    var ret = JSPath.apply(path, input);
    if(ret.length === 0) {
        return undefined;
    }
    if(ret.length === 1) {
        return ret[0];
    }
    return ret;
}

const getInputsBySelect = (select, input, context, $parent, parent, root) => {
    if(typeof select === 'function') {
        select = select(input, context, $parent, parent, root);
    }

    var selectors = [];
    var newInputs = [];
    if(!Array.isArray(select)) {
        selectors = [select];
    }
    selectors.forEach(s => {
        if(typeof s === 'string') {
            var newInput = JSPath.apply(s, input);
            if(Array.isArray(newInput)) {
                newInputs = newInputs.concat(newInput);
            } else if(newInput !== null) {
                newInputs.push(newInput);
            }
        }
    });

    return newInputs;
}

const getPropsByPriority = (config) => {
    var propsWithPriority = [];
    for(let prop in config) {
        if(prop in FILTERED_PROPS) {
            continue;
        }
        if(config[prop][PRIORITY] !== null && config[prop][PRIORITY] !== undefined) {
            propsWithPriority.push({
                name: prop,
                priority: config[prop][PRIORITY]
            });
        } else {
            let priority = 100;
            switch(prop) {
                case SUBJECTKEY:
                    priority = 1000;
                    break;
                case TYPE:
                    priority = 1000;
                    break;
                default:
                    priority = 100;
                    break;
            }
            propsWithPriority.push({
                name: prop,
                priority: priority
            });
        }
    }
    
    propsWithPriority.sort((a, b) => {
        return a.priority - b.priority;
    });
    return propsWithPriority.map((p) => {
        return p.name
    });
}

const transformNode = (config, input, context, parent, $parent, root) => {    
    let output = {};
    if($parent == null || $parent == undefined) {
        $parent = output;
    }

    // directly return value
    if (config[VALUE] !== undefined) {
       if (typeof config[VALUE] !== 'function')  {
            return config[VALUE];
       } else {
            return config[VALUE](input, context, output, parent, $parent, root);
       }
    }

    if (config[PATH] !== undefined) {
        let path = config[PATH];
        if (typeof config[PATH] === 'function') {
            path = config[PATH](input, context, output, parent, $parent, root);
        }
        return JSPath.apply(config[PATH], input);
    }

    let props = getPropsByPriority(config);
    for(let i = 0; i < props.length; i++) {
        let prop = props[i];
        if(prop === SELECT) {
            continue;
        }
        let value = undefined;
        if(typeof config[prop] == 'string') {
            value = getPathValue(config[prop], input);
        } else if (typeof config[prop] == 'object') {
            value = transform(config[prop], input, context, parent, output, root);
        } else if (typeof config[prop] == 'function') {
            value = config[prop](input, context, output, parent, $parent, root);
        }
        if(value != undefined) {
            output[prop] = value;
        }
    }

    if (Object.getOwnPropertyNames(output).length == 0) {
        return undefined;
    }
    return output;
}

const transformSingleInputNode = (configs, input, context, parent, $parent, root) => {
    let outputs = [];
    configs.forEach((config) => {
        if (config[SELECT] !== null && config[SELECT] !== undefined) {
            let newInputs = getInputsBySelect(config[SELECT], input, context, $parent, parent, root)
            newInputs.forEach((newInput) => {
                let output = transformNode(config, newInput, context, parent, $parent, root);
                if(output !== null && output !== undefined) {
                    outputs.push(output);
                }
            })
        } else {
            let output = transformNode(config, input, context, parent, $parent, root);
            if(output !== null && output !== undefined) {
                outputs.push(output);
            }
        }
    });

    return outputs;
}

const transformMultipleInputNodes = (configs, inputs, context, parent, $parent, root) => {
    var outputs = [];
    inputs.forEach((input) => {
        if(root == null || root == undefined) {
            root = input;
        }
        if(parent == null || parent == undefined) {
            parent = input;
        }
     transformSingleInputNode(configs, input, context, parent, $parent, root).forEach(o => {
            outputs.push(o);
        });
    });
    return outputs;
}

const transform = (config, input, context, parent, $parent, root) => {
    if(!config || typeof config != 'object') {
        return undefined;
    }

    var inputs = [];    
    if(!Array.isArray(input)) {
        inputs = [input];
    } else {
        inputs = input;
    }

    var configs = [];
    if(!Array.isArray(config)) {
        configs = [config];
    } else {
        configs = config;
    }

    var outputs = transformMultipleInputNodes(configs, inputs, context, parent, $parent, root);
    if(outputs.length == 0) {
        return undefined;
    }
    if(outputs.length == 1) {
        return outputs[0];
    }

    return outputs;
};

module.exports = {
    transform: transform
};