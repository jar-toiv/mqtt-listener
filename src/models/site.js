import mongoose from 'mongoose'

const siteSchema = new mongoose.Schema(
  {
    siteName: {
      type: String,
      required: true,
      trim: true,
      minlength: [1, 'siteNme cannot be empty'],
      validate: {
        validator: function (value) {
          return typeof value === 'string'
        },
        message: props => `Invalid siteName provided: ${props.value}`
      }
    },
    locationIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location'
      }
    ]
  },
  {
    collection: 'sites',
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
siteSchema.virtual('id').get(function () {
  return this._id.toHexString()
})

const Site = mongoose.model('Site', siteSchema)
export default Site
