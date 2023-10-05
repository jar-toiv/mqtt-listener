import dotenv from 'dotenv'
dotenv.config()

const CONFIG = {
  PORT: process.env.PORT || 8883,
  MQTT_GATEWAY_URI: process.env.MQTT_GATEWAY_URI,
  MONGO_URI: process.env.MONGO_URI
}

export default CONFIG
