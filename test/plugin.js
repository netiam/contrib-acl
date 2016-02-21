import request from 'supertest'
import {
  setup,
  teardown
} from './utils/db'

describe('netiam-contrib', () => {

  before(setup)
  after(teardown)

})
