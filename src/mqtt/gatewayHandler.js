import Gateway from '../models/gateway.js'
import { logger, loggerProcess } from '../utils/logger.js'

const handleGateway = async (gatewayName, locationDoc, topic) => {
  try {
    let gatewayDoc = await Gateway.findOne({ gatewayName: gatewayName })

    if (!gatewayDoc) {
      gatewayDoc = new Gateway({
        gatewayName: gatewayName,
        locationId: locationDoc._id,
        topic: topic
      })

      await gatewayDoc.save()
      loggerProcess.initProcess(`Gateway: ${gatewayName} saved successfully`)

      const isGatewayLinked = locationDoc.gatewayIds.some(id =>
        id.equals(gatewayDoc._id)
      )

      if (!isGatewayLinked) {
        locationDoc.gatewayIds.push(gatewayDoc._id)
        await locationDoc.save()

        loggerProcess.initProcess(
          `Gateway: ${gatewayName} linked to Location: ${locationDoc.locationName}.`
        )
      }
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
