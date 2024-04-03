---
title: Object Model API View
sidebar_position: 1250
---

## `pageComponent`

Use `pageComponent: 'omapi/OMAPIView'` in a handler to activate the Object Model API view.

This view is designed to allow viewing of the configurated Object Model API endpoints for a project. You can also try out the endpoints to see the result of a given OMAPI endppint call. The page will also notify you if any of the top level resources do not have an OPTIONS method configured (a requirement if you wish to call the OMAPI from a browser).

### Configuration

There is no specific configuration for this page

## Example

```json
"omapi": {
  "title": "API Docs",
  "icon": "fas fa-book-open fa-2x",
  "shortName": "omapi",
  "description": "OMAPI Documenatation",
  "pageComponent": "omapi/OMAPIView",
  "path": "/omapi",
  "scriptTypes": []
}
```

## Adding Documentation to Your apiConfig

In order to use the 'Try Me' feature, and fulyl document your OMAPI, you will need to add documentation to your apiConfig to support it.
This has the added benefit of creating documentation for your API within the same file that is defining your API.

To each path in your apiConfig, you can add a "docs" property and include these subjects. All of thes esubject are optional, but you will want to include the necessary subjects for each endpoint.

```json
"docs": {
  "Summary": "A short summary fo what the endpoint does",
  "Path Variables": "A list of the support path variables and what they mean, these keys must match exactly the path variable in the path",
  "Path Variables Example": "Example values of path variables, these keys must match exactly the path variable in the path",
  "Request Query Params": "A list of the support query params and what they do",
  "Request Query Params Example": "Example values for each query param",
  "Request Body": "A description of the request body JSON fields",
  "Request Body Example": "An example request Body",
  "Response Body": "A description of the response body JSON fields",
  "Response Body Example": "AN example of a response body"
}
```

### Example Path with Documentation

```json
{
  "path": "/assets/properties/:property",
  "method": "GET",
  "script": {
    "_userType": "omapi",
    "_scriptName": "getAssetPropertyValues"
  },
  "docs": {
    "Summary": "Returns a list of the unique property values of the given property on Assets",
    "Path Variables": {
      ":property": "The property name for which to retrieve unique values"
    },
    "Path Variables Example": {
      ":property": "dtType"
    },
    "Request Query Params": {
      "_offset": "Where in the total list of results to start returning results, OPTIONAL: default: 0",
      "_pageSize": "Number of results to return starting at _offset, OPTIONAL: default: 200"
    },
    "Request Query Params Example": {
      "_offset": 0,
      "_pageSize": 200
    },
    "Response Body": {
      "_requestid": "id of the object model api request",
      "_timetaken": "Time taken for the request to complete",
      "_result" : "An object with a key for the requested property with a value of an array of all the unique values"
    },
    "Response Body Example": {
        "_requestid": "79260f05-d45d-4db8-a6bc-41dacd417b48",
        "_timetaken": 0.305,
        "_result": {
          "dtType": [
            "10 Gang Light Switch",
            "24vdc Power supply unit",
            "24vdc Relay",
            "3D Printer",
            "500A Contactor",
            "AC Room Controller",
            "ACB Interlock kit",
            "AOV"
          ]
        }
    }
  }
}
```