import { logger, loggerProcess } from '../utils/logger.js'
import handleSite from './siteHandler.js'
import handleLocation from './locationHandler.js'
import handleGateway from './gatewayHandler.js'
import combinedHandler from './meterHandler.js'
import influxHandler from './influxHandler.js'
import { getInfluxClient } from '../utils/db/connectInfluxDb.js'

const mqttHandler = async (topic, message) => {
  try {
    const [siteName, locationName, gatewayName, meterName] = topic.split('/')

    loggerProcess.process(
      `Processing site: ${siteName}, location: ${locationName}, gateway: ${gatewayName}, and meter: ${meterName}`
    )

    const siteDoc = await handleSite(siteName)
    const locationDoc = await handleLocation(locationName, siteDoc)
    const gatewayDoc = await handleGateway(gatewayName, locationDoc, topic)
    const result = await combinedHandler(meterName, gatewayDoc, message)

    loggerProcess.process(
      `Finished processing site: ${siteName}, location: ${locationName}, gateway: ${gatewayName}, and meter: ${meterName}`
    )
    if (result.success) {
      const meterDocument = result.meterDoc
      const influxClient = await getInfluxClient()

      if (influxClient) {
        influxHandler(message, meterDocument, influxClient)
      }
    }
  } catch (error) {
    logger.error(`Error in processMqtt: ${error.message}`)
  }
}

export default mqttHandler
