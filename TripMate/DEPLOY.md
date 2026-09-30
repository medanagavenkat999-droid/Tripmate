# TripMate deployment

## Render (single service)

1. Push this folder to GitHub.
2. In Render, create a **Web Service** from the repository.
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Node 20+.
6. Deploy.

The Express service serves the production React build and `/api/*` from one URL.

## India-wide locations

The search UI includes a built-in India directory covering all 28 states and 8 Union Territories plus a broad city/town list. Users can also type any Indian city, town, village, station or locality directly.

For larger-scale autocomplete, configure an allowed geocoding provider with:

`GEOCODER_URL`

and optionally:

`GEOCODER_USER_AGENT`

The server keeps the geocoder behind `/api/locations`; provider keys are never exposed to React.

## Live travel providers

Set these only when you have legitimate provider access:

`BUS_API_URL` / `BUS_API_KEY`
`TRAIN_API_URL` / `TRAIN_API_KEY`
`FLIGHT_API_URL` / `FLIGHT_API_KEY`
`HOTEL_API_URL` / `HOTEL_API_KEY`

The generic provider contract currently expects `{ "trips": [...] }`. If a provider returns another schema, map its response in `server/index.ts` and `server/index.js`.

Without provider credentials, TripMate uses clearly labelled demo data rather than pretending it is live.

## Optional database

Set `DATABASE_URL` to a MySQL/TiDB connection string. `/api/health` reports database connectivity.
