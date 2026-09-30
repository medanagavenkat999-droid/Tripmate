import { useState } from "react";
import type { Trip } from "../lib/api";

const FALLBACK_IMAGES: Record<string, string> = {
  bus: "/tripmate-assets/bus.jpg",
  train: "/tripmate-assets/train.jpg",
  flight: "/tripmate-assets/flight.jpg",
  hotel: "/tripmate-assets/hotel.jpg",
};

function safePrice(value: unknown) {
  const n = typeof value === "number" ? value : Number(String(value ?? "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export default function TripCard({
  trip,
  onBook,
  onDetails,
  currency = "INR",
  convert
}: {
  trip: Trip;
  onBook: (trip: Trip) => void;
  onDetails?: (trip: Trip) => void;
  currency?: string;
  convert?: (n: number) => number;
}) {
  const [saved, setSaved] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("tripmate_wishlist") || "[]").some((x: any) => x.id === trip.id);
    } catch {
      return false;
    }
  });

  const rawPrice = safePrice(trip.price);
  const convertedPrice = convert ? convert(rawPrice) : rawPrice;
  const price = Number.isFinite(convertedPrice) ? convertedPrice : 0;
  const operator = String(trip.operator || "TripMate");
  const tags = Array.isArray(trip.tags) ? trip.tags.filter(Boolean) : [];
  const image = trip.image || FALLBACK_IMAGES[trip.mode] || FALLBACK_IMAGES.bus;

  const toggle = () => {
    try {
      const old = JSON.parse(localStorage.getItem("tripmate_wishlist") || "[]");
      const next = saved
        ? old.filter((x: any) => x.id !== trip.id)
        : [...old, trip];
      localStorage.setItem("tripmate_wishlist", JSON.stringify(next));
      setSaved(!saved);
    } catch {
      // Keep the card usable even if localStorage is unavailable.
    }
  };

  return (
    <article className="trip-card reveal">
      <div className="trip-image-wrap">
        <img
          className="trip-image"
          src={image}
          alt={`${operator} ${trip.title}`}
          onError={(e) => {
            const target = e.currentTarget;
            const fallback = FALLBACK_IMAGES[trip.mode] || FALLBACK_IMAGES.bus;
            if (target.src !== new URL(fallback, window.location.href).href) target.src = fallback;
          }}
        />
        <div className="trip-image-overlay">
          <span>{trip.mode.toUpperCase()}</span>
          <span className={trip.live ? "live-badge" : "scheduled-badge"}>
            {trip.live ? "● Live" : "Scheduled"}
          </span>
        </div>
        <button
          type="button"
          className={saved ? "heart saved trip-heart" : "heart trip-heart"}
          onClick={toggle}
          aria-label={saved ? "Remove saved trip" : "Save trip"}
        >
          {saved ? "♥" : "♡"}
        </button>
      </div>

      <div className="trip-main">
        <div className="operator">
          <div className="operator-logo">{operator.slice(0, 2).toUpperCase()}</div>
          <div>
            <strong>{operator}</strong>
            <small>{trip.title || "Travel option"}</small>
          </div>
        </div>

        <div className="route">
          <div>
            <strong>{trip.depart || "--:--"}</strong>
            <small>{trip.from || "Origin"}</small>
          </div>
          <div className="route-line">
            <span>{trip.duration || "—"}</span>
            <i />
            <small>{trip.live ? "Live tracking" : "Scheduled"}</small>
          </div>
          <div>
            <strong>{trip.arrive || "--:--"}</strong>
            <small>{trip.to || "Destination"}</small>
          </div>
        </div>

        <div className="trip-price">
          <small>Starting from</small>
          <strong>{currency} {price.toLocaleString("en-IN")}</strong>
          <span>★ {Number(trip.rating || 0).toFixed(1)}</span>
          <em className="deal-badge">Good deal · Demo estimate</em>
        </div>
      </div>

      <div className="trip-meta">
        <span>● {trip.status || "Scheduled"}</span>
        {tags.map((tag) => <span key={tag}>{tag}</span>)}
        <span>{Math.max(0, Number(trip.seats) || 0)} seats</span>
        <div className="trip-actions">
          {onDetails && (
            <button type="button" className="ghost small" onClick={() => onDetails(trip)}>
              Details
            </button>
          )}
          <button type="button" className="primary small" onClick={() => onBook(trip)}>
            Book
          </button>
        </div>
      </div>
    </article>
  );
}
