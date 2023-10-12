import processMqtt from './mqtt/processMqtt.js'

const app = client => {
  client.on('connect', () => {
    client.subscribe('#')
    console.log('Subbed to all topics')
  })

  client.on('message', async (topic, message) => {
    try {
      processMqtt(topic, message)
    } catch (error) {
      console.error('ERROR', error.message)
    }
  })

  client.on('error', error => {
    console.error('MQTT Client Error:', error.message)
  })
}

export default app
