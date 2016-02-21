import express from 'express'
import netiam from 'netiam'
import {plugins} from './api'

export default function(app) {

  const router = express.Router()

  router.get(
    '/users',
    netiam({plugins})
      .auth({
        userModel: User,
        tokenModel: Token
      })
      .acl.req({acl})
      .transform((req, res) => res.body = req.user)
      .json()
  )

  router.post(
    '/users',
    netiam({plugins})
      .auth({
        userModel: User,
        tokenModel: Token
      })
      .acl.req({acl})
      .transform((req, res) => res.body = req.user)
      .json()
  )

  app.use('/', router)

}
