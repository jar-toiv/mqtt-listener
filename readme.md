# mqtt-listener

A proof of concept MQTT listener for a small IoT telemetry pipeline. It subscribes to an MQTT broker, reads water meter readings from the messages, and stores them in MongoDB and InfluxDB. This is not production code.

The listener is the second of four services. Two of the others are in their own repositories, and the fourth is a local server that feeds demo data.

```
MQTT client  -->  mqtt-broker  -->  mqtt-listener  -->  MongoDB + InfluxDB  -->  mqtt-sensor-dashboard
```

- [mqtt-broker](https://github.com/jar-toiv/mqtt-broker) receives the messages and passes them on.
- [mqtt-sensor-dashboard](https://github.com/jar-toiv/mqtt-sensor-dashboard) shows the stored readings in the browser.

The demo data is Apator water meter readings, captured as JSON through a Teltonika TRB143 gateway. Both devices were bought for testing.

## Status

- Works locally. A meter payload published with MQTT.fx has gone through the whole chain to MongoDB Atlas and InfluxDB Cloud.
- No live device is connected at the moment.
- There are no automated tests.

## What it does

For every MQTT message the listener does four things.

1. Splits the topic into site, location, gateway and meter.
2. Creates the site, location and gateway documents in MongoDB if they do not exist, and links each one to its parent.
3. Parses the JSON payload, validates it and saves it on the meter document.
4. Writes the saved volume to InfluxDB as a time-series point.

A warning is logged when any event flag on a meter is `true`, for example `leakage` or `reverseFlow`.

## Topic

Topics have four parts.

```
<site>/<location>/<gateway>/<meter>
katujenkatu-1/huone-201/teltonika-trb143-12345/waterflow
```

## Payload

The gateway sends the reading as flat JSON. The keys match the fields of the meter schema in [waterflowMeter.js](src/models/waterflowMeter.js).

```json
{
  "meterId": "APT-MBUS-NA-10-4",
  "meterDateTime": "2023-12-12T10:00:00.000Z",
  "savedDateOfReadout": "2023-11-09T00:00:00.000Z",
  "instantaneousVolume": 500.75,
  "savedVolume": 200,
  "measurementTime": 5,
  "flowRate": 10.5,
  "currentEventFlags": {
    "reverseFlow": true,
    "leakage": false,
    "lowBattery": false
  },
  "diagnostics": {
    "optics": "Normal",
    "oscillator": "Normal",
    "powerSupply": "M-Bus"
  }
}
```

The schema has twelve event flags. Three are shown here.

## Data model

| Model | Collection | Key fields |
|-------|------------|------------|
| `Site` | `sites` | `siteName`, `locationIds[]` |
| `Location` | `locations` | `locationName`, `siteId`, `gatewayIds[]`. Unique on `locationName` and `siteId`. |
| `Gateway` | `gateways` | `gatewayName`, `locationId`, `topic`, `meterIds[]`. At most 249 meters. |
| `WaterflowMeter` | `meters` | `meterId`, `meterName`, `gatewayId`, `connection`, `savedVolume`, `flowRate`, `currentEventFlags`, `diagnostics` |

## Running locally

You need a running MQTT broker, a MongoDB database and, if you want time-series data, an InfluxDB instance.

```bash
# Install dependencies
npm install

# Start the listener in development mode
npm run dev
```

Before the first run, create a file named `.env.development` in the project root. See the next section.

When the listener is running, the console shows lines like these.

```
Successfully connected to the database
Connected to broker @ mqtt://127.0.0.1:1883
Subscribed to all topics
```

## Environment variables

Example `.env.development`.

```env
NODE_ENV=development
MQTT_GATEWAY_URI=mqtt://127.0.0.1:1883
MQTT_USERNAME=
MQTT_PASSWORD=
MONGO_URI=
INFLUXDB_HOST=
INFLUXDB_TOKEN=
INFLUXDB_ORGANIZATION=
INFLUXDB_BUCKET=
```

| Variable | Required | Purpose |
|----------|----------|---------|
| `NODE_ENV` | Yes | `development` or `production`. Selects `.env.development` or `.env.production`. |
| `MQTT_GATEWAY_URI` | Yes | Address of the MQTT broker. |
| `MQTT_USERNAME`, `MQTT_PASSWORD` | Yes | Credentials for the broker. |
| `MONGO_URI` | Yes | MongoDB connection string. |
| `INFLUXDB_HOST`, `INFLUXDB_TOKEN` | No | InfluxDB address and API token. Without them the listener runs and skips InfluxDB. |
| `INFLUXDB_ORGANIZATION`, `INFLUXDB_BUCKET` | No | Where the points are written. |

A missing required variable stops the process at start-up with an error that names it.

## Logging

Logs are written with Winston to files under `logs/`.

| File | Content |
|------|---------|
| `logs/error.log` | Errors |
| `logs/warnings.log` | Warnings, for example meter event flags |
| `logs/process.log` | Processing events |
| `logs/initProcess.log` | First-time creation of sites, locations, gateways and meters |
| `logs/exceptions.log` | Uncaught exceptions |

In development mode the same events are also printed to the console.

## Project structure

```
src/
├── server.js                 # entry point, connects the databases and the broker
├── app.js                    # starts the broker connection
├── models/                   # Mongoose schemas
│   ├── site.js
│   ├── location.js
│   ├── gateway.js
│   └── waterflowMeter.js
├── mqtt/
│   ├── processMqtt.js        # runs the handlers for each message
│   ├── siteHandler.js
│   ├── locationHandler.js
│   ├── gatewayHandler.js
│   ├── meterHandler.js       # parses the payload and saves the meter
│   └── influxHandler.js      # writes a point to InfluxDB
└── utils/
    ├── config.js             # loads the env file and checks required variables
    ├── authentication.js     # checks the MQTT credentials
    ├── connectBroker.js      # MQTT client
    ├── logger.js             # Winston loggers
    └── db/
        ├── connectDb.js          # MongoDB connection
        └── connectInfluxDb.js    # InfluxDB connection and health check
```

## Error handling

- A payload that is not valid JSON or fails schema validation is logged and not stored.
- The MQTT client reconnects automatically when the connection drops.
- If the MongoDB connection fails at start-up, the process exits.
- If InfluxDB is not available, the error is logged and the listener keeps running.

## Known limitations

- Only the saved volume is written to InfluxDB, and the point gets the time the listener received it, not the meter's own timestamp.
- A reading with a flow rate of 0 fails schema validation and is not stored.
- Messages can arrive before the MongoDB connection is ready.
- The same meter id can exist under two gateways.

## Licence

ISC
