"use strict";

(function() {
    const SUBJECTKEY_PREFIX = "http://knowledge.example.com/";

    return {
        "@id": function(input) {
            return SUBJECTKEY_PREFIX + "people/person/" + input._id;
        },
        "type.object.name": ".name",
        "type.object.description": function(input) {
            return input.about.replace('\r', '').replace('\n', '');
        },
        "people.person.address": ".address",
        "people.person.gender": ".gender",
        "people.person.email": ".email",
        "people.person.phone": ".phone",
        "people.person.friend": {
            "$$select": ".friends",
            "type.object.name": ".name",
            "@id": function(input, context, output) {
                return SUBJECTKEY_PREFIX + "people/person/" + encodeURIComponent(output["type.object.name"]);
            }
        }
    }
})();