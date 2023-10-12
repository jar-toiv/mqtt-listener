import mongoose from 'mongoose'

const gatewaySchema = new mongoose.Schema(
  {
    gatewayName: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function (value) {
          return typeof value === 'string' && value.trim().length > 0
        },
        message: props => `Invalid gatewayName provided: ${props.value}`
      }
    },
    locationName: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location'
    },
    meterIds: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'WaterflowMeter'
        }
      ],
      validate: [arrayMeterLimit, `{PATH} exceeds the limit of 249 meters.`]
    },
    topic: {
      type: String,
      required: true
    }
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

function arrayMeterLimit(val) {
  return val.length <= 249
}

const Gateway = mongoose.model('Gateway', gatewaySchema)
export default Gateway
