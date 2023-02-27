import express from 'express'
import deserializeUser from '../middleware/deserializeUser'
import routes from '../routes'

function createServer() {
  const app = express()

  app.use(express.json()) // apply middleware to every route. parse req.body/JSON data from HTTP request, otherwise i.e. create user error: expected object, but recieve undefined

  app.use(deserializeUser) // attach user to res.locals.user

  routes(app)

  return app
}

export default createServer
