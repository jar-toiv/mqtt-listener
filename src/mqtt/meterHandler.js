import { WaterflowMeter } from '../models/waterflowMeter.js'
import { logger, loggerProcess } from '../utils/logger.js'

const jsonParser = message => {
  try {
    return JSON.parse(message.toString())
  } catch (error) {
    logger.error(
      `Failed to parse the message: ${message}, Error: ${error.message}`
    )
  }
  return { success: false, reason: 'Failed to parse message' }
}

const validateParams = (meterName, gatewayDoc, messageJSON) => {
  let missingParams = []

  if (!meterName) missingParams.push('meterName')
  if (!gatewayDoc) missingParams.push('gatewayDoc')
  if (!messageJSON) missingParams.push('messageJson')

  return missingParams
}

const handleMeter = async (meterName, gatewayDoc, messageJSON) => {
  let meterId = messageJSON.meterId
  const missingParams = validateParams(meterName, gatewayDoc, messageJSON)

  if (missingParams.length > 0) {
    const missing = missingParams.join(', ')
    logger.error(`Missing parameters: ${missing}`)
    return { success: false, reason: `Missing parameters: ${missing}` }
  }

  try {
    let meterDoc = await WaterflowMeter.findOne({
      meterId: meterId,
      gatewayId: gatewayDoc._id
    })

    if (!meterDoc) {
      meterDoc = new WaterflowMeter({
        meterId: meterId,
        meterName: meterName,
        gatewayId: gatewayDoc._id
      })
      loggerProcess.initProcess(
        `New meter ${meterName} initialized and saved successfully. Manufacterer ID: ${meterDoc.meterId}`
      )
    }

    for (let key in messageJSON) {
      meterDoc[key] = messageJSON[key]
    }
    await meterDoc.validate()
    await meterDoc.save()

    const isMeterLinked = gatewayDoc.meterIds.some(id =>
      id.equals(meterDoc._id)
    )

    if (!isMeterLinked) {
      gatewayDoc.meterIds.push(meterDoc._id)
      await gatewayDoc.save()

      loggerProcess.initProcess(
        `Meter: ${meterName} linked to Gateway: ${gatewayDoc.gatewayName}.`
      )
    }

    return { success: true, meterDoc: meterDoc }
  } catch (error) {
    if (error.name === 'ValidationError') {
      logger.error(`Validation Error: ${error.message}`)
    } else {
      const errMsg = `Error in meterHandler for MeterName ${meterName}, Gateway ${gatewayDoc?.gatewayName}, Error: ${error.message}`
      logger.error(errMsg)
      return { success: false, reason: error.message }
    }
  }
}

const combinedHandler = async (meterName, gatewayDoc, message) => {
  const messageJSON = jsonParser(message)

  if (messageJSON) {
    const result = await handleMeter(meterName, gatewayDoc, messageJSON)
    if (result.success) {
      return result
    } else {
      logger.error(`Handling meter failed: ${result.reason}`)
      return result
    }
  } else {
    return { success: false, reason: 'Failed to parse message' }
  }
}

export default combinedHandler
