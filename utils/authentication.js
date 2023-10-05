import dotenv from 'dotenv'
dotenv.config()

const AUTH_CONFIG = {
  MQTT_USERNAME: process.env.MQTT_USERNAME,
  MQTT_PASSWORD: process.env.MQTT_PASSWORD
}

export default AUTH_CONFIG
