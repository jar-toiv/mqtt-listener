import { logger } from './logger.js'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: path.resolve('.env') })
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
