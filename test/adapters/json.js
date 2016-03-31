import jsonAdapter from '../../src/adapters/json'
import userFixture from '../fixtures/user'
import {
  PRIV_CREATE,
  PRIV_READ,
  PRIV_UPDATE,
  PRIV_DELETE
} from '../../src/constants'

describe('netiam-contrib', () => {
  describe('ACL - JSON Adapter', () => {
    const adapter = jsonAdapter({dir: './test/fixtures/acl'})

    it('should initialize JSON adapter', done => {
      adapter.initialized
        .then(() => done())
        .catch(done)
    })

    it('filter document', done => {
      adapter
        .filter(userFixture.data, userFixture, 'user', 'USER', PRIV_READ)
        .then(data => {
          data.should.be.Object()
          data.attributes.should.be.Object()
          data.attributes.should.have.properties(['email', 'username'])
        })
        .then(() => done())
        .catch(done)
    })

  })
})
