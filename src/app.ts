import config from 'config'
import express from 'express'
import deserializeUser from './middleware/deserializeUser'
import routes from './routes'
import connect from './utils/connect'
import logger from './utils/logger'

const port = config.get<number>('port')

const app = express()

app.use(express.json()) // apply middleware to every route. parse req.body/JSON data from HTTP request, otherwise i.e. create user error: expected object, but recieve undefined

app.use(deserializeUser) // attach user to res.locals.user

app.listen(port, async () => {
  logger.info(`App is running at localhost:${port}`)
  //   console.log('Server is running')
  await connect()
  //
  routes(app)
})
