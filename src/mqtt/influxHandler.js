import { Point } from '@influxdata/influxdb-client'
import { logger, loggerProcess } from '../utils/logger.js'
import CONFIG from '../utils/config.js'

const { INFLUXDB_ORGANIZATION: org, INFLUXDB_BUCKET: bucket } = CONFIG

const documentHandler = async (message, meterDocument) => {
  const messageJSON = JSON.parse(message.toString())
  const meterObjectIdString = meterDocument._id.toString()
  let meterSavedVolume = messageJSON.MBusData.DataRecord //! THIS NEEDS FIXING WHEN WE GET DATA FULLY

  console.log(meterSavedVolume)
  const point = new Point('measurement_waterflow')
    .tag('meter_obj_id', meterObjectIdString)
    .tag('meter_name', meterDocument.meterName)
    .tag('meter_id', messageJSON.meterId)
    .floatField('saved_volume', messageJSON.savedVolume)
    .timestamp(new Date())

  return point
}

const influxHandler = async (message, meterDocument, influxClient) => {
  try {
    const points = await documentHandler(message, meterDocument)
    const writeApi = influxClient.getWriteApi(org, bucket, 'ms')

    writeApi.writePoint(points)
    await writeApi.close()

    loggerProcess.process('Data written to InfluxDB')
  } catch (error) {
    logger.error(`Error in influxHandler: ${error.message}`, error)
  }
}

export default influxHandler
