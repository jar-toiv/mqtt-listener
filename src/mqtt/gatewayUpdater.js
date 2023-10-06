import Gateway from '../models/gateway.js'

const gatewayUpdater = async topic => {
  try {
    const filter = {
      gatewayId: 'Teltonika_TRB143_1'
    }
    const update = {
      topic: topic
    }
    const options = {
      new: true,
      upsert: true
    }
    const createTopic = await Gateway.findOneAndUpdate(filter, update, options)
    if (createTopic) {
      console.log('Succesfully updated topic')
    }

    console.log(topic)
  } catch (error) {
    console.error('ERROR', error.message)
  }
}

export default gatewayUpdater
