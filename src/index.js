import dotenv from 'dotenv'
import mqtt from 'mqtt'

import CONFIG from './utils/config.js'
import AUTH_CONFIG from './utils/authentication.js'

import connectDb from './utils/connectDb.js'

dotenv.config()

connectDb()

const client = mqtt.connect(CONFIG.MQTT_GATEWAY_URI, {
  username: AUTH_CONFIG.MQTT_USERNAME,
  password: AUTH_CONFIG.MQTT_PASSWORD
})

client.on('connect', () => {
  if (process.env.NODE_ENV === 'development')
    return console.log('Connected to ', CONFIG.MQTT_GATEWAY_URI)

  console.log('Connected to Gateway')
})

client.on('error', err => {
  if (process.env.NODE_ENV === 'development')
    return console.error('Error when connecting to gateway:', err.message)

  console.log('Something went wrong')

  client.end()
  process.exit(1)
})
