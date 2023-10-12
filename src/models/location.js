import mongoose from 'mongoose'

const locationSchema = new mongoose.Schema(
  {
    locationName: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function (value) {
          return typeof value === 'string' && value.trim().length > 0
        },
        message: props => `Invalid locationName provided: ${props.value}`
      }
    },
    siteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Site'
    },
    gatewayIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gateway'
      }
    ]
  },
  {
    collection: 'locations',
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

locationSchema.virtual('id').get(function () {
  return this._id.toHexString()
})

const Location = mongoose.model('Location', locationSchema)
export default Location
