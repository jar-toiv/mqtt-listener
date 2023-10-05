import CONFIG from './config.js'
import mongoose from 'mongoose'

const shutdown = async () => {
  console.log('Shutting down the application...')

  try {
    await mongoose.connection.close()
    console.log('Database connection closed.')
  } catch (err) {
    console.error('Error closing the database connection:', err)
  }

  process.exit(1)
}

const connectDB = async () => {
  try {
    await mongoose.connect(CONFIG.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    console.log('Successfully connected to the database')
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error connecting to the database:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        code: error.code
      })
    } else {
      console.error('Error connecting to the database:', error.message)
    }
    await shutdown()
  }
}

export default connectDB
