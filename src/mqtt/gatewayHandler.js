import Gateway from '../models/gateway.js'
import logger from '../utils/logger.js'

const handleGateway = async (gatewayName, locationDoc, topic) => {
  try {
    let gatewayDoc = await Gateway.findOne({ gatewayName: gatewayName })

    if (!gatewayDoc) {
      gatewayDoc = new Gateway({
        gatewayName: gatewayName,
        locationName: locationDoc._id,
        topic: topic
      })

      await gatewayDoc.save()
      logger.info(`Gateway: ${gatewayName} saved succesfully`)

      locationDoc.gatewayIds.push(gatewayDoc._id)
      await locationDoc.save()

      logger.info(
        `Gateway: ${gatewayName} linked to Location: ${locationDoc.locationName}.`
      )
    }
    return gatewayDoc
  } catch (error) {
    if (error.name === 'ValidationError') {
      logger.error(`Validation Error: ${error.message}`)
    } else {
      const errMsg = `Error in handleGateway for gatewayName: ${gatewayName}: ${error.message}`
      logger.error(errMsg)
    }
    return null
  }
}

export default handleGateway
