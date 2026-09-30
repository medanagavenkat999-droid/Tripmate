export type Mode = "bus" | "train" | "flight" | "hotel";

export type Trip = {
  id: string;
  mode: Mode;
  operator: string;
  title: string;
  from: string;
  to: string;
  depart: string;
  arrive: string;
  duration: string;
  price: number;
  currency: string;
  rating: number;
  seats: number;
  status: string;
  live: boolean;
  tags: string[];
  image?: string;
};

function textValue(value: unknown, fallback: string, max = 120) {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  const escapedJson = (text.match(/\\"/g) || []).length > 3;
  if (!text || escapedJson || ((text.startsWith("{") || text.startsWith("[")) && text.length > 40)) return fallback;
  return text.slice(0, max);
}

function numberValue(value: unknown, fallback = 0) {
  const n = typeof value === "number" ? value : Number(String(value ?? "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : fallback;
}

function normalizeTrip(raw: any, index: number): Trip {
  const mode: Mode = ["bus", "train", "flight", "hotel"].includes(raw?.mode) ? raw.mode : "bus";
  return {
    id: String(raw?.id ?? `${mode}-${Date.now()}-${index}`),
    mode,
    operator: textValue(raw?.operator ?? raw?.provider, "TripMate"),
    title: textValue(raw?.title ?? raw?.name, "Travel option"),
    from: textValue(raw?.from, ""),
    to: textValue(raw?.to, ""),
    depart: textValue(raw?.depart ?? raw?.departure, "--:--", 30),
    arrive: textValue(raw?.arrive ?? raw?.arrival, "--:--", 30),
    duration: textValue(raw?.duration, "—", 40),
    price: Math.max(0, numberValue(raw?.price)),
    currency: String(raw?.currency ?? "INR"),
    rating: Math.max(0, Math.min(5, numberValue(raw?.rating))),
    seats: Math.max(0, Math.round(numberValue(raw?.seats ?? raw?.availableSeats))),
    status: textValue(raw?.status ?? (raw?.live ? "On schedule" : "Scheduled"), raw?.live ? "On schedule" : "Scheduled", 60),
    live: Boolean(raw?.live),
    tags: Array.isArray(raw?.tags) ? raw.tags.map((x: unknown) => String(x)).filter(Boolean).slice(0, 6) : [],
    image: typeof raw?.image === "string" && raw.image.trim() ? raw.image.trim() : undefined
  };
}

export async function searchTrips(params: { mode: Mode; from: string; to: string; date: string; passengers?: number }): Promise<{ trips: Trip[]; source: string }> {
  const q = new URLSearchParams({
    mode: params.mode,
    from: params.from,
    to: params.to,
    date: params.date,
    passengers: String(params.passengers || 1)
  });
  const res = await fetch(`/api/search?${q.toString()}`);
  if (!res.ok) throw new Error("Unable to search trips");
  const data = await res.json();
  return {
    trips: Array.isArray(data?.trips) ? data.trips.map(normalizeTrip) : [],
    source: String(data?.source ?? "Demo provider")
  };
}

export async function createBooking(payload: {
  tripId: string;
  passengerName: string;
  email: string;
  seats: string[];
  price?: number;
  passengers?: number;
  paymentMethod?: string;
}) {
  const res = await fetch("/api/bookings", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Unable to create booking");
  return res.json();
}

export async function askAssistant(message: string) {
  const res = await fetch("/api/assistant", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({message})
  });
  if (!res.ok) throw new Error("Assistant unavailable");
  return res.json();
}
