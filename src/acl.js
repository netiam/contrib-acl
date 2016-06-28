import _ from 'lodash'
import {HTTPError} from 'netiam-errors'
import {
  PRIV_CREATE,
  PRIV_READ,
  PRIV_UPDATE,
  PRIV_DELETE
} from './constants'
import {
  ACL_FORBIDDEN,
  ACL_EMPTY_BODY
} from './errors'

function getUser(req) {
  return _.get(req, 'user', {})
}

function getRole(req, path) {
  const user = getUser(req)
  return _.get(user, path, 'GUEST')
}

function getPrivilege(req) {
  switch (req.method) {
    case 'POST':
      return PRIV_CREATE
    case 'GET':
    case 'HEAD':
      return PRIV_READ
    case 'PUT':
    case 'PATCH':
      return PRIV_UPDATE
    case 'DELETE':
      return PRIV_DELETE
    default:
      return PRIV_READ
  }
}

function req({adapter, resource}) {
  return function(req) {
    const user = getUser(req)
    // TODO configure role access, e.g. set path as config param?
    const role = getRole(req, 'role.name')
    const privilege = getPrivilege(req)

    const data = _.get(req, 'body.data', false)

    if (!data && _.includes([PRIV_CREATE, PRIV_UPDATE], privilege)) {
      return Promise.reject(
        new HTTPError(ACL_EMPTY_BODY)
      )
    }

    return adapter
      .allowed(user, resource, role, privilege)
      .then(isAllowed => {
        if (!isAllowed) {
          return Promise.reject(
            new HTTPError(ACL_FORBIDDEN)
          )
        }

        // TODO do we need a better check, if it is in valid JSON API format?
        if (!data) {
          return
        }

        if (_.isArray(data)) {
          return Promise.all(
            _.map(
              data,
              document => adapter.filter(document, user, document.type, role, privilege)
            )
          )
        }

        return adapter.filter(data, user, data.type, role, privilege)
      })
  }
}

function res({adapter, resource}) {
  return function(req, res) {
    const user = getUser(req)
    const role = getRole(req, 'role.name')

    const data = _.get(res, 'body.data', false)
    if (!data) {
      return Promise.resolve()
    }

    return adapter
      .allowed(user, resource, role, PRIV_READ)
      .then(isAllowed => {
        if (!isAllowed) {
          return Promise.reject(
            new HTTPError(ACL_FORBIDDEN)
          )
        }
        if (_.isArray(data)) {
          return Promise.all(
            _.map(
              data,
              document => adapter.filter(document, user, document.type, role, PRIV_READ)
            )
          )
        }
        return adapter.filter(data, user, data.type, role, PRIV_READ)
      })
      .then(() => {
        const included = _.get(res, 'body.included', false)
        if (!_.isArray(included)) {
          return
        }
        // TODO cross-check relationships
        // TODO I don't get what the TODO comment above is about
        return Promise.all(
          _.map(
            included,
            document => adapter.filter(document, user, document.type, role, PRIV_READ)
          )
        )
      })
  }
}

export default Object.freeze({
  req,
  res
})
