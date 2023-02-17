// DB Connection
import config from 'config'
import mongoose from 'mongoose'
import logger from './logger'

mongoose.set('strictQuery', false)

// function connect() {
//   const dbUri = config.get<string>('dbUri')

//   return mongoose
//     .connect(dbUri)
//     .then(() => {
//       console.log('Connected to DB')
//     })
//     .catch((error) => {
//       console.log('Could not connect to DB')
//       process.exit()
//     })
// }

async function connect() {
  const dbUri = config.get<string>('dbUri')

  try {
    await mongoose.connect(dbUri)
    // console.log('Connected to DB')
    logger.info(`Connected to DB`)
  } catch (error) {
    // console.log('Could not connect to DB')
    logger.error(`Could not connect to DB`)
    process.exit()
  }
}

export default connect
