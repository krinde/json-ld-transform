"use strict";

(function() {
    const SUBJECTKEY_PREFIX = "http://example.com/";

    return {
        "@id": function(input) {
            return SUBJECTKEY_PREFIX + "people/person/" + input._id;
        },
        "type.object.name": ".name",
        "people.person.description": ".about",
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