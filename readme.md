# MQTT M-Bus Listener

A Node.js service that subscribes to an MQTT broker, ingests M-Bus sensor readings (waterflow meters) published by field gateways, persists the entity hierarchy (Site → Location → Gateway → Meter) to MongoDB, and writes time-series measurements to InfluxDB.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Data Model](#data-model)
- [MQTT Topic Structure](#mqtt-topic-structure)
- [Message Payload](#message-payload)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Service](#running-the-service)
- [Logging](#logging)
- [Project Structure](#project-structure)
- [Error Handling](#error-handling)
- [Roadmap](#roadmap)
- [License](#license)

## Overview

The listener connects to an MQTT broker over TLS and subscribes to all topics (`#`). Each incoming message represents a reading from an M-Bus waterflow sensor, relayed through a gateway (e.g. a Teltonika TRB143 router) that **flattens the M-Bus payload into JSON** before publishing it. For every message the service:

1. Parses the topic to identify the site, location, gateway, and meter.
2. Upserts the corresponding documents in MongoDB, maintaining parent/child references between them.
3. Validates and stores the meter reading on the meter document.
4. Writes the reading as a point to InfluxDB for time-series analysis.

## Architecture

```
MQTT Broker
    │  (TLS, topic: site/location/gateway/meter)
    ▼
connectBroker.js  ──► processMqtt.js
                          │
                          ├─► siteHandler.js      ──► MongoDB (Site)
                          ├─► locationHandler.js  ──► MongoDB (Location)
                          ├─► gatewayHandler.js   ──► MongoDB (Gateway)
                          ├─► meterHandler.js     ──► MongoDB (WaterflowMeter)
                          └─► influxHandler.js    ──► InfluxDB (measurement_waterflow)
```

Each handler upserts its own document and links it to its parent (e.g. a Location is pushed onto its Site's `locationIds` array), building a navigable hierarchy: **Site → Location → Gateway → Meter**.

## Data Model

| Model | Collection | Key Fields |
|---|---|---|
| `Site` | `sites` | `siteName`, `locationIds[]` |
| `Location` | `locations` | `locationName`, `siteId`, `gatewayIds[]` (unique on `locationName` + `siteId`) |
| `Gateway` | `gateways` | `gatewayName`, `locationId`, `topic`, `meterIds[]` (max 249 meters) |
| `WaterflowMeter` | `meters` | `meterId`, `meterName`, `gatewayId`, `connection`, `savedVolume`, `flowRate`, `currentEventFlags`, `diagnostics` |

`WaterflowMeter` raises a `warn`-level alert whenever any `currentEventFlags` (e.g. `leakage`, `lowBattery`, `reverseFlow`) is `true` after a save.

## MQTT Topic Structure

Topics are expected in the form `<site>/<location>/<gateway>/<meter>`:

```
katujenkatu-1/huone-201/teltonika-trb143-12345/waterflow
```

## Message Payload

### Raw M-Bus structure (reference)

M-Bus devices natively report readings in a nested structure like the one below. This is **not** what the listener receives — it's shown here for reference on where the values originate:

```json
{
  "MBusData": {
    "SlaveInformation": {
      "Id": 599079,
      "Manufacturer": "APA",
      "Version": 21,
      "ProductName": "",
      "Medium": "Water",
      "AccessNumber": 9,
      "Status": "FC",
      "Signature": 0
    },
    "DataRecord": [
      {
        "Function": "Instantaneous value",
        "StorageNumber": 0,
        "Unit": "Volume (m m^3)",
        "Value": 3,
        "Timestamp": "2023-10-01T01:21:32Z"
      },
      {
        "Function": "Instantaneous value",
        "StorageNumber": 0,
        "Unit": "Volume flow (m m^3/h)",
        "Value": 0,
        "Timestamp": "2023-10-01T01:21:32Z"
      }
    ]
  }
}
```

### Flattened payload (as received by the listener)

The Teltonika TRB143 gateway flattens the raw M-Bus record into a JSON object whose keys map directly onto the `WaterflowMeter` schema fields (see [waterflowMeter.js](src/models/waterflowMeter.js)). This is the actual MQTT message body `meterHandler.js` parses and writes to MongoDB:

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
    "maximumFlow": false,
    "minimumFlow": false,
    "reverseFlow": true,
    "noFlow": false,
    "leakage": false,
    "meterDisconnection": false,
    "magneticFieldDetection": false,
    "strongLightDetection": false,
    "lowBattery": false,
    "tipError": false,
    "detectorFault": false,
    "processorReset": false
  },
  "diagnostics": {
    "optics": "Normal",
    "oscillator": "Normal",
    "powerSupply": "M-Bus"
  }
}
```

`meterHandler.js` copies every top-level key from this payload directly onto the meter document (`meterDoc[key] = messageJSON[key]`), so any field present here that matches the schema is persisted as-is. Note `reverseFlow: true` above — this is the exact condition that triggers the `WaterflowMeter` post-save `warn` alert described in [Data Model](#data-model).

## Prerequisites

- Node.js (ES modules, `"type": "module"`)
- Access to an MQTT broker (TLS)
- MongoDB instance
- InfluxDB instance (optional — the service degrades gracefully if unavailable)

## Installation

```bash
npm install
```

## Configuration

Environment variables are loaded via `dotenv` from `.env.development` or `.env.production`, selected by `NODE_ENV`.

| Variable | Required | Description |
|---|---|---|
| `NODE_ENV` | Yes | `development` or `production` — selects the env file and logging behavior. |
| `MQTT_GATEWAY_URI` | Yes | MQTT broker connection URI. |
| `MQTT_USERNAME` | Yes | MQTT broker username. |
| `MQTT_PASSWORD` | Yes | MQTT broker password. |
| `MONGO_URI` | Yes | MongoDB connection string. |
| `INFLUXDB_HOST` | No | InfluxDB base URL. |
| `INFLUXDB_TOKEN` | No | InfluxDB API token. |
| `INFLUXDB_ORGANIZATION` | No | InfluxDB organization. |
| `INFLUXDB_BUCKET` | No | InfluxDB bucket to write points to. |
| `LOG_LEVEL` | No | Winston log level (defaults to `debug`). |

`NODE_ENV`, `MQTT_GATEWAY_URI`, and `MONGO_URI` are validated at startup in [config.js](src/utils/config.js); the process throws if any are missing. `MQTT_USERNAME`/`MQTT_PASSWORD` are validated in [authentication.js](src/utils/authentication.js) and exit the process if missing. InfluxDB variables are optional — a missing InfluxDB connection is logged but does not stop the service.

## Running the Service

```bash
# Production
npm start

# Development (auto-restart via nodemon)
npm run dev
```

On startup the service:
1. Connects to MongoDB (exits the process on failure).
2. Attempts to connect to InfluxDB and runs a periodic health check every 10 minutes (failure is logged, not fatal).
3. Connects to the MQTT broker, subscribes to all topics, and begins processing messages.

MQTT reconnection is handled automatically up to 3 retries (5s apart) before the process exits.

## Logging

Logging is implemented with [Winston](src/utils/logger.js) using custom levels (`debug`, `info`, `initProcess`, `process`, `warn`, `error`) written to rotating file transports under [logs/](logs/):

| File | Content |
|---|---|
| `logs/error.log` | Errors |
| `logs/warnings.log` | Warnings (e.g. meter alert flags) |
| `logs/process.log` | Runtime processing events |
| `logs/initProcess.log` | First-time entity creation events |
| `logs/exceptions.log` | Uncaught exceptions |

Console output (with colorized formatting) is enabled additionally when `NODE_ENV !== production`.

## Project Structure

```
src/
├── app.js                    # Boots the MQTT broker connection
├── server.js                 # Entry point — initializes DBs then the app
├── models/                   # Mongoose schemas
│   ├── site.js
│   ├── location.js
│   ├── gateway.js
│   └── waterflowMeter.js
├── mqtt/
│   ├── processMqtt.js        # Orchestrates the per-message handler pipeline
│   ├── siteHandler.js        # Upserts Site documents
│   ├── locationHandler.js    # Upserts Location documents, links to Site
│   ├── gatewayHandler.js     # Upserts Gateway documents, links to Location
│   ├── meterHandler.js       # Parses payload, upserts Meter, links to Gateway
│   └── influxHandler.js      # Writes a data point to InfluxDB
└── utils/
    ├── config.js             # Loads and validates environment configuration
    ├── authentication.js     # Validates MQTT credentials
    ├── connectBroker.js      # MQTT client connection + reconnect logic
    ├── logger.js             # Winston logger configuration
    └── db/
        ├── connectDb.js          # MongoDB connection
        └── connectInfluxDb.js    # InfluxDB connection + health checks
```

## Error Handling

- **Malformed payloads**: caught in `meterHandler.js`'s JSON parser; the message is dropped and logged.
- **Missing parameters**: `meterHandler.js` validates `meterName`, `gatewayDoc`, and the parsed payload before writing.
- **Mongoose validation errors**: caught per-handler and logged distinctly from other errors (e.g. invalid `connection` type, meter array exceeding 249 entries).
- **MQTT connection loss**: automatic reconnect with a capped retry count; the process exits after exhausting retries.
- **InfluxDB unavailability**: connection failures and failed health checks are logged; writing to InfluxDB is skipped rather than blocking MQTT processing.

## Roadmap

- Check meterId conflict in  `meterHandler.js`, same meter cannot be in two places.
- Extend the `WaterflowMeter` schema to fully reflect real M-Bus sensor data with stricter validators.
- Defer topic/message handling until MongoDB connection is confirmed.
- Introduce a message queue/buffer to handle backlogs.
- Emit custom events via `EventEmitter` for downstream listeners.
- Run under a process manager (`pm2`) for automatic restarts.
- Integrate critical alerting (e.g. PagerDuty, Opsgenie) for meter fault flags.

## License

ISC
