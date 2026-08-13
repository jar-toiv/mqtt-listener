import { logger } from './logger.js'

const { MQTT_USERNAME, MQTT_PASSWORD } = process.env

if (!MQTT_USERNAME || !MQTT_PASSWORD) {
  logger.error(
    'Required environment variables are not set. Check MQTT_USERNAME and MQTT_PASSWORD.'
  )
  process.exit(1)
}

const AUTHENTICATION = {
  MQTT_USERNAME,
  MQTT_PASSWORD
}

export default AUTHENTICATION
