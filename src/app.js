import flattenJsonData from './utils/flattenJsonData.js'
import meter from './mqtt/meterUpdater.js'
import gateway from './mqtt/gatewayUpdater.js'

const app = client => {
  client.on('connect', () => {
    client.subscribe('#')
    console.log('Subbed to all topics')
  })

  client.on('message', async (topic, message) => {
    try {
      //gateway sends Topic string to gateway collection
      gateway(topic)

      const payloadStr = message.toString()
      // console.log('Received payload:', payloadStr)
      const payload = JSON.parse(payloadStr)
      const flattenedPayload = flattenJsonData(payload)
      //   console.log('Flattened Payload CHECK:', flattenedPayload)

      if (!flattenedPayload.deviceId) {
        console.error('Missing deviceId in the payload')
        return
      }
      // meter sends flattened JSON object to meters collection
      meter(flattenedPayload)
    } catch (error) {
      console.error('ERROR', error.message)
    }
  })

  client.on('error', error => {
    console.error('MQTT Client Error:', error.message)
  })
}

export default app
