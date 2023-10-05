import { connect } from 'mqtt'
import { connect as _connect } from 'mongoose'
import flattenJsonData from './utils/flattenJsonData.js'
import WaterflowMeter from './models/waterflowMeter.js'

const MONGO_URI = process.env.MONGO_URI
const MQTT_PUBLISHER_URL = 'mqtt://localhost:1883'
const MQTT_USERNAME = 'admin'
const MQTT_PASSWORD = 'admin'

//! CONNECT TO DATABASE USING CON STRING
async function connectToDatabase() {
  try {
    await _connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    console.log('Successfully connected to the sensorDataDB database')
  } catch (error) {
    console.error('Error connecting to the sensorDataDB database:', error)
  }
}
connectToDatabase()

//! START SERVER AND CONNECT URL + AUTHENTICATE
const client = connect(MQTT_PUBLISHER_URL, {
  username: MQTT_USERNAME,
  password: MQTT_PASSWORD
})

//! SUBSCRIBE
client.on('connect', () => {
  console.log(`Connected to MQTT Publisher IP address: ${MQTT_PUBLISHER_URL}`)
  client.subscribe('#')
  console.log('Subscripted to all topics')
})

//! MODIFY DATA AND INSERT INTO DB IF ALL GOOD
client.on('message', async (topic, message) => {
  try {
    const payloadStr = message.toString()
    const payload = JSON.parse(payloadStr)
    const flattenedPayload = flattenJsonData(payload)
    console.log('Flattened Payload CHECK:', flattenedPayload)
    console.log('THIS IS DEVICE ID', payload.deviceId)

    if (!flattenedPayload.deviceId) {
      console.error('Missing deviceId in the payload')
      return
    }

    // If no match from DB, creates a new one with save()
    const updatedMeter = await WaterflowMeter.findOneAndUpdate(
      { deviceId: flattenedPayload.deviceId },
      flattenedPayload,
      { new: true, upsert: true }
    )

    if (updatedMeter) {
      console.log(
        `Successfully upserted data for deviceId ${flattenedPayload.deviceId}`
      )
    }
  } catch (error) {
    console.error('ERROR', error.message)
  }
})

client.on('error', error => {
  console.error('MQTT Client Error:', error.message)
})
