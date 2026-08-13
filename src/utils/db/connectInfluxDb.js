import { InfluxDB } from '@influxdata/influxdb-client'
import axios from 'axios'
import { logger, loggerProcess } from '../logger.js'
import CONFIG from '../config.js'

const { INFLUXDB_TOKEN: token, INFLUXDB_HOST: url } = CONFIG

const handleError = error => {
  const errorInfo =
    CONFIG.NODE_ENV === 'development'
      ? {
        message: error.message,
        name: error.name,
        stack: error.stack,
        code: error.code
      }
      : error.message

  logger.error('Error', errorInfo)
}

const performHealthCheck = async client => {
  try {
    const response = await axios.get(`${url}/health`)
    if (response.status !== 200) {
      throw new Error('Failed InfluxDB health check')
    }
    loggerProcess.process('InfluxDB health check passed')
  } catch (error) {
    handleError(error)
    if (client) {
      setTimeout(() => {
        performHealthCheck(client)
      }, 18000000) // 30 min
    }
  }
}

const connectInfluxDB = async () => {
  if (!url || !token) {
    const missing = !url ? 'URL' : 'TOKEN'
    throw new Error(`Error: Influx missing ${missing}`)
  }

  try {
    const client = new InfluxDB({ url, token })
    await performHealthCheck(client)
    setInterval(() => performHealthCheck(client), 600000)

    return client
  } catch (error) {
    handleError(error)
    return null
  }
}

export default connectInfluxDB
