import mqtt from 'mqtt'
import CONFIG from './config.js'
import AUTH from './authentication.js'
import { logger, loggerProcess } from './logger.js'
import processMqtt from '../mqtt/processMqtt.js'

let retryCount = 0
const maxRetries = 3

const handleReconnect = client => {
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

const connectBroker = () => {
  const client = mqtt.connect(CONFIG.MQTT_GATEWAY_URI, {
    username: AUTH.MQTT_USERNAME,
    password: AUTH.MQTT_PASSWORD,
    rejectUnauthorized: true
  })

  client.on('connect', () => {
    loggerProcess.initProcess(
      `Connected to broker @ ${CONFIG.MQTT_GATEWAY_URI}`
    )
    client.subscribe('#', err => {
      if (!err) {
        loggerProcess.initProcess('Subscribed to all topics')
      } else {
        logger.error(`Subscription error: ${err.message}`)
      }
    })
    retryCount = 0
  })

  client.on('error', error => {
    logger.error(`MQTT Client Error: ${error.message}`)
    handleReconnect()
  })

  client.on('offline', () => {
    logger.warn('MQTT Client is offline')
  })

  client.on('reconnect', () => {
    loggerProcess.process('Attempting to reconnect to MQTT Broker')
    retryCount = 0
  })

  client.on('close', () => {
    logger.warn('MQTT Client connection closed')
  })

  client.on('message', (topic, message) => {
    console.log(topic)
    processMqtt(topic, message)
  })
}
export default connectBroker
