import mongoose from 'mongoose'

const gatewaySchema = new mongoose.Schema(
  {
    gatewayId: {
      type: String,
      required: true
    },
    deviceIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WaterflowMeter',
        validate: [arrayDeviceLimit, `{PATH} exceeds the limit of 249 meters.`]
      }
    ]
  },
  {
    collection: 'gateways',
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: function (doc, ret) {
        delete ret._id
      }
    }
  }
)

gatewaySchema.virtual('id').get(function () {
  return this._id.toHexString()
})

function arrayDeviceLimit(val) {
  return val.lenght <= 249
}

const Gateway = mongoose.model('Gateway', gatewaySchema)
export default Gateway
