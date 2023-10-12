import dotenv from 'dotenv'
import winston from 'winston'

dotenv.config()

const { combine, timestamp, label, printf, colorize } = winston.format

const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
}

const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'blue'
}

winston.addColors(logColors)

const customFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`
})

const logger = winston.createLogger({
  levels: logLevels,
  level: process.env.LOG_LEVEL || 'debug',
  format: combine(
    label({ label: 'MQTT-Listener' }),
    timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    customFormat
  ),
  defaultMeta: { service: 'mqtt-listener' },
  transports: [
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: combine(timestamp(), customFormat),
      handleExceptions: true
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: combine(timestamp(), customFormat)
    }),
    new winston.transports.File({
      filename: 'logs/warnings.log',
      level: 'warn',
      format: combine(timestamp(), customFormat),
      handleExceptions: true
    })
  ]
})

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: combine(colorize({ all: true }), timestamp(), customFormat),
      handleExceptions: true
    })
  )
}

process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled Rejection at promise: ${promise}. Reason: ${reason}.`)
})

logger.exceptions.handle(
  new winston.transports.File({ filename: 'logs/exceptions.log' }),
  new winston.transports.Console({
    format: combine(colorize(), timestamp(), customFormat)
  })
)

export default logger
