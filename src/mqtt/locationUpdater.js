import Location from '../models/location.js'
import Site from '../models/site.js'

const locationUpdater = async topic => {
  console.log(topic)
  try {
    const parts = topic.split('/')
    const locationId = parts[1]

    const updatedLocation = await Location.findOneAndUpdate(
      { locationId: locationId },
      { locationId: locationId },
      { new: true, upsert: true, runValidators: true }
    )
    if (updatedLocation) {
      console.log(`Successfully updated/inserted location: ${locationId}`)
    }
  } catch (error) {
    console.error('ERROR', error.message)
  }
}
export default locationUpdater
