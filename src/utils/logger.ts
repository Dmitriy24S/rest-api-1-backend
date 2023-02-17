import dayjs from 'dayjs'
import pino from 'pino'

const log = pino({
  //   prettyPrint: true,
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
  base: {
    pid: false,
  },
  timestamp: () => `,"time":"${dayjs().format()}"`,
})

export default log
