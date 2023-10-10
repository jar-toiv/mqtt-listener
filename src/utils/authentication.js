import dotenv from 'dotenv'
dotenv.config()

const AUTHENTICATION = {
  MQTT_USERNAME: process.env.MQTT_USERNAME,
  MQTT_PASSWORD: process.env.MQTT_PASSWORD
}

export default AUTHENTICATION
