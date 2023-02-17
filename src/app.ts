import config from 'config'
import express from 'express'
import routes from './routes'
import connect from './utils/connect'
import logger from './utils/logger'

const port = config.get<number>('port')

const app = express()

app.listen(port, async () => {
  logger.info(`App is running at localhost:${port}`)
  //   console.log('Server is running')
  await connect()
  //
  routes(app)
})
