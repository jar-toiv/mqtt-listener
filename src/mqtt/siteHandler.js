import Site from '../models/site.js'
import { logger, loggerProcess } from '../utils/logger.js'

const handleSite = async siteName => {
  try {
    let siteDoc = await Site.findOne({ siteName: siteName })

    if (!siteDoc) {
      siteDoc = new Site({ siteName: siteName })
      await siteDoc.save()
      loggerProcess.initProcess(`Site: ${siteName} saved successfully.`)
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
