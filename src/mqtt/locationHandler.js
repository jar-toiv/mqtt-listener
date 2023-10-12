import Location from '../models/location.js'
import logger from '../utils/logger.js'

const handleLocation = async (locationName, siteDoc) => {
  try {
    let locationDoc = await Location.findOne({ locationName: locationName })

    if (!locationDoc) {
      locationDoc = new Location({
        locationName: locationName,
        siteName: siteDoc._id
      })

      await locationDoc.save()
      logger.info(`Location: ${locationName} saved successfully`)

      siteDoc.locationIds.push(locationDoc._id)
      await siteDoc.save()

      logger.info(
        `Location: ${locationName} linked to Site: ${siteDoc.siteName}.`
      )
    }

    return locationDoc
  } catch (error) {
    if (error.name === 'ValidationError') {
      logger.error(`Validation Error: ${error.message}`)
    } else {
      const errMsg = `Error in handleLocation for locationName ${locationName}: ${error.message}`
      logger.error(errMsg)
    }
    return null
  }
}

export default handleLocation
