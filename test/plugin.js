import _ from 'lodash'
import User from './models/user'
import plugin from '../src/acl'
import jsonAdapter from '../src/adapters/json'
import {
  setup,
  teardown
} from './utils/db'
import userFixture from './fixtures/user'
import userJSONApiFixture from './fixtures/user.jsonapi'

describe('netiam-contrib', () => {
  describe('ACL - Plugin', () => {

    before(setup)
    after(teardown)

    const adapter = jsonAdapter({dir: './test/fixtures/acl'})

    it('should create documents', done => {
      User
        .create(userFixture)
        .then(() => done())
        .catch(done)
    })

    it('should allow create request for GUEST', done => {
      const req = {
        method: 'POST',
        body: _.cloneDeep(userJSONApiFixture)
      }
      const res = {body: _.cloneDeep(userJSONApiFixture)}
      const acl = plugin.req({
        adapter,
        resource: 'user'
      })
      acl(req, res)
        .then(() => done())
        .catch(done)
    })

    it('should deny update request for GUEST', done => {
      const req = {
        method: 'PATCH',
        body: _.cloneDeep(userJSONApiFixture)
      }
      const res = {body: _.cloneDeep(userJSONApiFixture)}
      const acl = plugin.req({
        adapter,
        resource: 'user'
      })
      acl(req, res)
        .then(() => done(new Error('Must throw error')))
        .catch(err => {
          err.should.have.properties(['status', 'code', 'id'])
          err.status.should.eql(403)
          err.code.should.eql('ACL_FORBIDDEN')
          err.id.should.eql(5001)
          done()
        })
    })

    it('filter document for GUEST', done => {
      const req = {method: 'GET'}
      const res = {body: _.cloneDeep(userJSONApiFixture)}
      const acl = plugin.res({
        adapter,
        resource: 'user'
      })
      acl(req, res)
        .then(() => {
          const body = res.body.data
          body.should.have.properties(['type', 'attributes', 'relationships'])
          body.type.should.eql('user')
          body.attributes.should.be.Object().and.empty()
          body.relationships.should.be.Object().and.empty()
          done()
        })
        .catch(done)
    })

    it('filter document for USER', done => {
      const req = {
        method: 'GET',
        user: {role: {name: 'USER'}}
      }
      const res = {body: _.cloneDeep(userJSONApiFixture)}
      const acl = plugin.res({
        adapter,
        resource: 'user'
      })
      acl(req, res)
        .then(() => {
          const body = res.body.data
          body.should.have.properties(['type', 'attributes', 'relationships'])
          body.type.should.eql('user')
          body.attributes.should.be.Object().and.have.properties([
            'email',
            'username'
          ])
          body.relationships.should.be.Object().and.have.properties(['projects'])
          done()
        })
        .catch(done)
    })

  })
})
