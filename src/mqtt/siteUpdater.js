import Site from '../models/site.js'
import Location from '../models/location.js'

const siteUpdater = async topic => {
  try {
    const parts = topic.split('/')
    const siteId = parts[0]
    const roomId = parts[1]

    const locationDoc = await Location.findOne({ roomId: roomId })
    if (!locationDoc) {
      console.error(`No location found for roomId: ${roomId}`)
      return
    }

    const filter = { siteId: siteId }
    const update = {
      $addToSet: { roomIds: locationDoc._id }
    }
    const options = {
      new: true,
      upsert: true,
      runValidators: true
    }

    const updatedSite = await Site.findOneAndUpdate(filter, update, options)
    if (updatedSite) {
      console.log(`Successfully updated/inserted site: ${siteId}`)
    }
  } catch (error) {
    console.error('ERROR', error.message)
  }
}
export default siteUpdater
