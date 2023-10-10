import mongoose from 'mongoose'

const siteSchema = new mongoose.Schema(
  {
    siteId: {
      type: String,
      required: true
    },
    // city: String,
    // address: {
    //   type: String,
    //   required: true
    // },
    // description: String,
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

const Site = mongoose.model('Site', siteSchema)
export default Site
