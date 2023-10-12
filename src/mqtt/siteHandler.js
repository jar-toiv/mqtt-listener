import Site from '../models/site.js'
import logger from '../utils/logger.js'

const handleSite = async siteName => {
  //! Could be removed if no regex is used. Schema has validation
  if (
    typeof siteName !== 'string' ||
    !siteName.trim() ||
    !/^[a-z]+-\d+$/i.test(siteName)
  ) {
    const errMsg = `Invalid siteName provided: ${siteName}`
    logger.error(errMsg)
    throw new Error(errMsg)
  }

  try {
    let siteDoc = await Site.findOne({ siteName: siteName })

    if (!siteDoc) {
      siteDoc = new Site({ siteName: siteName })
      await siteDoc.save()
      logger.info(`Site: ${siteName} saved successfully.`)
    }

    return siteDoc
  } catch (error) {
    if (error.name === 'ValidationError') {
      logger.error(`Validation Error: ${error.message}`)
    } else {
      const errMsg = `Error in handleLocation for Site: ${siteName}: ${error.message}`
      logger.error(errMsg)
    }
    return null
  }
}

export default handleSite
