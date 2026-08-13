import app from './app.js'
import { logger } from './utils/logger.js'

import connectDb from './utils/db/connectDb.js'
import connectInfluxDB from './utils/db/connectInfluxDb.js'

//¤ connectDb variables are enforced in config.js, but not connectInfluxDB
const initializeDBs = async () => {
  connectDb()

  try {
    await connectInfluxDB()
  } catch (error) {
    logger.error('InfluxDB connection failed', error.message)
  }
}

initializeDBs()
app()
