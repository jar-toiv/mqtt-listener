import mqttListener from './mqtt/mqttListener.js'

const app = client => {
  mqttListener(client)
}

export default app
