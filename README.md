# netiam-contrib-acl

[![Build Status](https://travis-ci.org/netiam/contrib-acl.svg)](https://travis-ci.org/netiam/contrib-acl)
[![Dependencies](https://david-dm.org/netiam/contrib-acl.svg)](https://david-dm.org/netiam/contrib-acl)
[![npm version](https://badge.fury.io/js/netiam-contrib-acl.svg)](http://badge.fury.io/js/netiam-contrib-acl)

> An ACL plugin for netiam

## Example

```js
netiam()
  .acl.req({acl})
  .res(…)
  .acl.res({acl})
  .json()
```

## Adapters

As *ACL* definitions may reside in a file, a database and in various formats,
you can write your own adapter solution. The basic *JSON* adapter is provided
by this plugin and might be sufficient for a lot of cases. Highly dynamic ACLs,
might utilize database queries to verify access rights. To create your own
adapter you have to implement the following interface.

```js
function(config) {

  /**
   * Check access rights on resource level (e.g. API endpoint `POST /users`)
   * @param {string} resource The resource you want to check access rights
   * @param {string} privilege The privilege level (either one of `create`, `read`, `update` or `delete`)
   * @param {object[]} [asserts=[]] An optional list of assertions (e.g. `owner`)
   * @returns {Promise<boolean>} Returns `true`, if and only if ACL has a rule which allows access (whitelist)
   */
  function allowed(resource, privilege, asserts) {…}

  /**
   * Check access rights on each document attribute and relationship and pluck allowed properties
   * @param {string} resource The resource you want to check access rights
   * @param {object} document The document you want to filter
   * @param {string} privilege The privilege level (either one of `create`, `read`, `update` or `delete`)
   * @param {object[]} [asserts=[]] An optional list of assertions (e.g. `owner`)
   * @returns {Promise<object>} Returns a filtered object or an empty object if access has been denied for all properties
   */
  function filter(resource, document, privilege, asserts) {…}

  return Object.freeze({
    allowed,
    filter
  })

}
```

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)
