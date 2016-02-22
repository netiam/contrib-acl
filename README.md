# netiam-contrib-acl

[![Build Status](https://travis-ci.org/netiam/contrib-acl.svg)](https://travis-ci.org/netiam/contrib-acl)
[![Dependencies](https://david-dm.org/netiam/contrib-acl.svg)](https://david-dm.org/netiam/contrib-acl)
[![npm version](https://badge.fury.io/js/netiam-contrib-acl.svg)](http://badge.fury.io/js/netiam-contrib-acl)

> An ACL plugin for netiam

## Get it

```bash
npm i -S netiam-contrib-acl
```

## Example

```js
netiam()
  .acl.req({acl})
  .rest(…)
  .acl.res({acl})
  .json()
```

## Dependencies

The `ACL` plugin requires `netiam-contrib-auth`.

## Adapters

As *ACL* definitions may reside in a file, a database and in various formats,
you can write your own adapter solution. The basic *JSON* adapter is provided
by this plugin and might be sufficient for a lot of cases. Highly dynamic ACLs,
might utilize database queries to verify access rights. To create your own
adapter you have to implement the following interface.

### Example

```js
function({asserts = {}, transforms = {}}) {

  /**
   * Check access rights on resource level (e.g. API endpoint `POST /users`)
   * @param {object} user The authenticated user
   * @param {string} resource The resource you want to check access rights
   * @param {string} role Current role of the authenticated user
   * @param {string} privilege The privilege level (either one of `create`, `read`, `update` or `delete`)
   * @returns {Promise<boolean>} Returns `true`, if and only if ACL has a rule which allows access (whitelist)
   */
  function allowed(user, resource, role, privilege) {…}

  /**
   * Check access rights on each document attribute and relationship and pluck allowed properties
   * @param {object} document The document you want to filter
   * @param {object} user The authenticated user
   * @param {string} resource The resource you want to check access rights
   * @param {string} role Current role of the authenticated user
   * @param {string} privilege The privilege level (either one of `create`, `read`, `update` or `delete`)
   * @param {object[]} [asserts=[]] An optional list of assertions (e.g. `owner`)
   * @returns {Promise<object>} Returns a filtered object or an empty object if access has been denied for all properties
   */
  function filter(document, user, resource, role, privilege, asserts) {…}

  return Object.freeze({
    allowed,
    filter
  })

}
```

## Asserts

These are `true`/`false` conditions on a document level. If at least one `assert`
evaluates to `false`, the whole document will be stripped from the result(set).

Assertions need to be provided as list of `validate` functions along the ACL
adapter config. The actual assertion will be invoked with parameters that can be
defined on resource level (e.g. in a special section `asserts` within the `resource` JSON).

### Example

```js
/**
 * Grants access if authenticated user is the owner of the document
 * @param {object} document The document you want to filter
 * @param {object} user The authenticated user
 * @param {object} acl The ACL adapter you have registered this assert for
 * @param {string} resource The resource you want to check access rights
 * @param {string} role Current role of the authenticated user
 * @param {string} privilege The privilege level (either one of `create`, `read`, `update` or `delete`)
 * @param {object} [...parameters={}]
 * @returns {Promise<boolean>} Returns true, if and only if authenticated user owns document
 */
function owner(document, user, acl, resource, role, privilege, ...parameters) {
  const {ownerField} = parameters
  return Promise.resolve(user.id === document[ownerField])
)
```

## Transforms

With *transforms* you are able to modify a response on document level. There is
a very common use-case for that, the *virtual role*. Your application might have
defined a role for *guests*, *regular users* and *editors*. Some resources might
offer some personal information (e.g. IBAN/BIC properties) that nobody, except
the owner of the document, should be allowed to see. You can use a transform
to modify the document on demand.

To use transforms, they need to be added to the adapter config (same as with asserts).
Transforms can also be configured on resource level  (e.g. in a special section `transforms` within the `resource` JSON).

Transforms are applied on the original document and the result is merged
into the final document. Be careful with this, as it easy to add properties
that should be filtered! It is considered a good practice to just filter a
subset of the original document.

In theory, transforms allow you to add properties to the final document that
did not exist on the original one. This is considered a bad practice and you
should have a look at [`netiam-contrib-transform`](https://github.com/netiam/contrib-transform) if you want todo so.

### Example

This is quite an easy but powerful example as it uses the `filter` method with a
different role on the actual document.

```js
/**
 * Transforms document by adding `iban` if authenticated user is owner of the document
 * @param {object} document The document you want to filter
 * @param {object} user The authenticated user
 * @param {object} acl The ACL adapter you have registered this assert for
 * @param {string} resource The resource you want to check access rights
 * @param {string} role Current role of the authenticated user
 * @param {string} privilege The privilege level (either one of `create`, `read`, `update` or `delete`)
 * @param {object} [...parameters={}]
 * @returns {Promise<object>} Returns true, if and only if authenticated user owns document
 */
function owner(document, user, acl, resource, role, privilege, ...parameters) {
  const {ownerField} = parameters
  const data = {iban: document.iban}

  if (user.id === document[ownerField]) {
    return acl.filter(data, resource, 'OWNER', privilege)
  }

  return Promise.resolve({})
}
```

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)
