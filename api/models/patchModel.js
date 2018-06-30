'use strict';

const mongoose = require('mongoose');
const ajv = new require('ajv')();

const jsonPatch = {
  "$id": "http://json-patch.org/jsonpatch.json",
    "description": "A JSON Schema describing a JSON Patch",
    "type": "array",
    "items": {
    "description": "one JSON Patch operation",
    "allOf": [
      {
        "description": "Members common to all operations",
        "type": "object",
        "required": ["op", "path"],
        "properties": {
          "path": {"$ref": "defs.json#/definitions/jsonPointer"}
        }
      },
      {"$ref": "defs.json#/definitions/oneOperation"}
    ]
  }
};
const defs = {
  "$id": "http://json-patch.org/defs.json",
    "definitions": {
    "jsonPointer": {
      "type": "string",
        "pattern": "^(/[^/~]*(~[01][^/~]*)*)*$"
    },
    "add": {
      "description": "add operation. Value can be any JSON value.",
        "properties": {
        "op": {
          "enum": [
            "add"
          ]
        }
      },
      "required": [
        "value"
      ]
    },
    "remove": {
      "description": "remove operation. Only a path is specified.",
        "properties": {
        "op": {
          "enum": [
            "remove"
          ]
        }
      }
    },
    "replace": {
      "description": "replace operation. Value can be any JSON value.",
        "properties": {
        "op": {
          "enum": [
            "replace"
          ]
        }
      },
      "required": [
        "value"
      ]
    },
    "move": {
      "description": "move operation. \"from\" is a JSON Pointer.",
        "properties": {
        "op": {
          "enum": [
            "move"
          ]
        },
        "from": {
          "$ref": "defs.json#/definitions/jsonPointer"
        }
      },
      "required": [
        "from"
      ]
    },
    "copy": {
      "description": "copy operation. \"from\" is a JSON Pointer.",
        "properties": {
        "op": {
          "enum": [
            "copy"
          ]
        },
        "from": {
          "$ref": "defs.json#/definitions/jsonPointer"
        }
      },
      "required": [
        "from"
      ]
    },
    "oneOperation": {
      "oneOf": [
        {
          "$ref": "defs.json#/definitions/add"
        },
        {
          "$ref": "defs.json#/definitions/remove"
        },
        {
          "$ref": "defs.json#/definitions/replace"
        },
        {
          "$ref": "defs.json#/definitions/move"
        },
        {
          "$ref": "defs.json#/definitions/copy"
        }
      ]
    }
  }
};

const validateJsonPatch = ajv.addSchema(defs).compile(jsonPatch);

// Definitions du modele stocké en base

const objectPatch = new mongoose.Schema({
  id:  {
    type :      String,
    required :  true,
  },
  tenantId : {
    type :      String,
    required :  true,
  },
  userId : {
    type :      String,
    required :  true,
  },
  date : {
    type :      Date,
    required :  true,
  },
  patch : [
    mongoose.Schema.Types.Mixed
  ]

});

const objectPatchModel = (name, collection) => mongoose.model(name, objectPatch , collection || name);

module.exports = {
  jsonPatch,
  validateJsonPatch,
  objectPatch,
  objectPatchModel,
};