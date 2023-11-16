import { WaterflowMeter } from '../models/waterflowMeter.js'
import { logger, loggerProcess } from '../utils/logger.js'

const jsonParser = message => {
  try {
    return JSON.parse(message.toString())
  } catch (error) {
    logger.error(`Failed to parse the message: ${message}`)
  }
  return { success: false, reason: 'Failed to parse message' }
}

const handleMeter = async (meterName, gatewayDoc, messageJSON) => {
  let meterId = messageJSON.MBusData.SlaveInformation.meterId
  try {
    const requiredParams = [
      { key: 'meterName', value: meterName },
      { key: 'gatewayDoc', value: gatewayDoc },
      { key: 'messageJSON', value: messageJSON }
    ]

    const missingParams = requiredParams
      .filter(param => !param.value)
      .map(param => param.key)

    if (missingParams.length > 0) {
      const missing = missingParams.join(', ')
      logger.error(`Missing parameters: ${missing}`)
      // return { success: false, reason: `Missing parameters: ${missing}` }
    }

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
      const errMsg = `Error in meterHandler for MeterName ${meterName}: ${error.message}`
      logger.error(errMsg)
      return { success: false, reason: error.message }
    }
  }
}

const combinedHandler = async (meterName, gatewayDoc, message) => {
  const messageJSON = jsonParser(message)

  if (messageJSON) {
    return await handleMeter(meterName, gatewayDoc, messageJSON)
  } else {
    return { success: false, reason: 'Failed to parse message' }
  }
}

export default combinedHandler
