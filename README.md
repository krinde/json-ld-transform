# json-ld-transform
This is a project aimed at tranforming every json to [json-ld](https://json-ld.org/).

## How to use
First, clone the repo.
``` shell
    $ git clone https://github.com/krinde/json-ld-transform.git
```
Then, install the dependencies locally.
``` shell
    $ cd json-ld-transform
    $ npm install
```
Last, run the test.
``` shell
    $ npm test
```

## Examples
``` javascript
    var input = {
        "_id": "5b51a803c3665e14977c4a20",
        "name": "Booth Garner",
        "email": "boothgarner@daycore.com",
        "phone": "+1 (817) 421-3062",
        "about": "Ad aute ipsum quis cillum. Irure qui officia ea est ut aliquip ut enim eu sit duis. Est esse amet dolore velit excepteur.\r\n",
        "friends": [{
            "id": 0,
            "name": "Johanna Fitzpatrick"
        },
        {
            "id": 1,
            "name": "Baldwin Kennedy"
        }],
        "greeting": "Hello, Booth Garner! You have 6 unread messages.",
        "favoriteFruit": "apple"
    };

    var SUBJECTKEY_PREFIX = "http://example.com/";
    var configString = `
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
    `;
    var config = jsonLdTransform.evalConfigJs(configString);
    var output = jsonLdTransform.run(input, config);
    console.log(JSON.stringify());
    /*
        {
            "type.object.name": "Booth Garner",
            "people.person.description": "Ad aute ipsum quis cillum. Irure qui officia ea est ut aliquip ut enim eu sit duis. Est esse amet dolore velit excepteur.\r\n",
            "people.person.address": "712 Bridgewater Street, Harviell, New Mexico, 6425",
            "people.person.gender": "male",
            "people.person.email": "boothgarner@daycore.com",
            "people.person.phone": "+1 (817) 421-3062",
            "people.person.friend": [
                {
                    "type.object.name": "Johanna Fitzpatrick",
                    "@id": "http://example.com/people/person/Johanna%20Fitzpatrick"
                },
                {
                    "type.object.name": "Baldwin Kennedy",
                    "@id": "http://example.com/people/person/Baldwin%20Kennedy"
                },
                {
                    "type.object.name": "Mills Chan",
                    "@id": "http://example.com/people/person/Mills%20Chan"
                }
            ],
            "@id": "http://example.com/people/person/5b51a803c3665e14977c4a20"
        }
    */

```