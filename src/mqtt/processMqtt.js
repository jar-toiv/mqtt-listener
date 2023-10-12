import logger from '../utils/logger.js'
import handleSite from './siteHandler.js'
import handleLocation from './locationHandler.js'
import handleGateway from './gatewayHandler.js'
import combinedHandler from './meterHandler.js'

const topicUpdater = async (topic, message) => {
  try {
    const [siteName, locationName, gatewayName, meterName] = topic.split('/')

    logger.info(
      `Processing site: ${siteName}, location: ${locationName}, gateway: ${gatewayName}, and meter: ${meterName}`
    )

    const siteDoc = await handleSite(siteName)
    const locationDoc = await handleLocation(locationName, siteDoc)
    const gatewayDoc = await handleGateway(gatewayName, locationDoc, topic)
    await combinedHandler(meterName, gatewayDoc, message)

    logger.info(
      `Finished processing site: ${siteName}, location: ${locationName}, gateway: ${gatewayName}, and meter: ${meterName}`
    )
  } catch (error) {
    logger.error(`Error in topicUpdater: ${error.message}`)
  }
}

export default topicUpdater
