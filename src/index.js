import { logger, loggerProcess } from './utils/logger.js'
import dotenv from 'dotenv'
import mqtt from 'mqtt'
import app from './app.js'
import path from 'path'

import AUTHENTICATION from './utils/authentication.js'
import CONFIG from './utils/config.js'

import connectDb from './utils/connectDb.js'

dotenv.config({ path: path.resolve('.env') })

connectDb()

const client = mqtt.connect(CONFIG.MQTT_GATEWAY_URI, {
  username: AUTHENTICATION.MQTT_USERNAME,
  password: AUTHENTICATION.MQTT_PASSWORD
})

client.on('connect', () => {
  if (process.env.NODE_ENV === 'development')
    return loggerProcess.process('Connected to ' + CONFIG.MQTT_GATEWAY_URI)

  loggerProcess.process('Connected to Gateway')
})

let retryCount = 0
const maxRetries = 3

const handleReconnect = () => {
  retryCount++

  if (retryCount <= maxRetries) {
    setTimeout(() => {
      client.reconnect()
    }, 5000)
  } else {
    logger.error('Max retry attempts reached. Exiting.')
    client.end()
    process.exit(1)
  }
}

client.on('error', err => {
  if (process.env.NODE_ENV === 'development') {
    logger.error('Error when connecting to gateway:', err.message)
  }
  handleReconnect()
})

client.on('close', () => {
  logger.warn('Disconnected from the MQTT broker. Exiting for restart...')
  process.exit(1)
})

app(client)
