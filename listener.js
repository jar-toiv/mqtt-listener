const mqtt = require('mqtt');
require('dotenv').config();
const MONGO_URI = process.env.MONGO_URI;
const mongoose = require('mongoose');
const TestMeter = require('./testMeter.js');

const MQTT_PUBLISHER_URL = 'mqtt://localhost:1883';
const MQTT_USERNAME = 'admin';
const MQTT_PASSWORD = 'admin';

console.log(MONGO_URI);

async function connectToDatabase() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Successfully connected to the database');

    // Inserting dummy data after successful connection
    const testMeterInstance = new TestMeter({
      ID: 'dummyID12345',
    });

    await testMeterInstance.save(); // Using async/await here
    console.log('Dummy data saved successfully');
  } catch (error) {
    console.error('Error:', error);
  }
}
connectToDatabase();

const client = mqtt.connect(MQTT_PUBLISHER_URL, {
  username: MQTT_USERNAME,
  password: MQTT_PASSWORD,
});

client.on('connect', () => {
  console.log('Connected to MQTT broker');
  client.subscribe('meters/#');
});

client.on('message', (topic, message) => {
  console.log(`Received message on topic ${topic}: ${message.toString()}`);
});

client.on('error', (error) => {
  console.error('MQTT Client Error:', error);
});
