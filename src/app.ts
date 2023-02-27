import config from 'config'
import routes from './routes'
import connect from './utils/connect'
import logger from './utils/logger'
import createServer from './utils/server'

const port = config.get<number>('port')

const app = createServer()

app.listen(port, async () => {
  // console.log('Server is running')
  logger.info(`App is running at localhost:${port}`)
  await connect()
  //
  // routes(app) // ! moved to server.ts
})
