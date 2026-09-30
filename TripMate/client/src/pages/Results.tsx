import { useEffect, useMemo, useState } from "react";
import TripCard from "../components/TripCard";
import type { Mode, Trip } from "../lib/api";

const symbols: Record<string, string> = { INR: "₹", USD: "$", EUR: "€", GBP: "£" };
const rates: Record<string, number> = { INR: 1, USD: 0.0119, EUR: 0.0109, GBP: 0.0094 };

function safePrice(value: unknown) {
  const n = typeof value === "number" ? value : Number(String(value ?? "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function normalizeTrip(trip: Trip): Trip {
  return {
    ...trip,
    price: safePrice(trip.price),
    rating: Number.isFinite(Number(trip.rating)) ? Math.max(0, Math.min(5, Number(trip.rating))) : 0,
    seats: Math.max(0, Number(trip.seats) || 0),
    tags: Array.isArray(trip.tags) ? trip.tags.filter(Boolean) : [],
    operator: String(trip.operator || "TripMate"),
    title: String(trip.title || "Travel option"),
    from: String(trip.from || ""),
    to: String(trip.to || ""),
    depart: String(trip.depart || "--:--"),
    arrive: String(trip.arrive || "--:--"),
    duration: String(trip.duration || "—"),
    status: String(trip.status || "Scheduled")
  };
}

export default function Results({
  mode, from, to, date, trips, source, onBook, onDetails, onBack, currency
}: {
  mode: Mode;
  from: string;
  to: string;
  date: string;
  trips: Trip[];
  source: string;
  onBook: (t: Trip) => void;
  onDetails: (t: Trip) => void;
  onBack: () => void;
  currency: string;
}) {
  const safeTrips = useMemo(() => trips.map(normalizeTrip).filter(t => Number.isFinite(t.price) && t.price > 0), [trips]);
  const ceiling = useMemo(() => {
    const prices = safeTrips.map(t => t.price).filter(Number.isFinite);
    return Math.max(1000, ...(prices.length ? prices : [1000]));
  }, [safeTrips]);

  const [liveOnly, setLiveOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState(ceiling);
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState("recommended");

  useEffect(() => {
    setMaxPrice(ceiling);
    setLiveOnly(false);
    setMinRating(0);
    setSort("recommended");
  }, [ceiling, from, to, date, mode]);

  const shown = useMemo(() => {
    const filtered = safeTrips.filter(
      t => (!liveOnly || Boolean(t.live)) && t.price <= maxPrice && t.rating >= minRating
    );

    return [...filtered].sort((a, b) => {
      if (sort === "price") return a.price - b.price;
      if (sort === "rating") return b.rating - a.rating;
      if (sort === "departure") return a.depart.localeCompare(b.depart);
      return Number(b.live) - Number(a.live) || b.rating - a.rating || a.price - b.price;
    });
  }, [safeTrips, liveOnly, maxPrice, minRating, sort]);

  const convertedMax = Math.round(maxPrice * (rates[currency] ?? 1));
  const reset = () => {
    setLiveOnly(false);
    setMaxPrice(ceiling);
    setMinRating(0);
    setSort("recommended");
  };

  return (
    <main className="page results-page">
      <div className="results-head">
        <button type="button" className="back" onClick={onBack}>← Back</button>
        <div>
          <span className="eyebrow">{mode.toUpperCase()} SEARCH</span>
          <h1>{from || "Origin"} <span>→</span> {to || "Destination"}</h1>
          <p>
            {date || "Flexible date"} · {shown.length} of {safeTrips.length} options ·{" "}
            <strong className="source-badge">{source || "Demo provider"}</strong>
          </p>
        </div>
      </div>

      <div className="results-layout">
        <aside className="filters">
          <div className="filter-title">
            <strong>Filters</strong>
            <button type="button" className="text-btn" onClick={reset}>Reset</button>
          </div>

          <label>
            <span>Live / trackable</span>
            <input type="checkbox" checked={liveOnly} onChange={e => setLiveOnly(e.target.checked)} />
          </label>

          <label>
            <span>Max price: {symbols[currency] || "₹"}{convertedMax.toLocaleString("en-IN")}</span>
            <input
              type="range"
              min="300"
              max={Math.max(300, ceiling)}
              value={Math.min(maxPrice, Math.max(300, ceiling))}
              onChange={e => setMaxPrice(Number(e.target.value))}
            />
          </label>

          <label>
            <span>Rating</span>
            <select value={minRating} onChange={e => setMinRating(Number(e.target.value))}>
              <option value="0">Any rating</option>
              <option value="4">4+</option>
              <option value="4.5">4.5+</option>
            </select>
          </label>

          <label>
            <span>Sort</span>
            <select value={sort} onChange={e => setSort(e.target.value)}>
              <option value="recommended">Recommended</option>
              <option value="price">Price: low to high</option>
              <option value="departure">Departure</option>
              <option value="rating">Rating</option>
            </select>
          </label>

          <div className="predictor">
            <small>AI PRICE PREDICTOR</small>
            <strong>Good Deal · Demo estimate</strong>
            <div className="sparkline"><i/><i/><i/><i/><i/><i/><i/></div>
            <span>Price trend is simulated until a live provider is connected.</span>
          </div>
        </aside>

        <section className="result-list">
          {shown.length ? shown.map(t => (
            <TripCard
              key={t.id}
              trip={t}
              onBook={onBook}
              onDetails={onDetails}
              currency={symbols[currency] || currency}
              convert={n => Math.round(n * (rates[currency] ?? 1))}
            />
          )) : (
            <div className="empty">
              <div>⌕</div>
              <h2>No matching trips</h2>
              <p>Try adjusting your filters or search another route.</p>
              <button type="button" className="primary" onClick={reset}>Reset filters</button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
