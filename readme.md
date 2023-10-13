# Nodejs listener service for M-BUS sensors

## Table of Contents (General)

- [Topic](#TOPIC)
- [Payload](#PAYLOAD)
- [handleSite](#handleSite)
- [Errors](#errors)
- [Usage Example](#usage-example)

## TOPIC

```
katujenkatu-1/huone-201/teltonika-trb143-12345/waterflow
```

## PAYLOAD

```
{
  "meterId": "APT-MBUS-NA-10-1",
  "meterDateTime": "2023-12-12T10:00:00.000Z",
  "savedDateOfReadout": "2023-11-09T00:00:00.000Z",
  "instantaneousVolume": 500.75,
  "savedVolume": 200,
  "measurementTime": 5,
  "flowRate": 10.5,
  "currentEventFlags": {
    "maximumFlow": false,
    "minimumFlow": false,
    "reverseFlow": false,
    "noFlow": true,
    "leakage": false,
    "deviceDisconnection": false,
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

# TODO

- Add SSL from Broker to all
- Modify schema to reflect real sensor data and apply validators
- Rename siteName/locationName to siteTopic/locationTopic ?
- Create influxDB for historical keepings
- Message que / buffer for message backlogs ?
- EventEmitter for custom events and listeners
- Secrets could use AWS secrets manager or HashiCorp Vault for creds
- Add reconnect period from mqtt lib _reconnectPeriod_
- Add process manager `pm2` to restart software --- bash run_app.sh
- Critical alerts ex. PagerDuty or Opsgenie
- Finish Broker
- Start Nuxt 3
