import { useMemo, useState } from "react";
import type { Trip } from "../lib/api";
import { createBooking } from "../lib/api";

export default function Booking({ trip, onDone, onBack }: { trip: Trip; onDone: (b: any) => void; onBack: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [seats, setSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const unavailable = useMemo(() => new Set(["03", "07", "14", "19"]), []);
  const toggle = (s: string) => {
    if (unavailable.has(s)) return;
    setSeats((v) => v.includes(s) ? v.filter((x) => x !== s) : v.length < 6 ? [...v, s] : v);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !seats.length) {
      setError("Enter passenger details and select at least one available seat.");
      return;
    }
    setLoading(true); setError("");
    try {
      const b = await createBooking({ tripId: trip.id, passengerName: name.trim(), email: email.trim(), seats, price: trip.price });
      const old = JSON.parse(localStorage.getItem("tripmate_bookings") || "[]");
      localStorage.setItem("tripmate_bookings", JSON.stringify([b, ...old]));
      onDone(b);
    } catch {
      setError("Booking service unavailable. Please try again.");
    } finally { setLoading(false); }
  };

  return <main className="page">
    <button type="button" className="back" onClick={onBack}>← Results</button>
    <div className="booking-layout">
      <section>
        <span className="eyebrow">SELECT & CONFIRM</span>
        <h1>Complete your booking</h1>
        <div className="seat-panel">
          <h3>Choose seats <small className="muted">({seats.length}/6 selected)</small></h3>
          <div className="seat-legend"><span><i className="legend-free" /> Available</span><span><i className="legend-used" /> Occupied</span><span><i className="legend-selected" /> Selected</span></div>
          <div className="seat-grid">{Array.from({ length: 24 }, (_, i) => {
            const s = String(i + 1).padStart(2, "0");
            const used = unavailable.has(s);
            return <button type="button" key={s} disabled={used} className={used ? "seat used" : seats.includes(s) ? "seat selected" : "seat"} onClick={() => toggle(s)}>{s}</button>;
          })}</div>
        </div>
        <form className="passenger" onSubmit={submit}>
          <h3>Passenger details</h3>
          <input required placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
          <input required placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          {error && <p className="error">{error}</p>}
          <button type="submit" className="primary wide" disabled={loading}>{loading ? "Confirming…" : `Confirm & book · ₹${(trip.price * Math.max(seats.length, 1)).toLocaleString("en-IN")}`}</button>
        </form>
      </section>
      <aside className="summary">
        <span className="eyebrow">YOUR TRIP</span>
        <h2>{trip.from} → {trip.to}</h2>
        <p>{trip.operator} · {trip.title}</p>
        <div className="summary-row"><span>Departure</span><strong>{trip.depart}</strong></div>
        <div className="summary-row"><span>Arrival</span><strong>{trip.arrive}</strong></div>
        <div className="summary-row"><span>Seats</span><strong>{seats.join(", ") || "—"}</strong></div>
        <hr />
        <div className="summary-row total"><span>Total</span><strong>₹{(trip.price * Math.max(seats.length, 1)).toLocaleString("en-IN")}</strong></div>
      </aside>
    </div>
  </main>;
}
