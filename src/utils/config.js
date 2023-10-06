import dotenv from 'dotenv'
dotenv.config()

const CONFIG = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT,
  MQTT_GATEWAY_URI: process.env.MQTT_GATEWAY_URI,
  MONGO_URI: process.env.MONGO_URI
}

export default CONFIG
