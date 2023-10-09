import Gateway from '../models/gateway.js'
import WaterflowMeter from '../models/waterflowMeter.js'

const updateOrInsertGatewayTopic = async (gatewayId, topic) => {
  const filter = {
    gatewayId
  }

  const update = {
    topic: topic
  }

  const options = {
    new: true,
    upsert: true,
    setDefaultsOnInsert: true,
    runValidators: true
  }
  return await Gateway.findOneAndUpdate(filter, update, options)
}

const linkMeterToGateway = async (gatewayId, flattenedPayload) => {
  const meterDoc = await WaterflowMeter.findOne({
    deviceId: flattenedPayload.deviceId
  })

  if (!meterDoc) {
    console.error(
      `No meterDoc found for deviceId: ${flattenedPayload.deviceId}`
    )
    return
  }

  const gatewayDoc = await Gateway.findOne({ gatewayId: gatewayId })

  if (!gatewayDoc) {
    console.error(`No Gateway found for gatewayId: ${gatewayId}`)
    return
  }

  const filter = {
    gatewayId: gatewayId
  }
  const update = {
    $addToSet: { deviceIds: meterDoc._id }
  }
  const options = {
    new: true,
    runValidators: true
  }

  return await Gateway.findOneAndUpdate(filter, update, options)
}

const gatewayUpdater = async (topic, flattenedPayload) => {
  try {
    const parts = topic.split('/')
    const gatewayId = parts[2]

    const updatedGatewayTopic = await updateOrInsertGatewayTopic(
      gatewayId,
      topic
    )
    if (updatedGatewayTopic) {
      console.log(
        `Successfully updated/inserted topic for gateway: ${gatewayId}`
      )
    }

    const linkedMeter = await linkMeterToGateway(gatewayId, flattenedPayload)
    if (linkedMeter) {
      console.log(
        `Successfully linked meter ${flattenedPayload.deviceId} to gateway: ${gatewayId}`
      )
    }
  } catch (error) {
    if (error.name === 'ValidationError') {
      console.error('Validation error:', error)
    } else {
      console.error('Unexpected error:', error.message)
    }
  }
}

export default gatewayUpdater
