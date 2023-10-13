import { logger, loggerProcess } from './utils/logger.js'
import processMqtt from './mqtt/processMqtt.js'

const app = client => {
  client.on('connect', () => {
    client.subscribe('#')
    loggerProcess.process('Subbed to all topics')
  })

  client.on('message', async (topic, message) => {
    try {
      processMqtt(topic, message)
    } catch (error) {
      logger.error('ERROR', error.message)
    }
  })

  client.on('error', error => {
    logger.error('MQTT Client Error:', error.message)
  })
}

export default app
