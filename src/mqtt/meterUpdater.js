import WaterflowMeter from '../models/waterflowMeter.js'

const meterUpdater = async flattenedPayload => {
  try {
    const updatedMeter = await WaterflowMeter.findOneAndUpdate(
      { deviceId: flattenedPayload.deviceId },
      flattenedPayload,
      { new: true, upsert: true }
    )

    if (updatedMeter) {
      console.log(
        `Successfully updated data for deviceId ${flattenedPayload.deviceId}`
      )
    }
  } catch (error) {
    console.error('ERROR', error.message)
  }
}
export default meterUpdater
