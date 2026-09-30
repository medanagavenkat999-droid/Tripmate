# TripMate — Top-Tier Travel Platform

TripMate is a responsive dark travel-tech booking platform built around one connected travel workspace. It preserves the existing Bus / Train / Flight / Hotel search → results → seat selection → checkout → confirmation architecture while adding the complete discovery, planning, community and travel-utility layer requested for the project.

## Product experience

- Cinematic TripMate intro screen — tap anywhere or press Enter to enter the real application
- Premium dark travel-tech UI with emerald/cyan accents, glass panels, large image cards and responsive mobile layouts
- Bus, Train, Flight and Hotels search modes
- Predictive destination suggestions and destination search/filter categories
- Interactive destination map preview with clickable pins and destination cards
- Popular destinations + Bali, Swiss Alps and Tokyo featured getaways
- Hidden Gems & Local Secrets community section
- Wishlist / Saved Trips with local persistence
- INR / USD / EUR / GBP currency selector with mock conversion rates
- Trip results, price/rating/live filters and sorting
- AI price predictor badges + sparkline trend visualization
- Trip details modal with image, weather, visa/entry checklist, timezone/jet-lag guidance, carbon estimator, map and safety/phrasebook hub
- AI Assistant
- AI Trip Generator with destination, days and travel style
- Smart Packing List with Beach / Mountain / City presets and checkboxes
- Trip Budget & Expense Splitter with payer tracking and equal-share settlement suggestions
- Multi-step booking wizard: dates/passenger → seats/guests → mock payment → confirmation
- Photo gallery preview in checkout
- Trip Wallet / digital boarding-pass style confirmations + print/save-to-PDF workflow
- Travel Passport with visited / bucket-list tracking
- Trip Memory Reel & Scrapbook with browser photo uploads and captions
- Customer reviews and instant review submission
- Shared Trip Notes / Ideas Board
- Group Decision Polls with live percentage bars
- Find Travel Buddies community cards
- Multi-language mini phrasebook
- Traveler Safety Hub with clearly labelled demo guidance and official-verification reminders
- Login/signup demo and admin operations dashboard
- Image fallback handling for remote travel imagery
- Smooth transitions, responsive grids, hover states and mobile-first layouts

## Architecture

```text
React + TypeScript frontend
        ↓
Shared trip/search/booking state
        ↓
Express /api backend
        ↓
Provider adapters (Bus / Train / Flight / Hotel)
        ↓
MySQL / TiDB health-check support

LocalStorage powers demo persistence for:
- theme
- currency
- wishlist
- bookings
- expenses
- reviews
- notes / polls
- passport
- memories
```

## Run locally

```bash
npm install
npm run dev
```

## Production build

```bash
npm install
npm run build
npm start
```

## Render

Use the included `render.yaml`:

- Build: `npm install && npm run build`
- Start: `npm start`
- Health check: `/api/health`
- Node: 20+

## Live provider integration

The backend retains provider adapter slots for legitimate bus, train, flight and hotel APIs. Without provider credentials the app uses clearly labelled demo data. Configure provider URLs/keys through Render environment variables; never expose private keys in the React client.

## Notes

The advanced planning/community tools are intentionally functional demo features backed by browser storage. They are structured so real authentication, realtime collaboration, maps, weather, payment, AI and travel providers can be connected later without replacing the core UI architecture.
