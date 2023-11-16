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
"Unit": "Fabrication number",
"Value": 599079,
"Timestamp": "2023-10-01T01:21:32Z"
},
{
"Function": "Instantaneous value",
"StorageNumber": 0,
"Unit": "Time Point (time &amp; date)",
"Value": "2023-10-26T12:38:00",
"Timestamp": "2023-10-01T01:21:32Z"
},
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
},
{
"Function": "Instantaneous value",
"StorageNumber": 1,
"Unit": "Volume (m m^3)",
"Value": 99999999,
"Timestamp": "2023-10-01T01:21:32Z"
},
{
"Function": "Instantaneous value",
"StorageNumber": 1,
"Unit": "Time Point (date)",
"Value": "2000-06-01",
"Timestamp": "2023-10-01T01:21:32Z"
},
{
"Function": "Instantaneous value",
"StorageNumber": 0,
"Unit": "Operating time (days)",
"Value": 186,
"Timestamp": "2023-10-01T01:21:32Z"
},
{
"Function": "Instantaneous value",
"StorageNumber": 0,
"Unit": "Error flags",
"Value": 526095,
"Timestamp": "2023-10-01T01:21:32Z"
},
{
"Function": "Instantaneous value",
"StorageNumber": 0,
"Unit": "Manufacturer specific",
"Value": 262400,
"Timestamp": "2023-10-01T01:21:32Z"
},
{
"Function": "Instantaneous value",
"StorageNumber": 0,
"Unit": "Manufacturer specific",
"Value": 0,
"Timestamp": "2023-10-01T01:21:32Z"
},
{
"Function": "Instantaneous value",
"StorageNumber": 0,
"Unit": "Manufacturer specific",
"Value": -5373945,
"Timestamp": "2023-10-01T01:21:32Z"
},
{
"Function": "Manufacturer specific",
"Value": "00 01 29 24 FF 00 03 08 03 00",
"Timestamp": "2023-10-01T01:21:32Z"
}
]
}
}

```

# TODO

- Modify schema to reflect real sensor data and apply validators
- wait for successful mongoDB connection before taking in topic or message
- Message que / buffer for message backlogs ?
- EventEmitter for custom events and listeners
- Add PROCESS MANAGER `pm2` to restart software --- bash run_app.sh
- Critical alerts ex. PagerDuty or Opsgenie
- Finish readMe and documentation

UUID

- influx TOPIC ON datan ID ja message on sitten se data writePoint(point) - mongodb hae Idt ja lähetä influxiin
- const getPoint = (measurement, tags, pointKey, pointValue, timestamp) => {
  const point = new Point(measurement)
  .tag('externalId', tags.externalId)
  .tag('connectorId', tags.connectorId)
  .tag('sourceId', tags.sourceId)
  .floatField(pointKey, pointValue)
  .timestamp(timestamp ? new Date(timestamp) : new Date());
  return point;
  };

const measurement = 'conditions';
