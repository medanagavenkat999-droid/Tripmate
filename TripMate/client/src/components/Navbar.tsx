import { useEffect, useState } from "react";

type Props = { active: string; onNavigate: (key: string) => void; currency: string; onCurrency: (currency: string) => void };

export default function Navbar({ active, onNavigate, currency, onCurrency }: Props) {
  const [open, setOpen] = useState(false);
  const [light, setLight] = useState(document.body.classList.contains("light"));
  const items = [["home", "Home"], ["bus", "Bus"], ["train", "Train"], ["flight", "Flight"], ["hotel", "Hotels"], ["planner", "Planner"], ["trips", "My Trips"], ["community", "Community"], ["assistant", "AI"]];
  useEffect(() => { const saved = localStorage.getItem("tripmate_theme"); if (saved === "light") { document.body.classList.add("light"); setLight(true); } }, []);
  const toggleTheme = () => { const next = !document.body.classList.contains("light"); document.body.classList.toggle("light", next); localStorage.setItem("tripmate_theme", next ? "light" : "dark"); setLight(next); };
  return <header className="nav">
    <div className="nav-inner">
      <button className="brand" onClick={() => onNavigate("home")}><span className="brand-mark">✈</span>Trip<span>Mate</span></button>
      <button className="mobile-menu" onClick={() => setOpen(v => !v)} aria-label="Open menu">☰</button>
      <nav className={open ? "nav-links open" : "nav-links"}>{items.map(([key, label]) => <button key={key} className={active === key ? "nav-link active" : "nav-link"} onClick={() => { onNavigate(key); setOpen(false); }}>{label}</button>)}</nav>
      <div className="nav-actions">
        <select className="currency-select" value={currency} onChange={e => onCurrency(e.target.value)} aria-label="Currency"><option value="INR">₹ INR</option><option value="USD">$ USD</option><option value="EUR">€ EUR</option><option value="GBP">£ GBP</option></select>
        <button className="icon-btn" aria-label="Toggle theme" onClick={toggleTheme}>{light ? "☀" : "◐"}</button>
        <button className="login-btn" onClick={() => onNavigate("login")}>Log in</button>
        <button className="signup-btn" onClick={() => onNavigate("login")}>Sign up</button>
      </div>
    </div>
  </header>;
}
