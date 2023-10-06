## Nodejs listener service for M-BUS sensors

# TODO:

- Testaa että createdAt ei päivity tämän kanssa, vain updateAt

```
  const updatedMeter = await WaterflowMeter.findOneAndUpdate(
  { deviceId: flattenedPayload.deviceId },
  flattenedPayload,
  { new: true, upsert: true }
  )
```
