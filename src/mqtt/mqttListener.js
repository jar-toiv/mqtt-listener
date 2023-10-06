// import connect from 'mongoose'
import flattenJsonData from '../utils/flattenJsonData.js'
import WaterflowMeter from '../models/waterflowMeter.js'

//! SUBSCRIBE
const mqttListener = client => {
  client.on('connect', () => {
    client.subscribe('#')
    console.log('Subbed to all topics')
  })

  client.on('message', async (topic, message) => {
    try {
      const payloadStr = message.toString()
      console.log('Received payload:', payloadStr)
      const payload = JSON.parse(payloadStr)
      const flattenedPayload = flattenJsonData(payload)
      //   console.log('Flattened Payload CHECK:', flattenedPayload)

      if (!flattenedPayload.deviceId) {
        console.error('Missing deviceId in the payload')
        return
      }

      //If no match from DB, creates a new one with save()
      const updatedMeter = await WaterflowMeter.findOneAndUpdate(
        { deviceId: flattenedPayload.deviceId },
        flattenedPayload,
        { new: true, upsert: true }
      )

      if (updatedMeter) {
        console.log(
          `Successfully updated data for deviceId ${flattenedPayload.deviceId}`
        )
      }
    } catch (error) {
      console.error('ERROR', error.message)
    }
  })

  client.on('error', error => {
    console.error('MQTT Client Error:', error.message)
  })
}

export default mqttListener
