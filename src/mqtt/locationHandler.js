import Location from '../models/location.js'
import { logger, loggerProcess } from '../utils/logger.js'

const handleLocation = async (locationName, siteDoc) => {
  try {
    let locationDoc = await Location.findOne({ locationName: locationName })

    if (!locationDoc) {
      locationDoc = new Location({
        locationName: locationName,
        siteId: siteDoc._id
      })

      await locationDoc.save()
      loggerProcess.initProcess(`Location: ${locationName} saved successfully`)

      siteDoc.locationIds.push(locationDoc._id)
      await siteDoc.save()

      loggerProcess.initProcess(
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
