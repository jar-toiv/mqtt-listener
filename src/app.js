import flattenJsonData from './utils/flattenJsonData.js'
import meter from './mqtt/meterUpdater.js'
import gateway from './mqtt/gatewayUpdater.js'
import location from './mqtt/locationUpdater.js'
import site from './mqtt/siteUpdater.js'

const app = client => {
  client.on('connect', () => {
    client.subscribe('#')
    console.log('Subbed to all topics')
  })

  client.on('message', async (topic, message) => {
    try {
      const payloadStr = message.toString()
      // console.log('Received payload:', payloadStr)
      const payload = JSON.parse(payloadStr)
      const flattenedPayload = flattenJsonData(payload)
      //   console.log('Flattened Payload CHECK:', flattenedPayload)

      if (!flattenedPayload.deviceId) {
        console.error('Missing deviceId in the payload')
        return
      }

      meter(flattenedPayload)
      gateway(topic, flattenedPayload)
      location(topic)
      site(topic)
    } catch (error) {
      console.error('ERROR', error.message)
    }
  })

  client.on('error', error => {
    console.error('MQTT Client Error:', error.message)
  })
}

export default app
