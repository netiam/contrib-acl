import bodyParser from 'body-parser'
import express from 'express'
import passport from 'passport'
import routes from './routes'

export default function() {
  const app = express()

  app.use(bodyParser.urlencoded({extended: true}))
  app.use(bodyParser.json())
  app.use(passport.initialize())

  routes(app)

  return app
}
