import Gateway from '../models/gateway.js'

const gatewayUpdater = async topic => {
  try {
    const parts = topic.split('/')
    const gatewayId = parts[2]

    const filter = {
      gatewayId: gatewayId
    }
    const update = {
      $addToSet: { deviceIds: deviceId }, // Adds the deviceId to the array only if it doesn't exist
      topic: topic
    }

    const options = {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      includeResultMetadata: true
    }

    const updatedTopic = await Gateway.findOneAndUpdate(filter, update, options)

    if (updatedTopic) {
      if (updatedTopic.isNew) {
        console.log('Inserted new topic:', topic)
      } else {
        console.log('Updated topic:', topic)
      }
    }
  } catch (error) {
    if (error.name === 'ValidationError') {
      console.error('Validation error:', error.message)
    } else {
      console.error('Unexpected error:', error.message)
    }
  }
}
export default gatewayUpdater
