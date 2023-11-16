import mongoose from 'mongoose'
import { logger } from '../utils/logger.js'

const CONNECTION_TYPES = ['wireless', 'wired']

const WaterflowSchema = new mongoose.Schema(
  {
    meterId: {
      type: String,
      required: [true, 'Meter Id is required']
    },
    meterName: {
      type: String,
      required: true,
      trim: true,
      minlength: [1, 'meterName cannot be empty'],
      validate: {
        validator: function (value) {
          return typeof value === 'string'
        },
        message: props => `Invalid meterName provided: ${props.value}`
      }
    },
    gatewayId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gateway'
    },
    connection: {
      type: String,
      enum: {
        values: CONNECTION_TYPES,
        message: 'Invalid connection type.'
      },
      default: 'wired'
    },
    sensorType: {
      type: String,
      default: 'waterflow'
    },
    meterDateTime: {
      type: Date
    },
    savedDateOfReadout: {
      type: Date
    },
    instantaneousVolume: {
      type: Number
    },
    savedVolume: {
      type: Number
    },
    measurementTime: {
      type: Number
    },
    flowRate: {
      type: Number,
      validate: {
        validator: function (v) {
          return v !== 0
        },
        message: 'Flow rate is zero. Action might be required.'
      }
    },
    currentEventFlags: {
      maximumFlow: { type: Boolean, default: false },
      minimumFlow: { type: Boolean, default: false },
      reverseFlow: { type: Boolean, default: false },
      noFlow: { type: Boolean, default: false },
      leakage: { type: Boolean, default: false },
      meterDisconnection: { type: Boolean, default: false },
      magneticFieldDetection: { type: Boolean, default: false },
      strongLightDetection: { type: Boolean, default: false },
      lowBattery: { type: Boolean, default: false },
      tipError: { type: Boolean, default: false },
      detectorFault: { type: Boolean, default: false },
      processorReset: { type: Boolean, default: false }
    },
    diagnostics: {
      optics: {
        type: String,
        validate: {
          validator: function (v) {
            return v === 'Normal'
          },
          message: 'Optics diagnostics not normal. Potential blockage or mist.'
        }
      },
      oscillator: {
        type: String
      },
      powerSupply: {
        type: String,
        validate: {
          validator: function (v) {
            return v === 'M-Bus'
          },
          message:
            'Power supply issue detected. Potential problem with publisher.'
        }
      }
    }
  },
  {
    collection: 'meters',
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

WaterflowSchema.virtual('id').get(function () {
  return this._id.toHexString()
})

WaterflowSchema.post('save', function (doc) {
  const flags = doc.currentEventFlags
  const meterId = doc.meterId
  for (let flag in flags) {
    if (
      Object.prototype.hasOwnProperty.call(flags, flag) &&
      typeof flags[flag] === 'boolean' &&
      flags[flag] === true
    ) {
      logger.warn(
        `ALERT: The flag for ${flag} is raised for Meter ID: ${meterId}. Object ID: ${doc._id} `
      )
    }
  }
})

const WaterflowMeter = mongoose.model('WaterflowMeter', WaterflowSchema)

export { WaterflowMeter }
