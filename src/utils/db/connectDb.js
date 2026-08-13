import dns from 'dns'
import { logger, loggerProcess } from '../logger.js'
import CONFIG from '../config.js'
import mongoose from 'mongoose'
dns.setServers(['1.1.1.1', '8.8.8.8'])

const shutdown = async () => {
  logger.warning('Shutting down the application...')

  try {
    await mongoose.connection.close()
    logger.warning('Database connection closed.')
  } catch (err) {
    logger.error('Error, closing the database connection:', err)
  }

  process.exit(1)
}

const connectDB = async () => {
  try {
    await mongoose.connect(CONFIG.MONGO_URI)
    loggerProcess.process('Successfully connected to the database')
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      logger.error('Error connecting to the database:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        code: error.code
      })
    } else {
      logger.error('Error connecting to the database:', error.message)
    }
    await shutdown()
  }
}

export default connectDB
