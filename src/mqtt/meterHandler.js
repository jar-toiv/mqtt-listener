import { WaterflowMeter } from '../models/waterflowMeter.js'
import { logger, loggerProcess } from '../utils/logger.js'

const jsonParser = message => {
  try {
    return JSON.parse(message.toString()) //! Remove JsonParser if publisher sends JSON
  } catch (error) {
    logger.error(`Failed to parse the message: ${message}`)
  }
  return null
}

const handleMeter = async (meterName, gatewayDoc, messageJSON) => {
  if (!messageJSON.meterId || !gatewayDoc) {
    logger.error(`Missing meterId or GatewayDoc`)
    return null
  }

  let meterDoc = await WaterflowMeter.findOne({
    meterId: messageJSON.meterId
  })

  if (!meterDoc) {
    meterDoc = new WaterflowMeter({
      meterId: messageJSON.meterId,
      meterName: meterName,
      gatewayId: gatewayDoc._id
    })
    loggerProcess.initProcess(
      `New meter ${meterName} initialized and linked to gateway ${gatewayDoc.gatewayName}.`
    )
  }

  for (let key in messageJSON) {
    meterDoc[key] = messageJSON[key]
  }

  try {
    await meterDoc.validate()
    await meterDoc.save()

    gatewayDoc.meterIds.push(meterDoc._id)
    await gatewayDoc.save()
  } catch (error) {
    if (error.name === 'ValidationError') {
      logger.error(`Validation Error: ${error.message}`)
    } else {
      const errMsg = `Error in meterHandler for MeterName ${meterName}: ${error.message}`
      logger.error(errMsg)
    }
    return null
  }
}

const combinedHandler = async (meterName, gatewayDoc, message) => {
  const messageJSON = jsonParser(message)
  if (messageJSON) {
    await handleMeter(meterName, gatewayDoc, messageJSON)
  }
}

export default combinedHandler
