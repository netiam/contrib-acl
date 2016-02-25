import _ from 'lodash'
import assert from 'assert'
import fs from 'fs'
import path from 'path'
import Promise from 'bluebird'
import glob from 'glob'
import {
  ALLOW,
  DENY,
  WILDCARD
} from '../../constants'

export default function({dir, asserts = {}, transforms = {}}) {
  assert.ok(dir)

  const registry = {}

  function init() {
    return new Promise((resolve, reject) => {
      const root = path.join(process.cwd(), dir)
      glob('**/*.acl.json', {
        cwd: root,
        nosort: true,
        realpath: true
      }, (err, files) => {
        if (err) {
          return reject(err)
        }

        const list = _.map(files, file => {
          return new Promise((resolve, reject) => {
            fs.readFile(file, 'utf8', (err, data) => {
              if (err) {
                return reject(err)
              }
              // TODO valid ACL schema or ignore
              try {
                registry[_.kebabCase(path.basename(file, '.acl.json'))] = JSON.parse(data)
              } catch (parseError) {
                return reject(parseError)
              }
              resolve()
            })
          })
        })

        return Promise
          .all(list)
          .then(() => resolve())
      })
    })
  }

  const initialized = init()

  function getTransformConfig(resource, name) {
    const path = `${resource}.transforms.${name}`
    if (_.has(registry, path)) {
      return _.get(registry, path)
    }
    return {}
  }

  function getResource(resource) {
    if (_.has(registry, resource)) {
      return _.get(registry, resource)
    }
  }

  function attributes(document, user, resource, role, privilege) {
    resource = getResource(resource)
    if (!resource) {
      return {}
    }

    const keys = _.filter(
      _.keys(document.data.attributes),
      attribute => {
        const resourceAttribute = _.get(resource.attributes, attribute, false)

        // MISSING IN ACL
        if (!resourceAttribute) {
          return false
        }

        // WILDCARD DENY
        if (_.has(resource.attributes, `${WILDCARD}.${DENY}.${role}`)) {
          const privileges = _.get(resource.attributes, `${WILDCARD}.${DENY}.${role}`)
          if (privileges.indexOf(privilege) !== -1) {
            return false
          }
        }

        // DENY
        if (_.has(resourceAttribute, `${DENY}.${role}`)) {
          const privileges = _.get(resourceAttribute, `${DENY}.${role}`)
          if (privileges.indexOf(privilege) !== -1) {
            return false
          }
        }

        // WILDCARD ALLOW
        if (_.has(resource.attributes, `${WILDCARD}.${ALLOW}.${role}`)) {
          const privileges = _.get(resource.attributes, `${WILDCARD}.${ALLOW}.${role}`)
          if (privileges.indexOf(privilege) !== -1) {
            return true
          }
        }

        // ALLOW
        if (_.has(resourceAttribute, `${ALLOW}.${role}`)) {
          const privileges = _.get(resourceAttribute, `${ALLOW}.${role}`)
          if (privileges.indexOf(privilege) !== -1) {
            return true
          }
        }

        return false
      }
    )
    return _.pick(document.data.attributes, keys)
  }

  function relationships(document, user, resource, role, privilege) {
    resource = getResource(resource)
    if (!resource) {
      return {}
    }

    const keys = _.filter(
      _.keys(document.data.relationships),
      relationship => {
        console.log(document.data.relationships)
        const resourceRelationship = _.get(resource.relationships, relationship, false)

        // MISSING IN ACL
        if (!resourceRelationship) {
          return false
        }

        // WILDCARD DENY
        if (_.has(resource.relationships, `${WILDCARD}.${DENY}.${role}`)) {
          const privileges = _.get(resource.relationships, `${WILDCARD}.${DENY}.${role}`)
          if (privileges.indexOf(privilege) !== -1) {
            return false
          }
        }

        // DENY
        if (_.has(resourceRelationship, `${DENY}.${role}`)) {
          const privileges = _.get(resourceRelationship, `${DENY}.${role}`)
          if (privileges.indexOf(privilege) !== -1) {
            return false
          }
        }

        // WILDCARD ALLOW
        if (_.has(resource.relationships, `${WILDCARD}.${ALLOW}.${role}`)) {
          const privileges = _.get(resource.relationships, `${WILDCARD}.${ALLOW}.${role}`)
          if (privileges.indexOf(privilege) !== -1) {
            return true
          }
        }

        // ALLOW
        if (_.has(resourceRelationship, `${ALLOW}.${role}`)) {
          const privileges = _.get(resourceRelationship, `${ALLOW}.${role}`)
          if (privileges.indexOf(privilege) !== -1) {
            return true
          }
        }

        return false
      }
    )
    return _.pick(document.data.relationships, keys)
  }

  function allowed(user, resource, role, privilege) {
    assert.ok(user)
    assert.ok(resource)
    assert.ok(role)
    assert.ok(privilege)

    return initialized
      .then(() => true)
  }

  function filter(document, user, resource, role, privilege, asserts = {}) {
    assert.ok(document)
    assert.ok(user)
    assert.ok(resource)
    assert.ok(role)
    assert.ok(privilege)

    document = _.clone(document)

    return initialized
      .then(() => {
        document.data.attributes = attributes(document, user, resource, role, privilege)
        document.data.relationships = relationships(document, user, resource, role, privilege)
      })
      .then(() => Object.freeze(document))
  }

  function transform(document, user, resource, role, privilege) {
    const transformed = _.map(transforms, (transform, name) => {
      const parameters = getTransformConfig(resource, name)
      return transform(_.cloneDeep(document), user, this, resource, role, privilege, parameters)
    })
    return initialized
      .then(() => Promise.all(transformed))
      .then(transformed => Object.assign({}, ...transformed))
  }

  return Object.freeze({
    allowed,
    filter,
    initialized,
    transform
  })

}
