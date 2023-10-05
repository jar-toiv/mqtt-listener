const mongoose = require('mongoose');

const CONNECTION_TYPES = ['wired', 'wireless'];

const WaterflowMeterSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
    },
    gatewayIdentifier: {
      type: String,
      default: 'Teltonika_TRB143',
    },
    connection: {
      type: String,
      enum: {
        values: CONNECTION_TYPES,
        message: 'Invalid connection type.',
      },
      default: 'wired',
    },
    sensorType: {
      type: String,
      default: 'waterflow',
    },
    deviceDateTime: {
      type: Date,
      required: true,
    },
    savedDateOfReadout: {
      type: Date,
      required: true,
    },
    instantaneousVolume: {
      type: Number,
      required: true,
    },
    savedVolume: {
      type: Number,
      required: true,
    },
    measurementTime: {
      type: Number,
      required: true,
    },
    flowRate: {
      type: Number,
      validate: {
        validator: function (v) {
          return v !== 0;
        },
        message: 'Flow rate is zero. Action might be required.',
      },
    },
    'currentEventFlags.maximumFlow': {
      type: Boolean,
      default: false,
    },
    'currentEventFlags.minimumFlow': {
      type: Boolean,
      default: false,
    },
    'currentEventFlags.reverseFlow': {
      type: Boolean,
      default: false,
    },
    'currentEventFlags.noFlow': {
      type: Boolean,
      default: false,
    },
    'currentEventFlags.leakage': {
      type: Boolean,
      default: false,
    },
    'currentEventFlags.deviceDisconnection': {
      type: Boolean,
      default: false,
    },
    'currentEventFlags.magneticFieldDetection': {
      type: Boolean,
      default: false,
    },
    'currentEventFlags.strongLightDetection': {
      type: Boolean,
      default: false,
    },
    'currentEventFlags.lowBattery': {
      type: Boolean,
      default: false,
    },
    'currentEventFlags.tipError': {
      type: Boolean,
      default: false,
    },
    'currentEventFlags.detectorFault': {
      type: Boolean,
      default: false,
    },
    'currentEventFlags.processorReset': {
      type: Boolean,
      default: false,
    },
    'diagnostics.optics': {
      type: String,
      validate: {
        validator: function (v) {
          return v === 'Normal';
        },
        message: 'Optics diagnostics not normal. Potential blockage or mist.',
      },
    },
    'diagnostics.oscillator': {
      type: String,
    },
    'diagnostics.powerSupply': {
      type: String,
      validate: {
        validator: function (v) {
          return v === 'M-Bus';
        },
        message:
          'Power supply issue detected. Potential problem with publisher.',
      },
    },
  },
  {
    collection: 'meters',
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: function (doc, ret) {
        delete ret._id;
      },
    },
  }
);

WaterflowMeterSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

WaterflowMeterSchema.post('findOneAndUpdate', function (doc) {
  const warningMessages = {
    'currentEventFlags.noFlow': 'No Flow detected',
    'currentEventFlags.leakage': 'Possible leakage in system',
    'currentEventFlags.deviceDisconnection': 'Device Disconnection detected',
    'currentEventFlags.magneticFieldDetection':
      'Magnetic Field Detection detected',
    'currentEventFlags.strongLightDetection': 'Strong Light Detection detected',
    'currentEventFlags.lowBattery': 'Low Battery detected',
    'currentEventFlags.tipError': 'Tip Error detected',
    'currentEventFlags.detectorFault': 'Detector Fault detected',
    'currentEventFlags.processorReset': 'Processor Reset detected',
    'currentEventFlags.maximumFlow': 'Maximum Flow detected',
    'currentEventFlags.minimumFlow': 'Minimum Flow detected',
    'currentEventFlags.reverseFlow': 'Reverse Flow detected',
  };

  for (let flag in warningMessages) {
    console.log(`Checking flag: ${flag} with value: ${doc.get(flag)}`);
    if (doc.get(flag)) {
      console.warn(
        `Warning: ${warningMessages[flag]} from sensor ID: ${doc.deviceId}`
      );
    }
  }
});

const WaterflowMeter = mongoose.model('WaterflowMeter', WaterflowMeterSchema);

module.exports = WaterflowMeter;
