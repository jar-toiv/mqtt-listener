# Changelog — listener

## 2026-08-10
- Shutdown() called non-exsistent `logger-warning`, causing a TypeError and preventing clean exit when the MongoDB connection failed.

## 2026-08-10

### Local dev support
Same `NODE_ENV`-based split as broker, applied to `config.js`:

- Now loads `.env.development` / `.env.production` depending on `NODE_ENV`, instead of always loading a single plain `.env`.
- Missing required env vars now throw and stop startup instead of just logging an error and continuing with `undefined` values — surfaces config problems immediately instead of as a confusing downstream failure.

### Bug fixe
- `connectBroker.js`'s `handleReconnect` was being called with no argument (`handleReconnect()`), but the function expects `client` as a parameter to call `client.reconnect()` on. Any MQTT error would throw inside a `setTimeout` callback and crash the process instead of actually reconnecting.
- `authentication.js` had its own independent `dotenv.config({ path: '.env' })` call, separate from the one in `config.js`. Since `dotenv` never overwrites a variable that's already set, this only mattered for variables missing from `.env.development` — which is exactly what happened with `MQTT_GATEWAY_URI`, silently pulling the old production value back in through the gap. Removed the redundant load entirely; `config.js` already handles it.
- Dropped `useNewUrlParser`/`useUnifiedTopology` from the `mongoose.connect()` call — leftover options from pre-6.x Mongoose, unrecognized now.

### Infrastructure debugging
- MongoDB Atlas connection was failing with `querySrv ECONNREFUSED` — the local network's default DNS resolver wasn't handling the SRV lookup that `mongodb+srv://` connection strings depend on. Fixed by pointing DNS at 1.1.1.1/8.8.8.8.

### Dependency security
Same `.npmrc` policy as broker (`ignore-scripts`, `min-release-age=2`, `save-exact`) — ran `npm install --ignore-scripts` and `npm audit fix`, advisories cleared.

### Verified working locally
Published a realistic M-Bus meter payload via MQTT.fx, using the **flattened JSON shape the Teltonika TRB143 gateway emits** (not raw M-Bus framing), and confirmed the full pipeline end to end:
- Topic parsed into site/location/gateway/meter.
- Mongoose hierarchy (Site → Location → Gateway → WaterflowMeter) created and linked correctly in MongoDB Atlas.
- `currentEventFlags.reverseFlow: true` correctly triggered the meter's fault-condition warning log.
- Reading successfully written to InfluxDB Cloud (`measurement_waterflow`).
