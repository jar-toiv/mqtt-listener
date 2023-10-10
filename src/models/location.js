import mongoose from 'mongoose'

const locationSchema = new mongoose.Schema(
  {
    locationId: String,
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

const Location = mongoose.model('Location', locationSchema)
export default Location
