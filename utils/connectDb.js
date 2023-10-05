import CONFIG from './config'
import { connect } from 'mongoose'

const connectDB = async function connectToDatabase() {
  try {
    await connect(CONFIG.MONGO_URI, {
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
  }
}

export default connectDB
