import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mysql from "mysql2/promise";
import crypto from "crypto";

dotenv.config();
const app = express();
const PORT = Number(process.env.PORT || 8080);
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());



const INDIA_PLACES = ["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Andaman and Nicobar Islands","Chandigarh","Dadra and Nagar Haveli and Daman and Diu","Delhi","Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry","Bengaluru","Hyderabad","Chennai","Mumbai","Delhi","New Delhi","Pune","Kolkata","Ahmedabad","Jaipur","Lucknow","Vijayawada","Visakhapatnam","Tirupati","Proddatur","Mysuru","Mangaluru","Kochi","Goa","Varanasi","Agra","Amritsar","Surat","Vadodara","Bhopal","Indore","Patna","Ranchi","Bhubaneswar","Guwahati","Chandigarh","Shimla","Dehradun","Rishikesh","Srinagar","Jammu","Leh","Manali","Ooty","Madurai","Coimbatore","Thiruvananthapuram","Kozhikode","Nagpur","Nashik","Aurangabad","Jodhpur","Udaipur","Jaisalmer","Gurugram","Noida","Faridabad","Kanpur","Prayagraj","Gorakhpur","Meerut","Darjeeling","Siliguri","Shillong","Gangtok","Imphal","Aizawl","Kohima","Agartala","Port Blair","Puducherry","Kavaratti","Daman","Silvassa","Panaji"];

const MODE_IMAGES = {
  bus: "/tripmate-assets/bus.jpg",
  train: "/tripmate-assets/train.jpg",
  flight: "/tripmate-assets/flight.jpg",
  hotel: "/tripmate-assets/hotel.jpg"
};

function textValue(value, fallback, max = 120) {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  const escapedJson = (text.match(/\\"/g) || []).length > 3;
  if (!text || escapedJson || ((text.startsWith("{") || text.startsWith("[")) && text.length > 40)) return fallback;
  return text.slice(0, max);
}

function finiteNumber(value, fallback = 0) {
  const n = typeof value === "number" ? value : Number(String(value ?? "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : fallback;
}

function normalizeTrip(raw, mode, from, to, index = 0) {
  const safeMode = ["bus", "train", "flight", "hotel"].includes(mode) ? mode : "bus";
  const tags = Array.isArray(raw?.tags)
    ? raw.tags.map(v => String(v ?? "").trim()).filter(Boolean).slice(0, 6)
    : [];
  const price = finiteNumber(raw?.price, 0);
  const rating = Math.min(5, Math.max(0, finiteNumber(raw?.rating, 0)));
  const seats = Math.max(0, Math.round(finiteNumber(raw?.seats ?? raw?.availableSeats, 0)));
  const operator = textValue(raw?.operator ?? raw?.provider, "TripMate");
  const title = textValue(raw?.title ?? raw?.name, `${safeMode[0].toUpperCase()}${safeMode.slice(1)} option`);
  const image = String(raw?.image ?? raw?.imageUrl ?? "").trim() || MODE_IMAGES[safeMode];

  return {
    id: String(raw?.id ?? `${safeMode}-${Date.now()}-${index}`),
    mode: safeMode,
    operator,
    title,
    from: textValue(raw?.from ?? from, from ?? ""),
    to: textValue(raw?.to ?? to, to ?? ""),
    depart: textValue(raw?.depart ?? raw?.departure ?? raw?.departureTime, "--:--", 30),
    arrive: textValue(raw?.arrive ?? raw?.arrival ?? raw?.arrivalTime, "--:--", 30),
    duration: textValue(raw?.duration, "—", 40),
    price,
    currency: String(raw?.currency ?? "INR"),
    rating,
    seats,
    status: textValue(raw?.status ?? (raw?.live ? "On schedule" : "Scheduled"), raw?.live ? "On schedule" : "Scheduled", 60),
    live: Boolean(raw?.live),
    tags,
    image
  };
}

function localLocationMatches(q) {
  const query = q.trim().toLowerCase();
  if (!query) return [];
  return [...new Set(INDIA_PLACES.filter(x => x.toLowerCase().includes(query)))].slice(0, 12);
}

function demoTrips(mode, from, to) {
  const common = mode === "bus"
    ? [["IntrCity SmartBus", "Sleeper AC", "22:10", "06:20", "8h 10m", 899, 4.5, 18, true, ["AC", "Sleeper"]], ["VRL Travels", "Multi-Axle Volvo", "20:30", "05:40", "9h 10m", 1050, 4.3, 9, true, ["AC", "Live"]], ["Orange Tours", "AC Sleeper", "21:15", "06:15", "9h", 950, 4.6, 12, false, ["AC", "Sleeper"]]]
    : mode === "train"
    ? [["Indian Railways", "Vande Bharat Express", "05:30", "13:45", "8h 15m", 1450, 4.7, 32, true, ["Fast", "Live"]], ["Indian Railways", "Superfast Express", "21:10", "06:20", "9h 10m", 760, 4.3, 41, true, ["Sleeper", "Live"]], ["Indian Railways", "Intercity Express", "06:40", "15:30", "8h 50m", 620, 4.2, 25, false, ["Chair Car"]]]
    : mode === "flight"
    ? [["IndiGo", "6E · Economy", "07:15", "08:35", "1h 20m", 3999, 4.4, 18, false, ["Non-stop"]], ["Air India Express", "Economy", "10:30", "11:55", "1h 25m", 4299, 4.2, 11, false, ["Non-stop"]], ["Akasa Air", "Economy", "18:10", "19:35", "1h 25m", 3899, 4.5, 7, false, ["Non-stop"]]]
    : [["TripMate Stays", "City Central Hotel", "14:00", "11:00", "1 night", 2499, 4.4, 8, false, ["Breakfast"]], ["TripMate Stays", "Premium Residency", "14:00", "11:00", "1 night", 3199, 4.7, 4, false, ["Breakfast", "Wi-Fi"]], ["TripMate Stays", "Budget Rooms", "14:00", "11:00", "1 night", 1599, 4.1, 12, false, ["Wi-Fi"]]];

  return common.map((x, i) => normalizeTrip({
    id: `${mode}-${Date.now()}-${i}`,
    mode,
    operator: x[0],
    title: x[1],
    from,
    to,
    depart: x[2],
    arrive: x[3],
    duration: x[4],
    price: x[5],
    rating: x[6],
    seats: x[7],
    live: x[8],
    status: x[8] ? "On schedule" : "Scheduled",
    tags: x[9]
  }, mode, from, to, i));
}

async function providerSearch(mode, from, to, date) {
  const urls = { bus: process.env.BUS_API_URL, train: process.env.TRAIN_API_URL, flight: process.env.FLIGHT_API_URL, hotel: process.env.HOTEL_API_URL };
  const keys = { bus: process.env.BUS_API_KEY, train: process.env.TRAIN_API_KEY, flight: process.env.FLIGHT_API_KEY, hotel: process.env.HOTEL_API_KEY };
  const url = urls[mode];
  const key = keys[mode];
  if (!url) return { trips: demoTrips(mode, from, to), source: "Demo provider" };
  try {
    const u = new URL(url);
    u.searchParams.set("from", from);
    u.searchParams.set("to", to);
    u.searchParams.set("date", date);
    const response = await fetch(u, { headers: key ? { Authorization: `Bearer ${key}` } : {} });
    if (!response.ok) throw new Error(`provider ${response.status}`);
    const data = await response.json();
    if (Array.isArray(data.trips) && data.trips.length) {
      const trips = data.trips
        .map((trip, index) => normalizeTrip(trip, mode, from, to, index))
        .filter(trip => Number.isFinite(trip.price) && trip.price > 0);
      if (trips.length) return { trips, source: "Live provider" };
    }
    return { trips: demoTrips(mode, from, to), source: "Provider connected; demo fallback" };
  } catch (error) {
    console.error(error);
    return { trips: demoTrips(mode, from, to), source: "Demo fallback (provider unavailable)" };
  }
}

app.get("/api/health", async (_req, res) => {
  let database = "not configured";
  if (process.env.DATABASE_URL) {
    try {
      const db = await mysql.createConnection(process.env.DATABASE_URL);
      await db.query("SELECT 1");
      await db.end();
      database = "connected";
    } catch { database = "configured but unavailable"; }
  }
  res.json({
    ok: true, service: "TripMate API", database, time: new Date().toISOString(),
    liveProviders: {
      bus: Boolean(process.env.BUS_API_URL), train: Boolean(process.env.TRAIN_API_URL),
      flight: Boolean(process.env.FLIGHT_API_URL), hotel: Boolean(process.env.HOTEL_API_URL)
    }
  });
});



app.get("/api/locations", async (req, res) => {
  const q = String(req.query.q || "").trim();
  if (!q) return res.json({ locations: [] });
  const local = localLocationMatches(q);
  const geocoder = process.env.GEOCODER_URL;
  if (!geocoder) return res.json({ locations: local, source: "local India directory" });
  try {
    const u = new URL(geocoder);
    u.searchParams.set("q", `${q}, India`);
    u.searchParams.set("format", "json");
    u.searchParams.set("limit", "10");
    u.searchParams.set("countrycodes", "in");
    const r = await fetch(u, { headers: { "User-Agent": process.env.GEOCODER_USER_AGENT || "TripMate/1.0 travel-app" } });
    if (!r.ok) throw new Error(`geocoder ${r.status}`);
    const data = await r.json();
    const remote = data.map(x => x.display_name).filter(Boolean);
    return res.json({ locations: [...new Set([...remote, ...local])].slice(0, 12), source: "geocoder" });
  } catch {
    return res.json({ locations: local, source: "local fallback" });
  }
});

app.get("/api/search", async (req, res) => {
  const mode = String(req.query.mode || "bus").toLowerCase();
  const from = String(req.query.from || "Bengaluru").trim().slice(0, 120);
  const to = String(req.query.to || "Hyderabad").trim().slice(0, 120);
  const date = String(req.query.date || "").trim();
  if (!["bus", "train", "flight", "hotel"].includes(mode)) return res.status(400).json({ error: "Invalid mode" });
  res.json(await providerSearch(mode, from, to, date));
});

app.get("/api/trips/:id", (req, res) => {
  const mode = req.params.id.split("-")[0];
  const safeMode = ["bus", "train", "flight", "hotel"].includes(mode) ? mode : "bus";
  res.json(demoTrips(safeMode, "Bengaluru", "Hyderabad")[0]);
});

app.post("/api/bookings", (req, res) => {
  const { tripId, passengerName, email, seats = [], price, passengers = 1, paymentMethod = "Card" } = req.body || {};
  if (!tripId || !passengerName || !email || !Array.isArray(seats) || !seats.length) {
    return res.status(400).json({ error: "Missing booking details" });
  }
  const booking = {
    id: `TM-${crypto.randomBytes(3).toString("hex").toUpperCase()}`,
    tripId, passengerName, email, seats, status: "Confirmed",
    passengers: Math.max(1, Number(passengers) || 1), paymentMethod, amount: Math.max(0, Number(price) || 899) * Math.max(1, seats.length || Number(passengers) || 1), createdAt: new Date().toISOString()
  };
  res.status(201).json(booking);
});

app.get("/api/bookings", (_req, res) => res.json({ bookings: [] }));

app.post("/api/assistant", async (req, res) => {
  const message = String(req.body?.message || "").trim();
  const aiUrl = process.env.AI_API_URL;
  if (aiUrl) {
    try {
      const response = await fetch(aiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(process.env.AI_API_KEY ? { Authorization: `Bearer ${process.env.AI_API_KEY}` } : {}) },
        body: JSON.stringify({ message })
      });
      const data = await response.json();
      return res.json({ reply: data.reply || data.message || "AI provider response received." });
    } catch {}
  }
  const lower = message.toLowerCase();
  let reply = "I can help with routes, travel modes, booking flow and itinerary planning. Tell me your origin, destination, dates and budget.";
  if (lower.includes("goa")) reply = "For a Goa trip, compare bus and flight options from your departure city, then add a hotel and build a day-by-day plan.";
  else if (lower.includes("train")) reply = "For trains, search your route and date first. When a live train provider is configured, TripMate can display its live status through the backend adapter.";
  else if (lower.includes("budget")) reply = "Share your origin, destination, dates and approximate budget. I can structure a bus/train/flight + hotel comparison.";
  res.json({ reply });
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dist = path.join(__dirname, "../dist");
app.use(express.static(dist));
app.get(/.*/, (_req, res) => res.sendFile(path.join(dist, "index.html")));
app.listen(PORT, () => console.log(`TripMate running on port ${PORT}`));
