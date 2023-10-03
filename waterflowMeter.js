const mongoose = require('mongoose');

mongoose.connect('your_mongodb_connection_string', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const WaterflowDataSchema = new mongoose.Schema(
  {
    timestamp: {
      type: Date,
      default: Date.now,
    },
    deviceDateTime: {
      type: Date,
      required: true,
    },
    savedDateOfReadout: Date,
    instantaneousVolume: Number,
    savedVolume: Number,
    measurementTime: Number,
    flowRate: Number,
    currentEventFlags: {
      maximumFlow: Boolean,
      minimumFlow: Boolean,
      reverseFlow: Boolean,
      noFlow: Boolean,
      leakage: Boolean,
      deviceDisconnection: Boolean,
      magneticFieldDetection: Boolean,
      strongLightDetection: Boolean,
      lowBattery: Boolean,
      tipError: Boolean,
      detectorFault: Boolean,
      processorReset: Boolean,
    },
    diagnostics: {
      optics: String,
      oscillator: String,
      powerSupply: String,
    },
  },
  {
    collection: 'meters',
  }
);

const WaterflowMeterSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    unique: true,
  },
  data: [WaterflowDataSchema],
});

const WaterflowMeter = mongoose.model('WaterflowMeter', WaterflowMeterSchema);

module.exports = WaterflowMeter;
