import mongoose from 'mongoose'

const gatewaySchema = new mongoose.Schema(
  {
    gatewayId: {
      type: String, //! Huono idea?//! Huono idea?//! Huono idea?//! Huono idea?//! Huono idea?
      required: true,
      default: 'Teltonika_TRB143_1'
    },
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location'
    },
    deviceIds: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'WaterflowMeter'
        }
      ],
      validate: [arrayDeviceLimit, `{PATH} exceeds the limit of 249 meters.`]
    },
    topic: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^([^/]+)\/([^/]+)\/([^/]+)\/([^/]+)$/.test(v)
        },
        message: props => `${props.value} is not a valid topic structure!`
      }
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

function arrayDeviceLimit(val) {
  return val.length <= 249
}

const Gateway = mongoose.model('Gateway', gatewaySchema)
export default Gateway

gatewaySchema.add({
  locationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location'
  }
  // rest of the properties remain unchanged
})
