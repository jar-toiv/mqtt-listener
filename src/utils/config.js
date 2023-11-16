import { logger } from './logger.js'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: path.resolve('.env') })

const requiredEnvVariables = ['NODE_ENV', 'MQTT_GATEWAY_URI', 'MONGO_URI']

for (const envVariable of requiredEnvVariables) {
  if (!process.env[envVariable] || process.env[envVariable].trim() === '') {
    logger.error(`${envVariable} is not defined in environment variables.`)
  }
}

const CONFIG = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  MQTT_GATEWAY_URI: process.env.MQTT_GATEWAY_URI,
  MONGO_URI: process.env.MONGO_URI,
  INFLUXDB_HOST: process.env.INFLUXDB_HOST,
  INFLUXDB_TOKEN: process.env.INFLUXDB_TOKEN,
  INFLUXDB_ORGANIZATION: process.env.INFLUXDB_ORGANIZATION,
  INFLUXDB_BUCKET: process.env.INFLUXDB_BUCKET
}

export default CONFIG
